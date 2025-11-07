import { NextResponse } from "next/server";
import { getDailyReports } from "@/lib/db";

// If your DB function already returns formatted results (id, item, amount, transactionDate),
// this interface matches that shape exactly.
export interface DailyReport {
  id: number;
  item: string;
  amount: number;
  transactionDate: string;
}

export async function GET() {
  try {
    // getDailyReports() from lib/db.ts already returns an array of objects with correct types.
    const reports: DailyReport[] = await getDailyReports();

    // Optional: validate or log output
    console.log(`✅ Fetched ${reports.length} daily reports`);

    // Return formatted JSON response
    return NextResponse.json(reports, { status: 200 });
  } catch (error: unknown) {
    console.error("❌ Daily Reports API error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch daily reports";

    return NextResponse.json(
      { error: "Failed to fetch daily reports", details: message },
      { status: 500 }
    );
  }
}
