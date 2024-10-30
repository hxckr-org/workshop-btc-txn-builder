import elliptic from "elliptic";
const EC = new elliptic.ec("secp256k1");
import crypto from "crypto";
import bs58 from "bs58";

export function createTransaction(utxos, targetAddress, amount, privateKey) {
  if (!privateKey) {
    throw new Error("Private key is missing");
  }

  if (!utxos || utxos.length === 0) {
    return undefined;
  }

  const transaction = {
    version: 1,
    inputs: [],
    outputs: [],
    locktime: 0,
  };

  let totalInputValue = 0;
  utxos.forEach((utxo) => {
    transaction.inputs.push({
      txid: utxo.txid,
      vout: utxo.vout,
      scriptSig: "",
      sequence: 0xffffffff,
    });
    totalInputValue += utxo.value;
  });

  const fee = 1000;
  if (totalInputValue < amount + fee) {
    throw new Error("Insufficient funds");
  }

  transaction.outputs.push({
    address: targetAddress,
    value: amount,
  });

  const change = totalInputValue - amount - fee;
  if (change > 0) {
    transaction.outputs.push({
      address: deriveAddressFromPrivateKey(privateKey),
      value: change,
    });
  }

  transaction.inputs.forEach((input, index) => {
    const signature = generateSignature(privateKey, transaction, index);
    input.scriptSig = signature;
  });

  return serializeTransaction(transaction);
}

// Generate a signature using elliptic
function generateSignature(privateKey, transaction, index) {
  const keyPair = EC.keyFromPrivate(privateKey);
  const txCopy = JSON.parse(JSON.stringify(transaction));
  txCopy.inputs.forEach((input) => (input.scriptSig = ""));
  const txHash = doubleSHA256(Buffer.from(serializeTransaction(txCopy), "hex"));
  const signature = keyPair.sign(txHash);
  const signatureBuffer = Buffer.from(signature.toDER());
  const sighashBuffer = Buffer.from([0x01]);
  return Buffer.concat([signatureBuffer, sighashBuffer]).toString("hex");
}

// Derive an address from the private key
function deriveAddressFromPrivateKey(privateKey) {
  const keyPair = EC.keyFromPrivate(privateKey);
  const publicKey = keyPair.getPublic().encode("hex");
  const pubKeyBuffer = Buffer.from(publicKey, "hex");
  const pubKeyHash = crypto
    .createHash("ripemd160")
    .update(Buffer.from(doubleSHA256(pubKeyBuffer)))
    .digest();
  const networkByte = Buffer.from([0x6f]);
  const payload = Buffer.concat([networkByte, pubKeyHash]);
  const checksum = doubleSHA256(payload).slice(0, 4);
  return bs58.encode(Buffer.concat([payload, checksum]));
}

// Serialize the transaction
function serializeTransaction(transaction) {
  let serialized = "";
  serialized += intToLittleEndianHex(transaction.version, 4);
  serialized += varIntToHex(transaction.inputs.length);

  transaction.inputs.forEach((input) => {
    serialized += reverseHex(input.txid);
    serialized += intToLittleEndianHex(input.vout, 4);
    serialized += varIntToHex(Buffer.from(input.scriptSig, "hex").length);
    serialized += input.scriptSig;
    serialized += "ffffffff";
  });

  serialized += varIntToHex(transaction.outputs.length);
  transaction.outputs.forEach((output) => {
    serialized += intToLittleEndianHex(output.value, 8);
    const addressBytes = Buffer.from(output.address).toString("hex");
    serialized += varIntToHex(addressBytes.length / 2);
    serialized += addressBytes;
  });

  serialized += intToLittleEndianHex(transaction.locktime, 4);
  return serialized;
}

// Utility functions
function doubleSHA256(buffer) {
  return crypto
    .createHash("sha256")
    .update(crypto.createHash("sha256").update(buffer).digest())
    .digest();
}

function intToLittleEndianHex(number, bytes) {
  const hex = number.toString(16).padStart(bytes * 2, "0");
  return hex.match(/../g).reverse().join("");
}

function varIntToHex(number) {
  return number.toString(16).padStart(2, "0");
}

function reverseHex(hex) {
  return hex.match(/../g).reverse().join("");
}
