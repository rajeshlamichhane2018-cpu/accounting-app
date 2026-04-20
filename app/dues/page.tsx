"use client";

import { useEffect, useState } from "react";

export default function DuesPage() {
  const [data, setData] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("receive");

  const loadData = async () => {
    const res = await fetch("/api/dues");
    const d = await res.json();
    setData(d);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("/api/dues", {
      method: "POST",
      body: JSON.stringify({
        name,
        amount: Number(amount),
        type,
      }),
    });

    setName("");
    setAmount("");
    loadData();
  };

  const markPaid = async (id: string) => {
    await fetch("/api/dues", {
      method: "PUT",
      body: JSON.stringify({ id }),
    });

    loadData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dues</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="receive">To Receive</option>
          <option value="pay">To Pay</option>
        </select>

        <button className="bg-purple-600 text-white px-4 py-2">
          Add Due
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {data.map((d) => (
          <div
            key={d._id}
            className="flex justify-between p-3 bg-gray-100 rounded"
          >
            <div>
              <p className="font-semibold">{d.name}</p>
              <p className="text-sm">
                Rs. {d.amount} ({d.type})
              </p>
            </div>

            <div>
              {d.status === "pending" ? (
                <button
                  onClick={() => markPaid(d._id)}
                  className="text-green-600 text-sm"
                >
                  Mark Paid
                </button>
              ) : (
                <span className="text-gray-400 text-sm">
                  Paid
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}