// app/api/auth/monthly-summary/route.ts
import { NextResponse } from "next/server";
import { getMonthlySummary } from "@/lib/db";

export async function GET() {
  try {
    const summary = await getMonthlySummary();
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch monthly summary" }, { status: 500 });
  }
}
