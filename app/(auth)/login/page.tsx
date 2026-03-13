"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "firebase/auth";
import { auth } from "../../src/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getMe } from "@/lib/api";
import ProfileSetupDialog from "@/components/ProfileSetupDialog";
import AbuseReportModal from "@/components/AbuseReportModal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [out, setOut] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [abuseReportOpen, setAbuseReportOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState("");

  async function signIn() {
    setOut("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const profile = await getMe(token);
      const destination = "/venue";

      if (!profile.firstName || !profile.lastName) {
        setFirebaseUser(cred.user);
        setPendingRedirect(destination);
        setDialogOpen(true);
      } else {
        router.push(destination);
      }
    } catch (e) {
      setOut(e instanceof Error ? e.message : "Sign in error");
    }
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
      <p className="mt-1 mb-8 text-sm text-zinc-500">Sign in to your account</p>

      <form onSubmit={(e) => { e.preventDefault(); signIn(); }} className="space-y-4">
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

        <button
          type="submit"
          className="mt-2 w-full cursor-pointer rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "#2B36CD" }}
        >
          Sign in
        </button>
      </form>

      {out && (
        <p
          className="mt-4 rounded-lg p-3 text-sm text-red-400"
          style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          {out}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-[#2B36CD] hover:opacity-80 transition">
          Sign up
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-zinc-600">
        Need to report a safety concern?{" "}
        <button
          onClick={() => setAbuseReportOpen(true)}
          className="font-medium text-zinc-500 hover:text-zinc-300 transition underline underline-offset-2"
        >
          Submit an abuse report
        </button>
      </p>

      {dialogOpen && firebaseUser && (
        <ProfileSetupDialog
          open={dialogOpen}
          firebaseUser={firebaseUser}
          onComplete={() => router.push(pendingRedirect)}
        />
      )}

      <AbuseReportModal open={abuseReportOpen} onClose={() => setAbuseReportOpen(false)} />
    </>
  );
}
