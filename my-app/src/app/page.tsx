"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // 👈 Automatically go to login
  }, [router]);

  return null; // Nothing to render, it just redirects
}
