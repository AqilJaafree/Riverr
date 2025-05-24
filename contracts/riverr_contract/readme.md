# Riverr Contract 🌊

A decentralized liquidity pool smart contract built on the Sui blockchain, enabling users to provide liquidity to various cryptocurrency pools and earn fees through automated market making.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Contract Architecture](#contract-architecture)
- [Deployment Information](#deployment-information)
- [Getting Started](#getting-started)
- [Usage Examples](#usage-examples)
- [Pool Information](#pool-information)
- [Events](#events)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Riverr Contract is a liquidity pool protocol that allows users to:
- Provide liquidity to multiple cryptocurrency pools
- Receive LP (Liquidity Provider) tokens representing their pool positions
- Earn fees from trading activities within the pools
- Withdraw their liquidity along with accumulated rewards

## ✨ Features

- **Multi-Pool Support**: Support for multiple liquidity pools with different fee tiers
- **Generic Coin Types**: Works with any Sui coin type through Move generics
- **LP Token System**: Sophisticated LP token representation with detailed position tracking
- **Fee Tier Management**: Different fee structures for different pools (0.10%, 0.25%, 0.30%)
- **Admin Controls**: Administrative functions for pool management
- **Event System**: Comprehensive event emission for tracking all activities
- **Shared Registry**: Centralized pool registry for efficient pool management

## 🏗️ Contract Architecture

### Core Structs

#### `LPToken<CoinType>`
Represents a user's liquidity position in a specific pool:
```move
struct LPToken<phantom CoinType> has key, store {
    id: UID,
    pool_address: address,
    pool_name: String,
    coin_amount: u64,
    sui_amount: u64,
    fee_tier: u64,
    lp_share: u64,
    timestamp: u64,
}
```

#### `PoolRegistry`
Central registry managing all liquidity pools:
```move
struct PoolRegistry has key {
    id: UID,
    admin: address,
    total_sui: Balance<SUI>,
    pool_info: Table<address, PoolInfo>
}
```

#### `PoolInfo`
Information about individual pools:
```move
struct PoolInfo has store, copy, drop {
    name: String,
    fee_tier: u64,
    total_liquidity_usd: u64,
    is_active: bool
}
```

## 🚀 Deployment Information

### Testnet Deployment
- **Package ID**: `0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a`
- **Pool Registry**: `0xed6b692cc13684657e82714c56d3343c5a832ad61fa832c6ae54714c762c84b7`
- **Network**: Sui Testnet
- **Explorer**: [View on Sui Explorer](https://suiexplorer.com/object/0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a?network=testnet)

### Pre-configured Pools
- **WBTC/SUI Main Pool**: 0.30% fee tier
- **WBTC/SUI 0.25% Pool**: 0.25% fee tier  
- **SUI Pool 3**: 0.30% fee tier
- **SUI Pool 4**: 0.10% fee tier

## 🚀 Getting Started

### Prerequisites

1. **Sui CLI**: Install the Sui command line interface
   ```bash
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
   ```

2. **Sui Wallet**: Set up a Sui wallet with testnet SUI
   ```bash
   sui client new-address ed25519
   sui client faucet  # Get testnet SUI
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd riverr_contract
   ```

2. Build the contract:
   ```bash
   sui move build
   ```

3. Run tests (if available):
   ```bash
   sui move test
   ```

## 📚 Usage Examples

### View Available Pools

```bash
sui client call \
  --package 0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a \
  --module riverr_contract \
  --function get_available_pools \
  --args 0xed6b692cc13684657e82714c56d3343c5a832ad61fa832c6ae54714c762c84b7 \
  --gas-budget 10000000
```

### Get Pool Information

```bash
sui client call \
  --package 0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a \
  --module riverr_contract \
  --function get_pool_info \
  --args 0xed6b692cc13684657e82714c56d3343c5a832ad61fa832c6ae54714c762c84b7 [POOL_ADDRESS] \
  --gas-budget 10000000
```

### Provide Liquidity

```bash
sui client call \
  --package 0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a \
  --module riverr_contract \
  --function provide_liquidity \
  --type-args [YOUR_COIN_TYPE] \
  --args 0xed6b692cc13684657e82714c56d3343c5a832ad61fa832c6ae54714c762c84b7 [POOL_ADDRESS] [YOUR_COIN_OBJECT] [YOUR_SUI_OBJECT] \
  --gas-budget 50000000
```

### Withdraw Liquidity

```bash
sui client call \
  --package 0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a \
  --module riverr_contract \
  --function withdraw_liquidity \
  --type-args [YOUR_COIN_TYPE] \
  --args 0xed6b692cc13684657e82714c56d3343c5a832ad61fa832c6ae54714c762c84b7 [YOUR_LP_TOKEN] \
  --gas-budget 50000000
```

## 🏊 Pool Information

### WBTC/SUI Main Pool
- **Address**: `0xe0c526aa27d1729931d0051a318d795ad0299998898e4287d9da1bf095b49658`
- **Fee Tier**: 0.30%
- **Description**: Primary WBTC/SUI trading pair

### WBTC/SUI 0.25% Pool
- **Address**: `0x0fb4ad0e4c2c2b0a45d3f7bc5585cc9cea8486a63e4ef5cb768ddd9414fbb97a`
- **Fee Tier**: 0.25%
- **Description**: Lower fee WBTC/SUI trading pair

### SUI Pool 3
- **Address**: `0xd7d53e235c8a1db5e30bbde563053490db9b876ec8752b9053fee33ed845843b`
- **Fee Tier**: 0.30%
- **Description**: SUI-based liquidity pool

### SUI Pool 4
- **Address**: `0xe71aa89df60e737f1b687f8dfbd51e2a9b35706e9e5540ce9b053bd53fcb9ec3`
- **Fee Tier**: 0.10%
- **Description**: Low-fee SUI liquidity pool

## 📡 Events

The contract emits the following events:

### LiquidityProvided
```move
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
```

### LiquidityWithdrawn
```move
struct LiquidityWithdrawn<phantom CoinType> has copy, drop {
    provider: address,
    pool_address: address,
    coin_amount: u64,
    sui_amount: u64,
    timestamp: u64,
}
```

## 🛠️ Development

### Building from Source

1. Ensure you have the Sui toolchain installed
2. Clone this repository
3. Run the build command:
   ```bash
   sui move build
   ```

### Project Structure

```
riverr_contract/
├── Move.toml          # Package configuration
├── sources/
│   └── riverr_contract.move  # Main contract
└── README.md          # This file
```

### Move.toml Configuration

```toml
[package]
name = "riverr_contract"
version = "0.1.0"
published-at = "0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
rivier = "0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a"
std = "0x1"
sui = "0x2"
```

## 🔒 Security Considerations

- **Admin Controls**: Only the contract admin can update pool information
- **Pool Validation**: All pool operations validate pool existence and active status
- **Balance Management**: SUI balances are properly managed through the registry
- **Object Ownership**: LP tokens are properly transferred to users

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Join our community discussions
- Check the [Sui Documentation](https://docs.sui.io/) for Move programming

## 🎉 Acknowledgments

- Built on the [Sui Network](https://sui.io/)
- Inspired by automated market maker protocols
- Thanks to the Sui Move community for resources and support

---

**⚠️ Disclaimer**: This is a testnet deployment. Do not use with real funds on mainnet without proper auditing and testing.