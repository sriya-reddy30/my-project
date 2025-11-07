// src/components/Sidebar.tsx
"use client";
import Link from "next/link";
import styles from "../components/sidebar.module.css";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard Home", href: "/dashboard" },
    { label: "Add Transactions", href: "/dashboard/add-transactions" },
    { label: "View Daily Reports", href: "/dashboard/daily-reports" },
    { label: "Monthly Summary", href: "/dashboard/monthly-summary" },
  ];

  return (
    <div className={styles.sidebar}>
      <ul>
        {links.map((link) => (
          <li
            key={link.href}
            className={pathname === link.href ? styles.active : ""}
          >
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
