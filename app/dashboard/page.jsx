"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);

  // Load data
  const loadData = async () => {
    const res = await fetch("/api/transactions");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Delete
  const deleteItem = async (id) => {
    await fetch("/api/transactions", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  // Edit (fill form)
  const editItem = (item) => {
    setEditing(item);
  };

  // Update
  const updateItem = async () => {
    await fetch("/api/transactions", {
      method: "PUT",
      body: JSON.stringify(editing),
    });
    setEditing(null);
    loadData();
  };

  // Summary
  const totalIncome = data
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const totalExpense = data
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Dashboard</h1>

      {/* SUMMARY */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <div style={{ ...card, background: "green" }}>
          Total Income <br /> Rs. {totalIncome}
        </div>
        <div style={{ ...card, background: "red" }}>
          Total Expense <br /> Rs. {totalExpense}
        </div>
        <div style={{ ...card, background: "blue" }}>
          Balance <br /> Rs. {balance}
        </div>
      </div>

      {/* EDIT FORM */}
      {editing && (
        <div style={{ marginTop: 20 }}>
          <h3>Edit Transaction</h3>

          <input
            placeholder="Account"
            value={editing.account}
            onChange={(e) =>
              setEditing({ ...editing, account: e.target.value })
            }
          />

          <select
            value={editing.type}
            onChange={(e) =>
              setEditing({ ...editing, type: e.target.value })
            }
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            placeholder="Amount"
            type="number"
            value={editing.amount}
            onChange={(e) =>
              setEditing({ ...editing, amount: Number(e.target.value) })
            }
          />

          <input
            placeholder="Description"
            value={editing.description}
            onChange={(e) =>
              setEditing({ ...editing, description: e.target.value })
            }
          />

          <button onClick={updateItem} style={editBtn}>
            Update
          </button>
        </div>
      )}

      {/* TABLE */}
      <div style={{ marginTop: 20 }}>
        <table style={table}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>Date</th>
              <th style={th}>Account</th>
              <th style={th}>Type</th>
              <th style={th}>Amount</th>
              <th style={th}>Description</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={td}>{t.date}</td>
                <td style={td}>{t.account}</td>

                <td style={td}>
                  <span
                    style={{
                      color: t.type === "income" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {t.type}
                  </span>
                </td>

                <td style={td}>Rs. {t.amount}</td>
                <td style={td}>{t.description}</td>

                <td style={td}>
                  <button onClick={() => editItem(t)} style={editBtn}>
                    Edit
                  </button>

                  <button
                    onClick={() => deleteItem(t.id)}
                    style={deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* STYLES */

const card = {
  color: "#fff",
  padding: 20,
  borderRadius: 8,
  flex: 1,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};

const th = {
  padding: 10,
  textAlign: "left",
  borderBottom: "2px solid #ddd",
};

const td = {
  padding: 10,
};

const editBtn = {
  background: "#3498db",
  color: "#fff",
  border: "none",
  padding: "5px 10px",
  marginRight: 5,
  cursor: "pointer",
  borderRadius: 4,
};

const deleteBtn = {
  background: "#e74c3c",
  color: "#fff",
  border: "none",
  padding: "5px 10px",
  cursor: "pointer",
  borderRadius: 4,
};