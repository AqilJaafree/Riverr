// File: sources/rivier.move
module riverr_contract::riverr_contract {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::event;
    use std::string::{Self, String};
    use sui::table::{Self, Table};
    use std::vector;
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::math;
    
    // Import Pyth Network modules
    use pyth::pyth;
    use pyth::price_info::{Self, PriceInfoObject};
    use pyth::price::{Self, Price};
    use pyth::i64::{Self, I64};
    
    // Pyth price feed IDs (Testnet - replace with mainnet IDs for production)
    const WBTC_USD_PRICE_FEED_ID: vector<u8> = x"c9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33";
    const SUI_USD_PRICE_FEED_ID: vector<u8> = x"23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744";
    
    // Pool address constants
    const WBTC_SUI_POOL_1: address = @0xe0c526aa27d1729931d0051a318d795ad0299998898e4287d9da1bf095b49658;
    const WBTC_SUI_POOL_2: address = @0x0fb4ad0e4c2c2b0a45d3f7bc5585cc9cea8486a63e4ef5cb768ddd9414fbb97a;
    const SUI_POOL_3: address = @0xd7d53e235c8a1db5e30bbde563053490db9b876ec8752b9053fee33ed845843b;
    const SUI_POOL_4: address = @0xe71aa89df60e737f1b687f8dfbd51e2a9b35706e9e5540ce9b053bd53fcb9ec3;
    
    // Error codes
    const EInsufficientBalance: u64 = 0;
    const EInvalidPool: u64 = 1;
    const EInvalidWithdrawal: u64 = 2;
    const EAdminOnly: u64 = 3;
    const EPriceStale: u64 = 4;
    const EPriceNotFound: u64 = 5;
    const ESlippageExceeded: u64 = 6;
    const EInvalidPriceRatio: u64 = 7;
    const EZeroAmount: u64 = 8;
    
    // Constants for calculations
    const PRECISION: u64 = 1_000_000_000; // 1e9 for price calculations
    const MAX_STALENESS: u64 = 60; // 60 seconds max staleness
    const SLIPPAGE_TOLERANCE: u64 = 1000; // 10% max slippage in basis points
    const BASIS_POINTS: u64 = 10000; // 100% = 10000 basis points
    
    /// Enhanced LP Token with price information
    public struct LPToken<phantom CoinType> has key, store {
        id: UID,
        pool_address: address,
        pool_name: String,
        coin_amount: u64,
        sui_amount: u64,
        fee_tier: u64,
        lp_share: u64,
        timestamp: u64,
        // New fields for Pyth integration
        entry_coin_price: u64,    // Price when LP was created
        entry_sui_price: u64,     // SUI price when LP was created
        total_value_usd: u64,     // Total USD value at entry
    }
    
    /// Enhanced Pool Registry with Pyth integration
    public struct PoolRegistry has key {
        id: UID,
        admin: address,
        total_sui: Balance<SUI>,
        pool_info: Table<address, PoolInfo>,
        // New fields for Pyth
        pyth_state: address,      // Pyth state object address
        price_feeds: Table<String, vector<u8>>, // Token symbol to Pyth feed ID mapping
        total_liquidity_tracking: Table<address, u64>, // Track total liquidity per pool
    }

    /// Enhanced Pool Information with price data
    public struct PoolInfo has store, copy, drop {
        name: String,
        fee_tier: u64,
        total_liquidity_usd: u64,
        is_active: bool,
        // New price-related fields
        last_price_update: u64,
        current_apy: u64,         // APY in basis points
        impermanent_loss_risk: u64, // Risk level 1-100
        price_volatility: u64,    // Volatility measure
    }
    
    /// Price information struct
    public struct PriceData has copy, drop, store {
        price: u64,
        confidence: u64,
        timestamp: u64,
        expo: I64,
    }
    
    /// Enhanced events with price information
    public struct LiquidityProvided<phantom CoinType> has copy, drop {
        provider: address,
        pool_address: address,
        pool_name: String,
        coin_amount: u64,
        sui_amount: u64,
        fee_tier: u64,
        lp_share: u64,
        timestamp: u64,
        // New price fields
        coin_price_usd: u64,
        sui_price_usd: u64,
        total_value_usd: u64,
        expected_apy: u64,
    }
    
    public struct LiquidityWithdrawn<phantom CoinType> has copy, drop {
        provider: address,
        pool_address: address,
        coin_amount: u64,
        sui_amount: u64,
        timestamp: u64,
        // New fields for PnL calculation
        entry_value_usd: u64,
        exit_value_usd: u64,
        impermanent_loss: u64,    // IL in basis points
        fees_earned: u64,
    }
    
    /// Price update event
    public struct PriceUpdated has copy, drop {
        token_symbol: String,
        old_price: u64,
        new_price: u64,
        timestamp: u64,
        confidence: u64,
    }
    
    /// Initialize the enhanced pool registry with Pyth integration
    fun init(ctx: &mut TxContext) {
        let mut price_feeds = table::new<String, vector<u8>>(ctx);
        
        // Initialize price feed mappings
        table::add(&mut price_feeds, string::utf8(b"WBTC"), WBTC_USD_PRICE_FEED_ID);
        table::add(&mut price_feeds, string::utf8(b"SUI"), SUI_USD_PRICE_FEED_ID);
        
        let registry = PoolRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            total_sui: balance::zero<SUI>(),
            pool_info: table::new(ctx),
            pyth_state: @0x0, // Will be set by admin after deployment
            price_feeds,
            total_liquidity_tracking: table::new(ctx),
        };
        
        // Register enhanced pools with price data
        let pool_info_table = &mut registry.pool_info;
        table::add(pool_info_table, WBTC_SUI_POOL_1, PoolInfo {
            name: string::utf8(b"WBTC/SUI Main Pool"),
            fee_tier: 30, // 0.30%
            total_liquidity_usd: 0,
            is_active: true,
            last_price_update: 0,
            current_apy: 1200, // 12% APY
            impermanent_loss_risk: 25, // Medium risk
            price_volatility: 15,
        });
        
        table::add(pool_info_table, WBTC_SUI_POOL_2, PoolInfo {
            name: string::utf8(b"WBTC/SUI Low Fee Pool"),
            fee_tier: 25, // 0.25%
            total_liquidity_usd: 0,
            is_active: true,
            last_price_update: 0,
            current_apy: 800, // 8% APY
            impermanent_loss_risk: 20, // Lower risk
            price_volatility: 12,
        });
        
        table::add(pool_info_table, SUI_POOL_3, PoolInfo {
            name: string::utf8(b"SUI High Yield Pool"),
            fee_tier: 30, // 0.30%
            total_liquidity_usd: 0,
            is_active: true,
            last_price_update: 0,
            current_apy: 1500, // 15% APY
            impermanent_loss_risk: 35, // Higher risk
            price_volatility: 20,
        });
        
        table::add(pool_info_table, SUI_POOL_4, PoolInfo {
            name: string::utf8(b"SUI Stable Pool"),
            fee_tier: 10, // 0.10%
            total_liquidity_usd: 0,
            is_active: true,
            last_price_update: 0,
            current_apy: 600, // 6% APY
            impermanent_loss_risk: 10, // Low risk
            price_volatility: 8,
        });
        
        transfer::share_object(registry);
    }

    /// Set Pyth state object address (admin only)
    public entry fun set_pyth_state(
        registry: &mut PoolRegistry,
        pyth_state: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, EAdminOnly);
        registry.pyth_state = pyth_state;
    }
    
    /// Get price from Pyth network
    public fun get_pyth_price(
        pyth_state: &pyth::state::State,
        price_feed_id: vector<u8>,
        clock: &Clock
    ): PriceData {
        let price_info_object = pyth::get_price_info_object(pyth_state, price_feed_id);
        let price_info = price_info::get_price_info(&price_info_object);
        let price = price_info::get_price(&price_info);
        
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        let price_timestamp = price::get_timestamp(&price);
        
        // Check if price is stale
        assert!(current_time - price_timestamp <= MAX_STALENESS, EPriceStale);
        
        PriceData {
            price: (price::get_price(&price) as u64),
            confidence: price::get_conf(&price),
            timestamp: price_timestamp,
            expo: price::get_expo(&price),
        }
    }
    
    /// Calculate LP share based on current prices
    public fun calculate_lp_share(
        coin_amount: u64,
        sui_amount: u64,
        coin_price: u64,
        sui_price: u64,
        pool_total_value: u64
    ): u64 {
        if (pool_total_value == 0) {
            return PRECISION; // First LP gets 100% share
        };
        
        let coin_value = (coin_amount * coin_price) / PRECISION;
        let sui_value = (sui_amount * sui_price) / PRECISION;
        let total_deposit_value = coin_value + sui_value;
        
        // Calculate share as proportion of total pool value
        (total_deposit_value * PRECISION) / pool_total_value
    }
    
    /// Enhanced liquidity provision with Pyth prices
    public entry fun provide_liquidity<CoinType>(
        registry: &mut PoolRegistry,
        pool_address: address,
        coin_in: Coin<CoinType>,
        sui: Coin<SUI>,
        pyth_state: &pyth::state::State,
        clock: &Clock,
        max_slippage_bps: u64, // Maximum acceptable slippage in basis points
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(table::contains(&registry.pool_info, pool_address), EInvalidPool);
        let pool_info = table::borrow(&registry.pool_info, pool_address);
        assert!(pool_info.is_active, EInvalidPool);
        assert!(max_slippage_bps <= SLIPPAGE_TOLERANCE, ESlippageExceeded);
        
        let coin_amount = coin::value(&coin_in);
        let sui_amount = coin::value(&sui);
        assert!(coin_amount > 0 && sui_amount > 0, EZeroAmount);
        
        // Get current prices from Pyth
        let wbtc_feed_id = *table::borrow(&registry.price_feeds, string::utf8(b"WBTC"));
        let sui_feed_id = *table::borrow(&registry.price_feeds, string::utf8(b"SUI"));
        
        let wbtc_price_data = get_pyth_price(pyth_state, wbtc_feed_id, clock);
        let sui_price_data = get_pyth_price(pyth_state, sui_feed_id, clock);
        
        // Calculate USD values
        let coin_value_usd = (coin_amount * wbtc_price_data.price) / PRECISION;
        let sui_value_usd = (sui_amount * sui_price_data.price) / PRECISION;
        let total_value_usd = coin_value_usd + sui_value_usd;
        
        // Get current pool total value
        let pool_total_value = if (table::contains(&registry.total_liquidity_tracking, pool_address)) {
            *table::borrow(&registry.total_liquidity_tracking, pool_address)
        } else {
            0
        };
        
        // Calculate LP share
        let lp_share = calculate_lp_share(
            coin_amount,
            sui_amount,
            wbtc_price_data.price,
            sui_price_data.price,
            pool_total_value
        );
        
        // Update pool tracking
        if (table::contains(&registry.total_liquidity_tracking, pool_address)) {
            let current_total = table::borrow_mut(&mut registry.total_liquidity_tracking, pool_address);
            *current_total = *current_total + total_value_usd;
        } else {
            table::add(&mut registry.total_liquidity_tracking, pool_address, total_value_usd);
        };
        
        // Add SUI to registry
        balance::join(&mut registry.total_sui, coin::into_balance(sui));
        
        // Create enhanced LP token
        let lp_token = LPToken<CoinType> {
            id: object::new(ctx),
            pool_address,
            pool_name: pool_info.name,
            coin_amount,
            sui_amount,
            fee_tier: pool_info.fee_tier,
            lp_share,
            timestamp: clock::timestamp_ms(clock) / 1000,
            entry_coin_price: wbtc_price_data.price,
            entry_sui_price: sui_price_data.price,
            total_value_usd,
        };
        
        // Transfer original coin back to user (simplified demo model)
        transfer::public_transfer(coin_in, tx_context::sender(ctx));
        transfer::transfer(lp_token, tx_context::sender(ctx));
        
        // Update pool info with latest prices
        let pool_info_mut = table::borrow_mut(&mut registry.pool_info, pool_address);
        pool_info_mut.last_price_update = clock::timestamp_ms(clock) / 1000;
        pool_info_mut.total_liquidity_usd = pool_info_mut.total_liquidity_usd + total_value_usd;
        
        // Emit enhanced event
        event::emit(LiquidityProvided<CoinType> {
            provider: tx_context::sender(ctx),
            pool_address,
            pool_name: pool_info.name,
            coin_amount,
            sui_amount,
            fee_tier: pool_info.fee_tier,
            lp_share,
            timestamp: clock::timestamp_ms(clock) / 1000,
            coin_price_usd: wbtc_price_data.price,
            sui_price_usd: sui_price_data.price,
            total_value_usd,
            expected_apy: pool_info.current_apy,
        });
    }
    
    /// Enhanced withdrawal with impermanent loss calculation
    public entry fun withdraw_liquidity<CoinType>(
        registry: &mut PoolRegistry,
        lp_token: LPToken<CoinType>,
        pyth_state: &pyth::state::State,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let LPToken {
            id,
            pool_address,
            pool_name: _,
            coin_amount,
            sui_amount,
            fee_tier: _,
            lp_share: _,
            timestamp: _,
            entry_coin_price,
            entry_sui_price,
            total_value_usd: entry_value_usd,
        } = lp_token;
        
        // Get current prices
        let wbtc_feed_id = *table::borrow(&registry.price_feeds, string::utf8(b"WBTC"));
        let sui_feed_id = *table::borrow(&registry.price_feeds, string::utf8(b"SUI"));
        
        let current_wbtc_price = get_pyth_price(pyth_state, wbtc_feed_id, clock);
        let current_sui_price = get_pyth_price(pyth_state, sui_feed_id, clock);
        
        // Calculate current value
        let current_coin_value = (coin_amount * current_wbtc_price.price) / PRECISION;
        let current_sui_value = (sui_amount * current_sui_price.price) / PRECISION;
        let exit_value_usd = current_coin_value + current_sui_value;
        
        // Calculate impermanent loss
        let impermanent_loss = calculate_impermanent_loss(
            entry_coin_price,
            entry_sui_price,
            current_wbtc_price.price,
            current_sui_price.price,
            coin_amount,
            sui_amount
        );
        
        // Calculate fees earned (simplified - 1% of entry value)
        let fees_earned = (entry_value_usd * 100) / BASIS_POINTS;
        
        // Update pool tracking
        if (table::contains(&registry.total_liquidity_tracking, pool_address)) {
            let current_total = table::borrow_mut(&mut registry.total_liquidity_tracking, pool_address);
            if (*current_total >= entry_value_usd) {
                *current_total = *current_total - entry_value_usd;
            } else {
                *current_total = 0;
            };
        };
        
        // Delete LP token
        object::delete(id);
        
        // Return SUI to user
        let sui_to_return = balance::split(&mut registry.total_sui, sui_amount);
        let sui_coin = coin::from_balance(sui_to_return, ctx);
        transfer::public_transfer(sui_coin, tx_context::sender(ctx));
        
        // Emit withdrawal event with PnL data
        event::emit(LiquidityWithdrawn<CoinType> {
            provider: tx_context::sender(ctx),
            pool_address,
            coin_amount,
            sui_amount,
            timestamp: clock::timestamp_ms(clock) / 1000,
            entry_value_usd,
            exit_value_usd,
            impermanent_loss,
            fees_earned,
        });
    }
    
    /// Calculate impermanent loss
    fun calculate_impermanent_loss(
        entry_coin_price: u64,
        entry_sui_price: u64,
        current_coin_price: u64,
        current_sui_price: u64,
        _coin_amount: u64,
        _sui_amount: u64
    ): u64 {
        // Calculate price ratios
        let entry_ratio = (entry_coin_price * PRECISION) / entry_sui_price;
        let current_ratio = (current_coin_price * PRECISION) / current_sui_price;
        
        if (entry_ratio == 0 || current_ratio == 0) {
            return 0;
        };
        
        // Simplified impermanent loss calculation
        // IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
        let ratio_change = if (current_ratio > entry_ratio) {
            (current_ratio * PRECISION) / entry_ratio
        } else {
            (entry_ratio * PRECISION) / current_ratio
        };
        
        // Simplified IL calculation (in basis points)
        if (ratio_change > PRECISION * 2) {
            2000 // 20% max IL for extreme price changes
        } else if (ratio_change > PRECISION * 150 / 100) {
            1000 // 10% IL for significant changes
        } else if (ratio_change > PRECISION * 120 / 100) {
            500  // 5% IL for moderate changes
        } else {
            100  // 1% IL for small changes
        }
    }
    
    /// Get pool analytics with current prices
    public fun get_pool_analytics(
        registry: &PoolRegistry,
        pool_address: address,
        pyth_state: &pyth::state::State,
        clock: &Clock
    ): (PoolInfo, u64, u64) {
        assert!(table::contains(&registry.pool_info, pool_address), EInvalidPool);
        
        let pool_info = *table::borrow(&registry.pool_info, pool_address);
        
        // Get current prices
        let wbtc_feed_id = *table::borrow(&registry.price_feeds, string::utf8(b"WBTC"));
        let sui_feed_id = *table::borrow(&registry.price_feeds, string::utf8(b"SUI"));
        
        let wbtc_price = get_pyth_price(pyth_state, wbtc_feed_id, clock);
        let sui_price = get_pyth_price(pyth_state, sui_feed_id, clock);
        
        (pool_info, wbtc_price.price, sui_price.price)
    }
    
    /// Update pool analytics (admin function)
    public entry fun update_pool_analytics(
        registry: &mut PoolRegistry,
        pool_address: address,
        new_apy: u64,
        new_risk_level: u64,
        new_volatility: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, EAdminOnly);
        assert!(table::contains(&registry.pool_info, pool_address), EInvalidPool);
        
        let pool_info = table::borrow_mut(&mut registry.pool_info, pool_address);
        pool_info.current_apy = new_apy;
        pool_info.impermanent_loss_risk = new_risk_level;
        pool_info.price_volatility = new_volatility;
    }
    
    /// Get all available pools
    public fun get_available_pools(registry: &PoolRegistry): vector<address> {
        let active_pools = vector::empty<address>();
        
        let pools_to_check = vector::empty<address>();
        vector::push_back(&mut pools_to_check, WBTC_SUI_POOL_1);
        vector::push_back(&mut pools_to_check, WBTC_SUI_POOL_2);
        vector::push_back(&mut pools_to_check, SUI_POOL_3);
        vector::push_back(&mut pools_to_check, SUI_POOL_4);
        
        let mut i = 0;
        let len = vector::length(&pools_to_check);
        
        while (i < len) {
            let pool_address = *vector::borrow(&pools_to_check, i);
            
            if (table::contains(&registry.pool_info, pool_address)) {
                let pool_info = table::borrow(&registry.pool_info, pool_address);
                if (pool_info.is_active) {
                    vector::push_back(&mut active_pools, pool_address);
                };
            };
            
            i = i + 1;
        };
        
        active_pools
    }
    
    /// Get pool information
    public fun get_pool_info(registry: &PoolRegistry, pool_address: address): PoolInfo {
        assert!(table::contains(&registry.pool_info, pool_address), EInvalidPool);
        *table::borrow(&registry.pool_info, pool_address)
    }
    
    /// Emergency pause function (admin only)
    public entry fun emergency_pause(
        registry: &mut PoolRegistry,
        pool_address: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, EAdminOnly);
        assert!(table::contains(&registry.pool_info, pool_address), EInvalidPool);
        
        let pool_info = table::borrow_mut(&mut registry.pool_info, pool_address);
        pool_info.is_active = false;
    }
    
    /// Resume pool (admin only)
    public entry fun resume_pool(
        registry: &mut PoolRegistry,
        pool_address: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, EAdminOnly);
        assert!(table::contains(&registry.pool_info, pool_address), EInvalidPool);
        
        let pool_info = table::borrow_mut(&mut registry.pool_info, pool_address);
        pool_info.is_active = true;
    }
    
    /// Helper function to validate if a pool address is in the registry and active
    public fun is_valid_active_pool(registry: &PoolRegistry, pool_address: address): bool {
        if (!table::contains(&registry.pool_info, pool_address)) {
            return false
        };
        
        let pool_info = table::borrow(&registry.pool_info, pool_address);
        pool_info.is_active
    }
}