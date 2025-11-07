import { NextResponse } from "next/server";
import { getTransactions, executeQuery } from "@/lib/db";

// 🟢 GET - Fetch all transactions
export async function GET() {
  try {
    const transactions = await getTransactions();
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// 🟢 POST - Add a new transaction
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item, amount } = body;

    if (!item || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const query = `
      INSERT INTO Transactions (Item, Amount, TransactionDate)
      VALUES (@item, @amount, GETDATE())
    `;

    await executeQuery(query, [
      { name: "item", value: item },
      { name: "amount", value: amount },
    ]);

    return NextResponse.json(
      { message: "Transaction added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error adding transaction:", error);
    return NextResponse.json(
      { error: "Failed to add transaction" },
      { status: 500 }
    );
  }
}

// 🟢 DELETE - Delete transaction by ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const query = `DELETE FROM Transactions WHERE Id = @id`;
    await executeQuery(query, [{ name: "id", value: id }]);

    return NextResponse.json(
      { message: "Transaction deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
