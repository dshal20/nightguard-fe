"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../src/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";

export default function VenueDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600">Loading...</p>
      </main>
    );
  }

  async function handleSignOut() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Venue Dashboard
        </h1>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Sign out
        </button>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">
        Signed in as <span className="font-medium">{user.email}</span>
      </p>
    </main>
  );
}
