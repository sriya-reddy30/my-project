// import sql, { config as SQLConfig, ConnectionPool } from "mssql";

// const dbConfig: SQLConfig = {
//   user: process.env.DB_USER || "",
//   password: process.env.DB_PASSWORD || "",
//   server: process.env.DB_SERVER || "",
//   database: process.env.DB_NAME || "",
//   options: {
//     encrypt: false, // set true if using Azure
//     trustServerCertificate: true,
//     enableArithAbort: true,
//   },
// };

// let pool: ConnectionPool | null = null;

// export async function getConnection(): Promise<ConnectionPool> {
//   try {
//     if (pool) return pool;
//     pool = await sql.connect(dbConfig);
//     console.log("✅ Connected to MSSQL database");
//     return pool;
//   } catch (err) {
//     console.error("❌ Database connection failed:", err);
//     pool = null;
//     throw err;
//   }
// }

// export { sql };


































// // src/lib/db.ts
// import sql, { config as SQLConfig, ConnectionPool } from "mssql";

// const dbConfig: SQLConfig = {
//   user: process.env.DB_USER || "",
//   password: process.env.DB_PASSWORD || "",
//   server: process.env.DB_SERVER || "",
//   database: process.env.DB_NAME || "",
//   options: {
//     encrypt: false, // true if using Azure
//     trustServerCertificate: true,
//     enableArithAbort: true,
//   },
// };

// let pool: ConnectionPool | null = null;

// // ✅ Get or create a connection pool
// export async function getConnection(): Promise<ConnectionPool> {
//   try {
//     if (pool) return pool;
//     pool = await sql.connect(dbConfig);
//     console.log("✅ Connected to MSSQL database");
//     return pool;
//   } catch (err) {
//     console.error("❌ Database connection failed:", err);
//     pool = null;
//     throw err;
//   }
// }

// // ✅ Generic query executor
// export async function executeQuery(
//   query: string,
//   params?: { name: string; value: any }[]
// ) {
//   const connection = await getConnection();
//   const request = connection.request();

//   if (params) {
//     params.forEach((p) => request.input(p.name, p.value));
//   }

//   const result = await request.query(query);
//   return result.recordset;
// }

// /* ===== Dashboard / Transactions Helpers ===== */

// // Get all transactions
// export async function getTransactions() {
//   return await executeQuery(
//     "SELECT * FROM Transactions ORDER BY TransactionDate DESC"
//   );
// }

// // Get daily transactions
// export async function getDailyReports() {
//   return await executeQuery(
//     "SELECT * FROM Transactions WHERE CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE)"
//   );
// }

// // Get monthly summary
// export async function getMonthlySummary() {
//   return await executeQuery(
//     `SELECT 
//         MONTH(TransactionDate) AS Month,
//         SUM(Amount) AS Total
//       FROM Transactions
//       GROUP BY MONTH(TransactionDate)
//       ORDER BY Month`
//   );
// }

// // Export sql for advanced queries in other routes
// export { sql };




























import * as sql from "mssql";
import type { config as SQLConfig, ConnectionPool } from "mssql";

const dbConfig: SQLConfig = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME || "",
  options: {
    encrypt: false, // true if using Azure
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

let pool: ConnectionPool | null = null;

//  Get or create a shared connection pool
export async function getConnection(): Promise<ConnectionPool> {
  try {
    if (pool) return pool;
    pool = await sql.connect(dbConfig);
    console.log(" Connected to MSSQL database");
    return pool;
  } catch (err) {
    console.error(" Database connection failed:", err);
    pool = null;
    throw err;
  }
}

// Generic query helper
export async function executeQuery(
  query: string,
  params?: { name: string; value: any }[]
) {
  const connection = await getConnection();
  const request = connection.request();

  params?.forEach((p) => request.input(p.name, p.value));

  const result = await request.query(query);
  return result.recordset;
}

/* ===== Transactions Helpers ===== */

export type TransactionType = {
  id: number;
  item: string;
  amount: number;
  transactionDate: string;
};

//  Get all transactions sorted by date
export async function getTransactions(): Promise<TransactionType[]> {
  const result = await executeQuery(
    "SELECT * FROM Transactions ORDER BY TransactionDate DESC"
  );
  return result.map((t: any) => ({
    id: t.Id,
    item: t.Item,
    amount: t.Amount,
    transactionDate: new Date(t.TransactionDate).toISOString(),
  }));
}

//  Insert a new transaction
export async function addTransaction(item: string, amount: number) {
  const query = `
    INSERT INTO Transactions (Item, Amount, TransactionDate)
    VALUES (@item, @amount, GETDATE())
  `;
  await executeQuery(query, [
    { name: "item", value: item },
    { name: "amount", value: amount },
  ]);
}

//  Today's transactions
export async function getDailyReports() {
  return await executeQuery(`
    SELECT * 
    FROM Transactions
    WHERE CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE)
  `);
}

//  Monthly summary
export async function getMonthlySummary() {
  return await executeQuery(`
    SELECT 
      MONTH(TransactionDate) AS Month,
      SUM(Amount) AS Total
    FROM Transactions
    GROUP BY MONTH(TransactionDate)
    ORDER BY Month
  `);
}

export { sql };
