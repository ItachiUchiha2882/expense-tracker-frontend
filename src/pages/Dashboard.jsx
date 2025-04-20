import React, { useState, useEffect } from "react";
import API from "../services/api";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { HiPencil } from "react-icons/hi2";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    reason: "",
    amount: "",
    type: "spent",
    category: "",
    date: dayjs().format("YYYY-MM-DD"),
  });
  const [filterType, setFilterType] = useState(localStorage.getItem("filterType") || "all");
  const [filterCategory, setFilterCategory] = useState(localStorage.getItem("filterCategory") || "");
  const [selectedMonth, setSelectedMonth] = useState(localStorage.getItem("selectedMonth") || dayjs().format("YYYY-MM"));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "₹");
  const [page, setPage] = useState(1);
  const txPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/transactions/${editingId}`, form);
        setEditingId(null);
      } else {
        await API.post("/transactions", form);
      }
      setForm({ reason: "", amount: "", type: "spent", category: "", date: dayjs().format("YYYY-MM-DD") });
      fetchData();
    } catch {
      alert("Error submitting transaction");
    }
  };

  const handleEdit = (tx) => {
    setForm({
      reason: tx.reason,
      amount: tx.amount,
      type: tx.type,
      category: tx.category || "",
      date: dayjs(tx.date).format("YYYY-MM-DD"),
    });
    setEditingId(tx._id);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await API.delete(`/transactions/${id}`);
      fetchData();
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredTx);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `transactions_${selectedMonth}.csv`);
  };

  const handleCurrencyChange = (e) => {
    const cur = e.target.value;
    setCurrency(cur);
    localStorage.setItem("currency", cur);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("filterType", filterType);
    localStorage.setItem("filterCategory", filterCategory);
    localStorage.setItem("selectedMonth", selectedMonth);
  }, [filterType, filterCategory, selectedMonth]);

  const filteredTx = transactions.filter((tx) => {
    const matchType = filterType === "all" || tx.type === filterType;
    const matchCat = !filterCategory || tx.category?.toLowerCase().includes(filterCategory.toLowerCase());
    const txMonth = dayjs(tx.date).format("YYYY-MM");
    return matchType && matchCat && txMonth === selectedMonth;
  });

  const paginatedTx = filteredTx.slice((page - 1) * txPerPage, page * txPerPage);
  const totalPages = Math.ceil(filteredTx.length / txPerPage);

  const summary = filteredTx.reduce(
    (acc, tx) => {
      const amt = Number(tx.amount);
      acc[tx.type] += amt;
      return acc;
    },
    { spent: 0, earned: 0, investment: 0 }
  );

  const generateMonthOptions = () => {
    const months = new Set(transactions.map((tx) => dayjs(tx.date).format("YYYY-MM")));
    return [...months].sort().map((month) => (
      <option key={month} value={month}>{dayjs(month).format("MMMM YYYY")}</option>
    ));
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">📊 Monthly Dashboard</h2>

      <div className="mb-4 flex gap-4 items-center">
        <label className="font-medium">Currency:</label>
        <select value={currency} onChange={handleCurrencyChange} className="border p-2 rounded">
          <option value="₹">₹ Rupee</option>
          <option value="$">$ Dollar</option>
          <option value="€">€ Euro</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="p-2 border rounded" required />
          <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="p-2 border rounded" required />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="p-2 border rounded">
            <option value="spent">Spent</option>
            <option value="earned">Earned</option>
            <option value="investment">Investment</option>
          </select>
          <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-2 border rounded" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="p-2 border rounded" />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId ? "Update Transaction" : "Add Transaction"}
        </button>
      </form>

      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 border rounded">
          <option value="all">All Types</option>
          <option value="spent">Spent</option>
          <option value="earned">Earned</option>
          <option value="investment">Investment</option>
        </select>
        <input type="text" placeholder="Filter Category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="p-2 border rounded" />
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded">
          {generateMonthOptions()}
        </select>
        <button onClick={handleExportCSV} className="bg-green-500 text-white px-3 py-2 rounded">Export CSV</button>
      </div>

      {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : (
        <>
          <div className="mb-4 bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>💸 Spent: <strong>{currency}{summary.spent}</strong></div>
              <div>💰 Earned: <strong>{currency}{summary.earned}</strong></div>
              <div>📈 Invested: <strong>{currency}{summary.investment}</strong></div>
            </div>
          </div>

          <ul className="space-y-2">
            {paginatedTx.map((tx) => (
              <li key={tx._id} className="p-2 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{tx.reason} - {currency}{tx.amount}</div>
                  <div className="text-sm text-gray-500">{tx.category} | {tx.type} | {dayjs(tx.date).format("DD MMM YYYY")}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(tx)} className="text-blue-500">Edit</button>
                  <button onClick={() => handleDelete(tx._id)} className="text-red-500">Delete</button>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-4 flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${p === page ? "bg-blue-600 text-white" : "bg-gray-100"}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
