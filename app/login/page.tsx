"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, isAdmin } from "../src/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [out, setOut] = useState("");

  async function signUp() {
    setOut("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      router.push(isAdmin(cred.user.email) ? "/admin" : "/venue");
    } catch (e: any) {
      setOut(e.message ?? "Sign up error");
    }
  }

  async function signIn() {
    setOut("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      router.push(isAdmin(cred.user.email) ? "/admin" : "/venue");
    } catch (e: any) {
      setOut(e.message ?? "Sign in error");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        NightGuard Auth MVP
      </h1>

      <div className="mb-4">
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="mb-6">
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={signUp}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sign up
        </button>
        <button
          onClick={signIn}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sign in
        </button>
      </div>

      {out && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {out}
        </p>
      )}
    </main>
  );
}
