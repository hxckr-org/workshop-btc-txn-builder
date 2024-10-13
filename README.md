# workshop-btc-txn-builder
# Bitcoin Transaction Builder Workshop

Fix and complete the Bitcoin transaction builder to create valid transactions for the Bitcoin network.

## Objectives
- Understand Bitcoin transaction structure.
- Debug and fix the provided code.
- Generate a valid, signed transaction.

## Skill Areas
- **Bitcoin Protocol**: Transaction creation, validation.
- **Debugging**: Fix broken logic.
- **Signing**: Use ECDSA for inputs.

## Getting Started
- Code is in `src/index.js`.
- Requires Node.js.

### Installation
```sh
git clone <repository_url>
cd workshop-btc-txn-builder
npm install
```

## Steps to Complete
1. Analyze and debug the code.
2. Fix input, output, and signature issues.
3. Test and validate the transaction.

## Example Usage
```javascript
const { createTransaction } = require('./src/index.js');

const utxos = [
  { txid: 'abcd1234...', vout: 0, value: 500000 }
];
const targetAddress = 'tb1q...';
const amount = 100000;
const privateKey = 'your_private_key_here';

const rawTx = createTransaction(utxos, targetAddress, amount, privateKey);
console.log(rawTx);
```

## Key Fixes Needed
- Correct UTXO referencing.
- Proper output and fee calculation.
- Implement signature generation.
- Correct transaction serialization.

## Outcome
- A valid Bitcoin transaction ready for signet/testnet.

Happy debugging!
