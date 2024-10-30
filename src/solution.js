const elliptic = require('elliptic');
const EC = new elliptic.ec('secp256k1');
const crypto = require('crypto');
const bs58 = require('bs58');  

function createTransaction(utxos, targetAddress, amount, privateKey) {
  try {
    const transaction = {
      version: 1,
      inputs: [],
      outputs: [],
      locktime: 0
    };

    let totalInputValue = 0;
    utxos.forEach((utxo) => {
      transaction.inputs.push({
        txid: utxo.txid,
        vout: utxo.vout,
        scriptSig: '',
        sequence: 0xffffffff
      });
      totalInputValue += utxo.value;
    });

    const fee = 1000; // Fee in satoshis
    if (totalInputValue < amount + fee) {
      throw new Error('Insufficient funds');
    }

    transaction.outputs.push({
      address: targetAddress,
      value: amount
    });

    const change = totalInputValue - amount - fee;
    if (change > 0) {
      transaction.outputs.push({
        address: deriveAddressFromPrivateKey(privateKey),
        value: change
      });
    }

    transaction.inputs.forEach((input, index) => {
      const signature = generateSignature(privateKey, transaction, index);
      input.scriptSig = signature;
    });

    return serializeTransaction(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
  }
}

// Generate a signature using elliptic
function generateSignature(privateKey, transaction, index) {
  const keyPair = EC.keyFromPrivate(privateKey);
  const txCopy = JSON.parse(JSON.stringify(transaction));
  txCopy.inputs.forEach(input => input.scriptSig = '');
  const txHash = doubleSHA256(serializeTransaction(txCopy));
  const signature = keyPair.sign(txHash);
  return Buffer.concat([signature.toDER(), Buffer.from([0x01])]).toString('hex');
}

// Derive an address from the private key
function deriveAddressFromPrivateKey(privateKey) {
  const keyPair = EC.keyFromPrivate(privateKey);
  const publicKey = keyPair.getPublic().encode('hex');
  const pubKeyHash = crypto.createHash('ripemd160').update(doubleSHA256(Buffer.from(publicKey, 'hex'))).digest();
  const networkByte = Buffer.from([0x6f]);  // Testnet address prefix
  const payload = Buffer.concat([networkByte, pubKeyHash]);
  const checksum = doubleSHA256(payload).slice(0, 4);
  return bs58.encode(Buffer.concat([payload, checksum]));  // Use bs58 encoding
}

// Serialize the transaction
function serializeTransaction(transaction) {
  let serialized = '';
  serialized += intToLittleEndianHex(transaction.version, 4);
  serialized += varIntToHex(transaction.inputs.length);
  transaction.inputs.forEach(input => {
    serialized += reverseHex(input.txid);
    serialized += intToLittleEndianHex(input.vout, 4);
    serialized += varIntToHex(Buffer.from(input.scriptSig, 'hex').length);
    serialized += input.scriptSig;
    serialized += 'ffffffff';
  });
  serialized += varIntToHex(transaction.outputs.length);
  transaction.outputs.forEach(output => {
    serialized += intToLittleEndianHex(output.value, 8);
    serialized += varIntToHex(Buffer.from(output.address, 'hex').length);
    serialized += output.address;
  });
  serialized += intToLittleEndianHex(transaction.locktime, 4);
  return serialized;
}

// Utility functions
function doubleSHA256(buffer) {
  return crypto.createHash('sha256').update(crypto.createHash('sha256').update(buffer).digest()).digest();
}

function intToLittleEndianHex(number, bytes) {
  let hex = number.toString(16).padStart(bytes * 2, '0');
  return hex.match(/../g).reverse().join('');
}

function varIntToHex(number) {
  return number.toString(16).padStart(2, '0');
}

function reverseHex(hex) {
  return hex.match(/../g).reverse().join('');
}

module.exports = { createTransaction };
