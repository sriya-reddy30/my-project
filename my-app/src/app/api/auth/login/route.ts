import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { getConnection, sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Connect to database
    const pool = await getConnection();

    // Fetch user by email
    const result = await pool
      .request()
      .input("email", sql.VarChar(255), normalizedEmail)
      .query("SELECT Id, Email, Username, Password FROM Users WHERE Email=@email");

    const user = result.recordset[0];

    console.log("🔍 User lookup:", user);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare passwords securely
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Successful login
    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.Id,
          email: user.Email,
          username: user.Username,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // ✅ Safe and lint-clean error handling
    console.error("Login error:", error);

    const message =
      error instanceof Error ? error.message : "Login failed";

    return NextResponse.json(
      { error: "Login failed", details: message },
      { status: 500 }
    );
  }
}
