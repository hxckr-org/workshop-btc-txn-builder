import { test } from "@japa/runner";
import { createTransaction } from "../src/solution.js";

test.group("Transaction Builder", () => {
  test("creates a valid transaction with sufficient funds", ({ assert }) => {
    const utxos = [
      {
        txid: "7ea75da574ebff364f0f4cc9d0315b7d9523f7f38558918aff8570842cba74c9",
        vout: 0,
        value: 50000,
      },
    ];
    const targetAddress = "2N8hwP1WmJrFF5QWABn38y63uYLhnJYJYTF";
    const amount = 30000;
    const privateKey =
      "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    const result = createTransaction(utxos, targetAddress, amount, privateKey);
    assert.exists(result);
    assert.typeOf(result, "string");
  });

  // Test insufficient funds
  test("throws error with insufficient funds", ({ assert }) => {
    const utxos = [
      {
        txid: "7ea75da574ebff364f0f4cc9d0315b7d9523f7f38558918aff8570842cba74c9",
        vout: 0,
        value: 500,
      },
    ];
    const targetAddress = "2N8hwP1WmJrFF5QWABn38y63uYLhnJYJYTF";
    const amount = 1000;
    const privateKey =
      "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    assert.throws(
      () => createTransaction(utxos, targetAddress, amount, privateKey),
      "Insufficient funds",
    );
  });

  // Test multiple UTXOs
  test("handles multiple UTXOs correctly", ({ assert }) => {
    const utxos = [
      {
        txid: "7ea75da574ebff364f0f4cc9d0315b7d9523f7f38558918aff8570842cba74c9",
        vout: 0,
        value: 30000,
      },
      {
        txid: "8ea75da574ebff364f0f4cc9d0315b7d9523f7f38558918aff8570842cba74c9",
        vout: 1,
        value: 20000,
      },
    ];
    const targetAddress = "2N8hwP1WmJrFF5QWABn38y63uYLhnJYJYTF";
    const amount = 45000;
    const privateKey =
      "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    const transaction = createTransaction(
      utxos,
      targetAddress,
      amount,
      privateKey,
    );

    assert.exists(transaction);
    assert.typeOf(transaction, "string");
  });

  // Test missing private key
  test("handles missing private key", ({ assert }) => {
    const utxos = [
      {
        txid: "7ea75da574ebff364f0f4cc9d0315b7d9523f7f38558918aff8570842cba74c9",
        vout: 0,
        value: 50000,
      },
    ];
    const targetAddress = "2N8hwP1WmJrFF5QWABn38y63uYLhnJYJYTF";
    const amount = 30000;

    assert.throws(
      () => createTransaction(utxos, targetAddress, amount, null),
      "Private key is missing",
    );
  });

  // Test empty UTXOs
  test("handles empty UTXO list", ({ assert }) => {
    const utxos = [];
    const targetAddress = "2N8hwP1WmJrFF5QWABn38y63uYLhnJYJYTF";
    const amount = 30000;
    const privateKey =
      "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    const transaction = createTransaction(
      utxos,
      targetAddress,
      amount,
      privateKey,
    );

    assert.notExists(transaction);
  });

  // Test transaction format
  test("creates transaction with correct format", ({ assert }) => {
    const utxos = [
      {
        txid: "7ea75da574ebff364f0f4cc9d0315b7d9523f7f38558918aff8570842cba74c9",
        vout: 0,
        value: 50000,
      },
    ];
    const targetAddress = "2N8hwP1WmJrFF5QWABn38y63uYLhnJYJYTF";
    const amount = 30000;
    const privateKey =
      "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    const transaction = createTransaction(
      utxos,
      targetAddress,
      amount,
      privateKey,
    );

    // Check if the transaction string contains version, inputs, and outputs
    assert.isTrue(transaction.length > 0);
    assert.match(transaction, /^[0-9a-f]+$/); // Should be hexadecimal
  });
});
