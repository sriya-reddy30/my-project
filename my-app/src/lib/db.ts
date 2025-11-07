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
import type { config as SQLConfig, ConnectionPool, ISqlTypeFactory } from "mssql";

/* ======================================================
   🔧 Database Configuration
====================================================== */
const dbConfig: SQLConfig = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME || "",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

let pool: ConnectionPool | null = null;

/* ======================================================
   ✅ Create or Reuse a Shared MSSQL Connection Pool
====================================================== */
export async function getConnection(): Promise<ConnectionPool> {
  try {
    if (pool) return pool;
    pool = await sql.connect(dbConfig);
    console.log("✅ Connected to MSSQL database");
    return pool;
  } catch (error: unknown) {
    console.error("❌ Database connection failed:", error);
    pool = null;
    throw error;
  }
}

/* ======================================================
   🧱 Helper: Add SQL Inputs (Overload-Safe)
====================================================== */

// TypeScript-overload-safe helper
function addInput(request: sql.Request, name: string, value: unknown, type?: ISqlTypeFactory): void;
function addInput(request: sql.Request, name: string, value: unknown, type?: ISqlTypeFactory): void {
  if (type) {
    // Explicitly cast to overload signature with 3 parameters
    (request.input as (name: string, type: ISqlTypeFactory, value: unknown) => sql.Request)(
      name,
      type,
      value
    );
  } else {
    // Overload with 2 parameters
    (request.input as (name: string, value: unknown) => sql.Request)(name, value);
  }
}

/* ======================================================
   ⚙️ Generic Query Helper (Type-safe)
====================================================== */
export async function executeQuery<T = unknown>(
  query: string,
  params?: { name: string; type?: ISqlTypeFactory; value: unknown }[]
): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();

  params?.forEach((p) => addInput(request, p.name, p.value, p.type));

  const result = await request.query<T>(query);
  return result.recordset;
}

/* ======================================================
   💰 Transactions and Reports
====================================================== */

export interface TransactionType {
  id: number;
  item: string;
  amount: number;
  transactionDate: string;
}

/* 🔹 Get all transactions */
export async function getTransactions(): Promise<TransactionType[]> {
  const result = await executeQuery<{
    Id: number;
    Item: string;
    Amount: number;
    TransactionDate: Date;
  }>("SELECT * FROM Transactions ORDER BY TransactionDate DESC");

  return result.map((t) => ({
    id: t.Id,
    item: t.Item,
    amount: t.Amount,
    transactionDate: new Date(t.TransactionDate).toISOString(),
  }));
}

/* 🔹 Add a new transaction */
export async function addTransaction(item: string, amount: number): Promise<void> {
  const query = `
    INSERT INTO Transactions (Item, Amount, TransactionDate)
    VALUES (@item, @amount, GETDATE())
  `;
  await executeQuery(query, [
    { name: "item", type: sql.VarChar(255), value: item },
    { name: "amount", type: sql.Decimal(10, 2), value: amount },
  ]);
}

/* 🔹 Get today's transactions (Daily Reports) */
export async function getDailyReports(): Promise<TransactionType[]> {
  const result = await executeQuery<{
    Id: number;
    Item: string;
    Amount: number;
    TransactionDate: Date;
  }>(`
    SELECT * 
    FROM Transactions
    WHERE CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE)
  `);

  return result.map((t) => ({
    id: t.Id,
    item: t.Item,
    amount: t.Amount,
    transactionDate: new Date(t.TransactionDate).toISOString(),
  }));
}

/* 🔹 Get monthly summary */
export interface MonthlySummary {
  Month: number;
  Total: number;
}

export async function getMonthlySummary(): Promise<MonthlySummary[]> {
  const result = await executeQuery<{
    Month: number;
    Total: number;
  }>(`
    SELECT 
      MONTH(TransactionDate) AS Month,
      SUM(Amount) AS Total
    FROM Transactions
    GROUP BY MONTH(TransactionDate)
    ORDER BY Month
  `);

  return result.map((row) => ({
    Month: row.Month,
    Total: row.Total,
  }));
}

/* ======================================================
   📦 Export SQL for other modules
====================================================== */
export { sql };
