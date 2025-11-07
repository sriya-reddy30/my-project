// app/api/auth/daily-reports/route.ts
import { NextResponse } from "next/server";
import { getDailyReports } from "@/lib/db";

export async function GET() {
  try {
    const reports = await getDailyReports();
    const formatted = reports.map((t: any) => ({
      id: t.Id,
      item: t.Item,
      amount: t.Amount,
      transactionDate: t.TransactionDate,
    }));
    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch daily reports" }, { status: 500 });
  }
}
