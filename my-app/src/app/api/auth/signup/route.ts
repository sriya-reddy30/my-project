import "dotenv/config"; // ensure .env variables are loaded
import { NextRequest, NextResponse } from "next/server";
import { getConnection, sql } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST = register a new user
export async function POST(req: NextRequest) {
  try {
    // Parse JSON body
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Connect to database
    const pool = await getConnection();

    // Check if user already exists
    const existingUser = await pool
      .request()
      .input("email", sql.VarChar(255), normalizedEmail)
      .query("SELECT 1 FROM Users WHERE Email=@email");

    if (existingUser.recordset.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Insert new user
    await pool
      .request()
      .input("email", sql.VarChar(255), normalizedEmail)
      .input("username", sql.VarChar(100), username)
      .input("password", sql.VarChar(255), hashedPassword)
      .query(
        "INSERT INTO Users (Email, Username, Password) VALUES (@email, @username, @password)"
      );

    console.log(`✅ User created: ${normalizedEmail}`);

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    // ✅ Use `unknown` for type safety
    console.error("Signup error:", error);

    // Safely extract message
    const message =
      error instanceof Error ? error.message : "Signup failed";

    return NextResponse.json(
      { error: "Signup failed", details: message },
      { status: 500 }
    );
  }
}
