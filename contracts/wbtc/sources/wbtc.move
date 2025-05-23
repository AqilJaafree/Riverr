// File: sources/wbtc.move
module wbtc::wbtc {
    use sui::coin::{Self, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::option;

    /// The WBTC token
    public struct WBTC has drop {}

    /// Initialize the WBTC token
    fun init(witness: WBTC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            8, // Bitcoin has 8 decimals
            b"WBTC",
            b"Wrapped Bitcoin",
            b"Wrapped Bitcoin token for Sui ecosystem",
            option::none(),
            ctx,
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx))
    }

    /// Mint new WBTC tokens
    public fun mint(
        treasury_cap: &mut TreasuryCap<WBTC>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient)
    }

    /// Burn WBTC tokens
    public fun burn(
        treasury_cap: &mut TreasuryCap<WBTC>,
        coin: coin::Coin<WBTC>
    ) {
        coin::burn(treasury_cap, coin);
    }

    /// Get total supply (if needed for analytics)
    public fun total_supply(treasury_cap: &TreasuryCap<WBTC>): u64 {
        coin::total_supply(treasury_cap)
    }
}