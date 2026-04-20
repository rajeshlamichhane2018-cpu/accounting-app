"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="grid grid-cols-2 gap-4">

        <div className="p-4 bg-green-100 rounded">
          <p>Total Income</p>
          <h2 className="text-xl font-bold">Rs. {data.income || 0}</h2>
        </div>

        <div className="p-4 bg-red-100 rounded">
          <p>Total Expense</p>
          <h2 className="text-xl font-bold">Rs. {data.expense || 0}</h2>
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <p>Total Sales</p>
          <h2 className="text-xl font-bold">Rs. {data.totalSales || 0}</h2>
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <p>Profit</p>
          <h2 className="text-xl font-bold">Rs. {data.profit || 0}</h2>
        </div>

        <div className="p-4 bg-purple-100 rounded col-span-2">
          <p>Pending Dues</p>
          <h2 className="text-xl font-bold">Rs. {data.pendingDues || 0}</h2>
        </div>

      </div>
    </div>
  );
}