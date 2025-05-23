# WBTC Token Contract ₿

A Wrapped Bitcoin (WBTC) token implementation on the Sui blockchain, providing Bitcoin exposure within the Sui ecosystem.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Contract Details](#contract-details)
- [Deployment Information](#deployment-information)
- [Usage Examples](#usage-examples)
- [Token Information](#token-information)
- [Development](#development)
- [Security](#security)
- [License](#license)

## 🎯 Overview

This WBTC (Wrapped Bitcoin) token contract enables Bitcoin representation on the Sui blockchain. It follows the standard Sui coin implementation pattern and provides essential functionality for minting, burning, and managing WBTC tokens.

## ✨ Features

- **Standard Coin Implementation**: Built using Sui's native coin framework
- **Minting Capability**: Authorized minting of new WBTC tokens
- **Burning Mechanism**: Ability to burn tokens to reduce supply
- **Treasury Management**: Controlled by treasury capability holder
- **Bitcoin-Compatible Decimals**: Uses 8 decimal places like Bitcoin
- **Supply Tracking**: Built-in total supply monitoring

## 🏗️ Contract Details

### Core Structure

```move
/// The WBTC token witness type
public struct WBTC has drop {}
```

### Key Functions

#### `mint(treasury_cap, amount, recipient, ctx)`
- **Purpose**: Mint new WBTC tokens
- **Access**: Requires treasury capability
- **Parameters**:
  - `treasury_cap`: Treasury capability reference
  - `amount`: Amount to mint (in smallest units)
  - `recipient`: Address to receive tokens
  - `ctx`: Transaction context

#### `burn(treasury_cap, coin)`
- **Purpose**: Burn existing WBTC tokens
- **Access**: Requires treasury capability
- **Parameters**:
  - `treasury_cap`: Treasury capability reference
  - `coin`: WBTC coin to burn

#### `total_supply(treasury_cap)`
- **Purpose**: Get current total supply
- **Returns**: Total supply as u64
- **Access**: Public view function

## 🚀 Deployment Information

### Testnet Deployment
- **Package ID**: `0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4`
- **Treasury Cap**: `0xca90f8b5200a56c5673305ae266595c9796cc9c6b723b258a74bdaf367ea9913`
- **Coin Metadata**: `0x9b0c192ae047b4f794d73ad831a72bffee1cce42e7b76bd90d05fdfda0ff03da`
- **Upgrade Cap**: `0x7bb693c7984670ccb11280c28ccb6ea84b8569da9cab158af78fc28a991279d4`
- **Network**: Sui Testnet
- **Transaction Hash**: `3RBFqPuaQtKAEwH8eDrANhok6SsMGHUQV4AJHsvJFrD7`

### Explorer Links
- [Package on Sui Explorer](https://suiexplorer.com/object/0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4?network=testnet)
- [Treasury Cap](https://suiexplorer.com/object/0xca90f8b5200a56c5673305ae266595c9796cc9c6b723b258a74bdaf367ea9913?network=testnet)

## 📚 Usage Examples

### Mint WBTC Tokens

```bash
# Mint 1 WBTC (100000000 units with 8 decimals) to a recipient
sui client call \
  --package 0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4 \
  --module wbtc \
  --function mint \
  --args 0xca90f8b5200a56c5673305ae266595c9796cc9c6b723b258a74bdaf367ea9913 100000000 0xRECIPIENT_ADDRESS \
  --gas-budget 10000000
```

### Check Total Supply

```bash
# Get current total supply
sui client call \
  --package 0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4 \
  --module wbtc \
  --function total_supply \
  --args 0xca90f8b5200a56c5673305ae266595c9796cc9c6b723b258a74bdaf367ea9913 \
  --gas-budget 5000000
```

### Burn WBTC Tokens

```bash
# Burn WBTC tokens
sui client call \
  --package 0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4 \
  --module wbtc \
  --function burn \
  --args 0xca90f8b5200a56c5673305ae266595c9796cc9c6b723b258a74bdaf367ea9913 YOUR_WBTC_COIN_ID \
  --gas-budget 10000000
```

### Transfer WBTC Tokens

```bash
# Transfer WBTC to another address
sui client transfer \
  --to 0xRECIPIENT_ADDRESS \
  --object-id YOUR_WBTC_COIN_ID \
  --gas-budget 5000000
```

## 🪙 Token Information

| Property | Value |
|----------|-------|
| **Name** | Wrapped Bitcoin |
| **Symbol** | WBTC |
| **Decimals** | 8 |
| **Description** | Wrapped Bitcoin token for Sui ecosystem |
| **Type** | `0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4::wbtc::WBTC` |

### Decimal Conversion

Since WBTC uses 8 decimals (like Bitcoin):
- 1 WBTC = 100,000,000 units
- 0.1 WBTC = 10,000,000 units
- 0.01 WBTC = 1,000,000 units
- 0.001 WBTC = 100,000 units

## 🛠️ Development

### Prerequisites

- Sui CLI installed
- Sui wallet with testnet funds
- Move development environment

### Building from Source

1. Clone the repository
2. Navigate to the WBTC contract directory
3. Build the contract:
   ```bash
   sui move build
   ```

### Project Structure

```
wbtc/
├── Move.toml          # Package configuration
├── sources/
│   └── wbtc.move     # Main token contract
└── README.md         # This file
```

### Move.toml Configuration

```toml
[package]
name = "wbtc"
version = "0.1.0"
published-at = "0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4"

[dependencies]
Bridge = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/bridge", rev = "framework/testnet" }
SuiSystem = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-system", rev = "framework/testnet" }
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }
MoveStdlib = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/move-stdlib", rev = "framework/testnet" }

[addresses]
wbtc = "0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4"
```

## 🔗 Integration with Riverr Contract

This WBTC token is designed to work seamlessly with the Riverr liquidity pool contract:

```bash
# Provide WBTC liquidity to Riverr pools
sui client call \
  --package 0xfc38eb447fe340103e9a93599b00142fef33f032543489b832cd51d35e8c0c5a \
  --module riverr_contract \
  --function provide_liquidity \
  --type-args 0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4::wbtc::WBTC \
  --args REGISTRY_ID POOL_ADDRESS YOUR_WBTC_COIN YOUR_SUI_COIN \
  --gas-budget 50000000
```

## 🔒 Security Considerations

- **Treasury Control**: Only the treasury capability holder can mint/burn tokens
- **Immutable Metadata**: Token metadata is frozen and cannot be changed
- **Standard Implementation**: Uses Sui's battle-tested coin framework
- **Access Control**: Minting requires explicit treasury capability

## ⚠️ Important Notes

- **Testnet Only**: This deployment is for testing purposes only
- **Treasury Responsibility**: The treasury capability holder has full control over token supply
- **No Upgradeability**: Once deployed, the core token logic cannot be changed
- **Decimal Precision**: Always account for 8 decimal places in calculations

## 📊 Deployment Summary

| Component | Object ID |
|-----------|-----------|
| Package | `0x4528bbf3de06e0fa07691cdddad675b70d2c25acb4cdc12011cb87fc54ca0da4` |
| Treasury Cap | `0xca90f8b5200a56c5673305ae266595c9796cc9c6b723b258a74bdaf367ea9913` |
| Coin Metadata | `0x9b0c192ae047b4f794d73ad831a72bffee1cce42e7b76bd90d05fdfda0ff03da` |
| Upgrade Cap | `0x7bb693c7984670ccb11280c28ccb6ea84b8569da9cab158af78fc28a991279d4` |

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [Sui Documentation](https://docs.sui.io/)
- Join the Sui community discussions

---

**⚠️ Disclaimer**: This is a testnet deployment for development and testing purposes only. Do not use with real Bitcoin or on mainnet without proper auditing.