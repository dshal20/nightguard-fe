"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../src/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import VenueSidebar from "./components/VenueSidebar";
import { VenueProvider } from "./context/VenueContext";
import { getVenues, type Venue } from "@/lib/api";

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  function fetchVenues(u: typeof user) {
    if (!u) return;
    setVenuesLoading(true);
    u.getIdToken()
      .then((token) => getVenues(token))
      .then(setVenues)
      .catch(() => {})
      .finally(() => setVenuesLoading(false));
  }

  useEffect(() => {
    fetchVenues(user);
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101018]">
        <p className="text-[#8B8B9D]">Loading...</p>
      </div>
    );
  }

  return (
    <VenueProvider venues={venues} loading={venuesLoading} refetch={() => fetchVenues(user)}>
      <div className="min-h-screen bg-[#101018]">
        <VenueSidebar />
        <div className="pl-[268px]">{children}</div>
      </div>
    </VenueProvider>
  );
}
