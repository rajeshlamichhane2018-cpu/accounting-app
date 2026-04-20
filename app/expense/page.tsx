"use client";

import { useState } from "react";

export default function ExpensePage() {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        title,
        amount: Number(amount),
        type: "expense",
      }),
    });

    alert("Expense Added");
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Add Expense</h1>

      <input
        placeholder="Title"
        className="w-full p-3 border rounded"
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Amount"
        type="number"
        className="w-full p-3 border rounded"
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Add Expense
      </button>
    </div>
  );
}