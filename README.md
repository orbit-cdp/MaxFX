# MFX: Leveraging Trading on Stellar

## Overview

Traders often face significant challenges in accessing different currencies on-chain and effectively leveraging large capital. MFX addresses these issues by utilizing Stellar's robust ecosystem and technical resources.

## Demo
[![Demo](https://raw.githubusercontent.com/orbit-cdp/maxfx/main/demo.png)]
(https://raw.githubusercontent.com/orbit-cdp/maxfx/main/demo.mp4)

## Integrations with Stellar dApps

MFX leverages several dApps built on Stellar:

- **Blend**: To borrow capital and manage liquidations.
- **Soroswap**: To facilitate conversions.
- **Orbit**: To access a wide range of currencies.

## How It Works

1. **Deposit XLM**: Users deposit XLM into the MFX smart contract.
2. **Borrow oUSD**: The smart contract deposits the XLM into Blend to borrow oUSD.
3. **Convert to XLM**: This oUSD is sent to Soroswap to purchase more XLM.
4. **Repeat**: This process is repeated until the desired leverage is achieved.

By combining these Stellar dApps, MFX enables FX leveraging trading on Stellar, providing traders with enhanced decentralized access to capital and on-chain liquidity.

For questions or support, please open an issue.
