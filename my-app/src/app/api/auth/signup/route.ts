import "dotenv/config"; // make sure .env variables load
import { NextRequest, NextResponse } from "next/server";
import { getConnection, sql } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST = register a new user
export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const pool = await getConnection();

    // Check if user already exists
    const existingUser = await pool
      .request()
      .input("email", sql.VarChar(255), normalizedEmail)
      .query("SELECT 1 FROM Users WHERE Email=@email");

    if (existingUser.recordset.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Insert new user
    await pool
      .request()
      .input("email", sql.VarChar(255), normalizedEmail)
      .input("username", sql.VarChar(100), username)
      .input("password", sql.VarChar(255), hashedPassword) // varchar(255) is safer
      .query("INSERT INTO Users (Email, Username, Password) VALUES (@email, @username, @password)");

    console.log(` User created: ${normalizedEmail}`);

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error(" Signup error:", error);
    return NextResponse.json({ error: "Signup failed", details: error.message }, { status: 500 });
  }
}
       