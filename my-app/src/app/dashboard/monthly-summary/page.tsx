"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";
import styles from "./monthly.module.css";

type Summary = {
  Month: number;
  Total: number;
};

export default function MonthlySummaryPage() {
  const [summary, setSummary] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/monthly-summary")
      .then((res) => res.json())
      .then((data: Summary[]) => setSummary(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <h1>Monthly Summary</h1>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center" }}>
                    Loading summary...
                  </td>
                </tr>
              ) : summary.length > 0 ? (
                summary.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.Month}</td>
                    <td>${s.Total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center" }}>
                    No summary data found.
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
