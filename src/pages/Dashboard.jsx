import React, { useState, useEffect } from "react";
import API from "../services/api";
import dayjs from "dayjs";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ reason: "", amount: "", type: "spent", category: "" });
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));

  const fetchData = async () => {
    const res = await API.get("/transactions");
    setTransactions(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/transactions", form);
    setForm({ reason: "", amount: "", type: "spent", category: "" });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTx = transactions.filter((tx) => {
    const matchType = filterType === "all" || tx.type === filterType;
    const matchCat = !filterCategory || tx.category?.toLowerCase().includes(filterCategory.toLowerCase());
    const txMonth = dayjs(tx.date).format("YYYY-MM");
    return matchType && matchCat && txMonth === selectedMonth;
  });

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">📊 Monthly Dashboard</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="spent">Spent</option>
            <option value="earned">Earned</option>
            <option value="investment">Investment</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-2 border rounded"
          />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Add Transaction</button>
      </form>

      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Types</option>
          <option value="spent">Spent</option>
          <option value="earned">Earned</option>
          <option value="investment">Investment</option>
        </select>
        <input
          type="text"
          placeholder="Filter Category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Transactions ({filteredTx.length})</h3>
        <ul className="space-y-2">
          {filteredTx.map((tx) => (
            <li key={tx._id} className="p-2 border rounded flex justify-between">
              <div>
                <div className="font-medium">{tx.reason}</div>
                <div className="text-sm text-gray-500">{tx.category}</div>
              </div>
              <div className="text-right">
                <div>₹{tx.amount}</div>
                <div className="text-xs text-gray-400">{tx.type}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;