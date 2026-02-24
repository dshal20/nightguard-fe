"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, isAdmin } from "../../src/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [out, setOut] = useState("");

  async function signUp() {
    setOut("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      router.push(isAdmin(cred.user.email) ? "/admin" : "/venue");
    } catch (e) {
      setOut(e instanceof Error ? e.message : "Sign up error");
    }
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-white">Create an account</h2>
      <p className="mt-1 mb-8 text-sm text-zinc-500">Get started with NightGuard</p>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
          <input
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:ring-2 focus:ring-[#2B36CD]"
            style={{ backgroundColor: "#1a1a28", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
          <input
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:ring-2 focus:ring-[#2B36CD]"
            style={{ backgroundColor: "#1a1a28", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
      </div>

      <button
        onClick={signUp}
        className="mt-6 w-full cursor-pointer rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: "#2B36CD" }}
      >
        Sign up
      </button>

      {out && (
        <p
          className="mt-4 rounded-lg p-3 text-sm text-red-400"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          {out}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#2B36CD] hover:opacity-80 transition">
          Sign in
        </Link>
      </p>
    </>
  );
}
