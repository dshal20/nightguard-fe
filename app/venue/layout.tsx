"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../src/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import VenueSidebar from "./components/VenueSidebar";

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div className="flex min-h-screen items-center justify-center bg-[#101018]">
        <p className="text-[#8B8B9D]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101018]">
      <VenueSidebar />
      <div className="pl-[268px]">{children}</div>
    </div>
  );
}
