import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { getConnection, sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("email", sql.VarChar(255), normalizedEmail)
      .input("password", sql.VarChar(255), password)

      .query("SELECT Id, Email, Username, Password FROM Users WHERE Email=@email");

    const user = result.recordset[0];

    console.log("User lookup:", user);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.Password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

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
  } catch (error: any) {
    console.error(" Login error:", error);
    return NextResponse.json(
      { error: "Login failed", details: error.message },
      { status: 500 }
    );
  }
}
