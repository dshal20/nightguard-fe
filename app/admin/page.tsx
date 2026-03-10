"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../src/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { getVenues, getMe, type Venue, type UserProfile } from "@/lib/api";
import { Plus, Loader2, Building } from "lucide-react";
import VenueCard from "./components/VenueCard";
import CreateVenueDialog from "./components/CreateVenueDialog";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venuesError, setVenuesError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const token = await u.getIdToken();
          const me = await getMe(token);
          setProfile(me);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isAdmin = profile?.role === "ADMIN";

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (!isAdmin) router.push("/venue");
    }
  }, [loading, user, isAdmin, router]);

  const fetchVenues = useCallback(async () => {
    if (!user) return;
    setVenuesLoading(true);
    setVenuesError(null);
    try {
      const token = await user.getIdToken();
      const data = await getVenues(token);
      setVenues(data);
    } catch {
      setVenuesError("Failed to load venues. Please try again.");
    } finally {
      setVenuesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchVenues();
    }
  }, [user, isAdmin, fetchVenues]);

  if (loading || !user || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B12]">
        <Loader2 className="h-6 w-6 animate-spin text-[#5B6AFF]" />
      </main>
    );
  }

  async function handleSignOut() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#0B0B12]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-[#8B8B9D]">
              Signed in as <span className="text-[#DDDBDB]">{user.email}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-[#2A2A34] bg-[#131319] px-4 py-2 text-sm font-medium text-[#8B8B9D] transition hover:border-[#3A3A44] hover:text-white"
          >
            Sign out
          </button>
        </div>

        {/* Venues Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Your Venues</h2>
              {!venuesLoading && (
                <span className="rounded-full bg-[#2B36CD]/15 px-2.5 py-0.5 text-xs font-bold text-[#5B6AFF]">
                  {venues.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-[#2B36CD] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Venue
            </button>
          </div>

          {venuesLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#5B6AFF]" />
            </div>
          )}

          {venuesError && (
            <div className="rounded-xl border border-[#EB4869]/30 bg-[#EB4869]/10 px-6 py-4 text-sm text-[#E84868]">
              <p>{venuesError}</p>
              <button
                onClick={fetchVenues}
                className="mt-2 text-xs font-bold underline underline-offset-2 transition hover:text-white"
              >
                Retry
              </button>
            </div>
          )}

          {!venuesLoading && !venuesError && venues.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2A2A34] py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2B36CD]/10">
                <Building className="h-6 w-6 text-[#5B6AFF]" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                No venues yet
              </h3>
              <p className="mt-1 max-w-xs text-sm text-[#8B8B9D]">
                Create your first venue to get started. You&apos;ll get an invite
                code to share with your team.
              </p>
              <button
                onClick={() => setCreateOpen(true)}
                className="mt-5 flex items-center gap-2 rounded-lg bg-[#2B36CD] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Create Venue
              </button>
            </div>
          )}

          {!venuesLoading && !venuesError && venues.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateVenueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchVenues}
      />
    </main>
  );
}
