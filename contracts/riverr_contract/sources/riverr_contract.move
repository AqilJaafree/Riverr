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
    use sui::sui::SUI; // Import SUI coin type
    
    // Define pool address constants to match with Gecko Terminal data
    const WBTC_SUI_POOL_1: address = @0xe0c526aa27d1729931d0051a318d795ad0299998898e4287d9da1bf095b49658;
    const WBTC_SUI_POOL_2: address = @0x0fb4ad0e4c2c2b0a45d3f7bc5585cc9cea8486a63e4ef5cb768ddd9414fbb97a;
    const SUI_POOL_3: address = @0xd7d53e235c8a1db5e30bbde563053490db9b876ec8752b9053fee33ed845843b;
    const SUI_POOL_4: address = @0xe71aa89df60e737f1b687f8dfbd51e2a9b35706e9e5540ce9b053bd53fcb9ec3;
    
    // Error codes
    const EInvalidPool: u64 = 1;
    #[allow(unused_const)]
    const EInvalidWithdrawal: u64 = 2;
    const EAdminOnly: u64 = 3;
    
    /// LP Token that represents a user's position in the pool
    struct LPToken<phantom CoinType> has key, store {
        id: UID,
        pool_address: address,
        pool_name: String,
        coin_amount: u64,
        sui_amount: u64,
        fee_tier: u64,  // Store fee tier in basis points (e.g., 25 = 0.25%)
        lp_share: u64,  // Share of the pool in basis points
        timestamp: u64, // When the LP position was created
    }
    
    /// Pool Registry - stores information about available pools
    struct PoolRegistry has key {
        id: UID,
        admin: address,
        // Store SUI balance
        total_sui: Balance<SUI>,
        // Track pools and their respective fee tiers
        pool_info: Table<address, PoolInfo>
    }

    /// Pool information
    struct PoolInfo has store, copy, drop {
        name: String, 
        fee_tier: u64,
        total_liquidity_usd: u64,
        is_active: bool
    }
    
    /// Event emitted when liquidity is provided
    struct LiquidityProvided<phantom CoinType> has copy, drop {
        provider: address,
        pool_address: address,
        pool_name: String,
        coin_amount: u64,
        sui_amount: u64,
        fee_tier: u64,
        lp_share: u64,
        timestamp: u64,
    }
    
    /// Event emitted when liquidity is withdrawn
    struct LiquidityWithdrawn<phantom CoinType> has copy, drop {
        provider: address,
        pool_address: address,
        coin_amount: u64,
        sui_amount: u64,
        timestamp: u64,
    }
    
    /// Initialize the pool registry
    fun init(ctx: &mut TxContext) {
        let registry = PoolRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            total_sui: balance::zero<SUI>(),
            pool_info: table::new(ctx)
        };
        
        // Register the default pools
        let pool_info_table = &mut registry.pool_info;
        table::add(pool_info_table, WBTC_SUI_POOL_1, PoolInfo {
            name: string::utf8(b"WBTC/SUI Main Pool"),
            fee_tier: 30, // 0.30%
            total_liquidity_usd: 0, // Will be updated later
            is_active: true
        });
        
        table::add(pool_info_table, WBTC_SUI_POOL_2, PoolInfo {
            name: string::utf8(b"WBTC/SUI 0.25% Pool"),
            fee_tier: 25, // 0.25%
            total_liquidity_usd: 0,
            is_active: true
        });
        
        table::add(pool_info_table, SUI_POOL_3, PoolInfo {
            name: string::utf8(b"SUI Pool 3"),
            fee_tier: 30, // 0.30%
            total_liquidity_usd: 0,
            is_active: true
        });
        
        table::add(pool_info_table, SUI_POOL_4, PoolInfo {
            name: string::utf8(b"SUI Pool 4"),
            fee_tier: 10, // 0.10%
            total_liquidity_usd: 0,
            is_active: true
        });
        
        transfer::share_object(registry);
    }

    /// Provides liquidity to a selected pool using any coin type
    public entry fun provide_liquidity<CoinType>(
        registry: &mut PoolRegistry,
        pool_address: address,
        coin_in: Coin<CoinType>,
        sui: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Validate the pool
        assert!(table::contains(&registry.pool_info, pool_address), EInvalidPool);
        let pool_info = table::borrow(&registry.pool_info, pool_address);
        assert!(pool_info.is_active, EInvalidPool);
        
        // Get amounts
        let coin_amount = coin::value(&coin_in);
        let sui_amount = coin::value(&sui);
        
        // Add SUI to registry
        balance::join(&mut registry.total_sui, coin::into_balance(sui));
        
        // For demo, we're using a simple calculation (in a real contract this would be more complex)
        let lp_share = 10000; // 100% of your own contribution, simplified model
        let timestamp = tx_context::epoch(ctx);
        
        // Create LP token for the user
        let lp_token = LPToken<CoinType> {
            id: object::new(ctx),
            pool_address,
            pool_name: pool_info.name,
            coin_amount,
            sui_amount,
            fee_tier: pool_info.fee_tier,
            lp_share,
            timestamp,
        };
        
        // Transfer LP token and original token to the user
        transfer::public_transfer(coin_in, tx_context::sender(ctx)); // Return the original token
        transfer::transfer(lp_token, tx_context::sender(ctx));
        
        // Emit event
        event::emit(LiquidityProvided<CoinType> {
            provider: tx_context::sender(ctx),
            pool_address,
            pool_name: pool_info.name,
            coin_amount,
            sui_amount,
            fee_tier: pool_info.fee_tier,
            lp_share,
            timestamp,
        });
    }
    
    /// Withdraws liquidity from a pool using LP token
    public entry fun withdraw_liquidity<CoinType>(
        registry: &mut PoolRegistry,
        lp_token: LPToken<CoinType>,
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
            timestamp: _
        } = lp_token;
        
        // Delete the LP token
        object::delete(id);
        
        // Return SUI to the user
        let sui_to_return = balance::split(&mut registry.total_sui, sui_amount);
        let sui_coin = coin::from_balance(sui_to_return, ctx);
        
        // Transfer SUI back to the user
        transfer::public_transfer(sui_coin, tx_context::sender(ctx));
        
        // Emit event
        event::emit(LiquidityWithdrawn<CoinType> {
            provider: tx_context::sender(ctx),
            pool_address,
            coin_amount,
            sui_amount,
            timestamp: tx_context::epoch(ctx),
        });
    }

    /// Update pool information (admin only)
    public entry fun update_pool_info(
        registry: &mut PoolRegistry,
        pool_address: address,
        fee_tier: u64,
        total_liquidity_usd: u64,
        is_active: bool,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.admin, EAdminOnly);
        assert!(table::contains(&registry.pool_info, pool_address), EInvalidPool);
        
        let pool_info = table::borrow_mut(&mut registry.pool_info, pool_address);
        pool_info.fee_tier = fee_tier;
        pool_info.total_liquidity_usd = total_liquidity_usd;
        pool_info.is_active = is_active;
    }
    
    /// View function to get available pools
    public fun get_available_pools(registry: &PoolRegistry): vector<address> {
        let active_pools = vector::empty<address>();
        
        // SUI's table doesn't have a direct keys() function that returns all keys
        // We need to check each of our known pool addresses
        let pools_to_check = vector::empty<address>();
        vector::push_back(&mut pools_to_check, WBTC_SUI_POOL_1);
        vector::push_back(&mut pools_to_check, WBTC_SUI_POOL_2);
        vector::push_back(&mut pools_to_check, SUI_POOL_3);
        vector::push_back(&mut pools_to_check, SUI_POOL_4);
        
        let i = 0;
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
    
    /// Helper function to validate if a pool address is in the registry and active
    public fun is_valid_active_pool(registry: &PoolRegistry, pool_address: address): bool {
        if (!table::contains(&registry.pool_info, pool_address)) {
            return false
        };
        
        let pool_info = table::borrow(&registry.pool_info, pool_address);
        pool_info.is_active
    }
}