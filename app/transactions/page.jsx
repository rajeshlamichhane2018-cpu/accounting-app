"use client";

import { useState } from "react";

export default function Transactions() {
  const [form, setForm] = useState({
    date: "",
    account: "",
    type: "income",
    amount: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });

    window.location.href = "/dashboard";
  };

  return (
    <div className="flex justify-center items-start pt-10">
      
     
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        
        <h1 className="text-2xl font-bold mb-6 text-center">
          ➕ Add Transaction
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* DATE */}
          <input
            type="date"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            required
          />

          {/* ACCOUNT */}
          <input
            placeholder="Account (Cash / Bank)"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) =>
              setForm({ ...form, account: e.target.value })
            }
            required
          />

          {/* TYPE */}
          <select
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option value="income">💰 Income</option>
            <option value="expense">💸 Expense</option>
          </select>

          {/* AMOUNT */}
          <input
            type="number"
            placeholder="Amount (Rs.)"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
            required
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description (optional)"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* BUTTON */}
          <button className="bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
            Save Transaction
          </button>

        </form>
      </div>

    </div>
  );
}