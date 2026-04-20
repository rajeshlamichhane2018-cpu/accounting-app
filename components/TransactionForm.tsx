"use client";

import { useState } from "react";

export default function TransactionForm({ type }: { type: string }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        type,
        amount: Number(amount),
        category,
        description,
      }),
    });

    location.reload();
  };

  return (
    <form className="bg-white p-4 shadow rounded" onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Amount"
        className="border p-2 w-full mb-2"
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        placeholder="Category"
        className="border p-2 w-full mb-2"
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        placeholder="Description"
        className="border p-2 w-full mb-2"
        onChange={(e) => setDescription(e.target.value)}
      />

      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Add {type}
      </button>
    </form>
  );
}