"use client"; // needed if using client components inside this page
import React from "react";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import styles from "../dashboard/dashboard.module.css";

export default function DashboardPage() {
  return (
    <div>
      <Navbar />
      <div className={styles.dashboardContainer}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.welcome}>
            <h1>Welcome to the SRIYA OPTICALS🎉</h1>
            <p>Manage your transactions and reports efficiently.</p>
          </div>

          <div className={styles.imageGallery}>
            <img src="/spets1.png" alt="Spets1" />
            <img src="/spets2.png" alt="Spets2" />
            <img src="/spets3.png" alt="Spets3" />
            <img src="/spets4.png" alt="Spets4" />
          </div>
        </div>
      </div>
    </div>
  );
}
