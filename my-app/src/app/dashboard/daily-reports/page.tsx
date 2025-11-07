"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";
import styles from "./daily.module.css";

type Transaction = {
  id: number;
  item: string;
  amount: number;
  transactionDate: string;
};

export default function DailyReportsPage() {
  const [dailyReports, setDailyReports] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/daily-reports")
      .then((res) => res.json())
      .then((data: Transaction[]) => setDailyReports(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <h1>Daily Reports</h1>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    Loading daily reports...
                  </td>
                </tr>
              ) : dailyReports.length > 0 ? (
                dailyReports.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.item}</td>
                    <td>{t.amount}</td>
                    <td>{new Date(t.transactionDate).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    No daily transactions found.
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
