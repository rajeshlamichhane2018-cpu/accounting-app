"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  const income = data
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = data
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = income - expense;

  const chartData = [
    { name: "Income", value: income },
    { name: "Expense", value: expense },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your finances</p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Income</p>
          <h2 className="text-2xl font-bold text-green-600">
            Rs. {income}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Expense</p>
          <h2 className="text-2xl font-bold text-red-500">
            Rs. {expense}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Balance</p>
          <h2 className="text-2xl font-bold text-blue-600">
            Rs. {balance}
          </h2>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Income vs Expense</h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>

        {data.length === 0 ? (
          <p className="text-gray-400">No transactions yet</p>
        ) : (
          data.slice(0, 5).map((t, i) => (
            <div
              key={i}
              className="flex justify-between p-3 bg-gray-50 rounded-lg mb-2"
            >
              <span>{t.title}</span>
              <span
                className={
                  t.type === "income"
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                Rs. {t.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}