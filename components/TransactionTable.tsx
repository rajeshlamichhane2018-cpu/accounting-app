"use client";

import { useEffect, useState } from "react";

export default function TransactionTable({ type }: { type: string }) {
  const [data, setData] = useState<any[]>([]);

  const loadData = () => {
    fetch(`/api/transactions`)
      .then((res) => res.json())
      .then((res) =>
        setData(res.filter((i: any) => i.type === type))
      );
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteItem = async (id: string) => {
    await fetch("/api/transactions", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  return (
    <table className="w-full mt-4 border">
      <thead>
        <tr className="bg-gray-100">
          <th>Date</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item._id} className="text-center">
            <td>{new Date(item.date).toLocaleDateString()}</td>
            <td>Rs. {item.amount}</td>
            <td>{item.category}</td>
            <td>{item.description}</td>
            <td>
              <button
                onClick={() => deleteItem(item._id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}