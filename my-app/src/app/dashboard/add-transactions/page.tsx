"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";
import styles from "./transaction.module.css";

type Transaction = {
  id: number;
  item: string;
  amount: number;
  transactionDate: string; // ISO string from backend
};

// Component to safely render dates on client only
function ClientDate({ isoDate }: { isoDate: string }) {
  const [formatted, setFormatted] = useState(isoDate.split("T")[0]); // fallback for SSR

  useEffect(() => {
    const date = new Date(isoDate);
    setFormatted(date.toLocaleDateString());
  }, [isoDate]);

  return <>{formatted}</>;
}

export default function AddTransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState<number | "">("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/add-transactions");
      const data: Transaction[] = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !amount) return;

    try {
      const res = await fetch("/api/auth/add-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, amount }),
      });

      const data = await res.json();
      alert(data.message);

      setItem("");
      setAmount("");
      fetchTransactions(); // refresh table
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const res = await fetch(`/api/auth/add-transactions?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Transaction deleted successfully");
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(data.message || "Failed to delete transaction");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <h1>Add Transaction</h1>

          <form onSubmit={handleAddTransaction} className={styles.form}>
            <input
              type="text"
              placeholder="Item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <button type="submit">Add Transaction</button>
          </form>

          <h2>Transaction History</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Amount</th>
                <th>Transaction Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.item}</td>
                    <td>{t.amount}</td>
                    <td>
                      <ClientDate isoDate={t.transactionDate} />
                    </td>
                    <td>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteTransaction(t.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}
