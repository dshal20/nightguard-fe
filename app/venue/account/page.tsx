"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, isAdmin } from "../../src/lib/firebase";
import { getVenues, type Venue } from "@/lib/api";

export default function VenueAccountPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);

  useEffect(() => {
    async function loadVenue() {
      const user = auth.currentUser;
      if (!user) return;

      setUserEmail(user.email ?? null);

      try {
        const token = await user.getIdToken();
        const venues = await getVenues(token);
        if (venues.length > 0) setVenue(venues[0]);
      } catch {
        // ignore venue load failures here
      }
    }

    loadVenue();
  }, []);

  const name = userEmail?.split("@")[0] ?? "User";
  const status = isAdmin(userEmail) ? "Admin" : "Venue Manager";

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-[1172px] px-8 py-8">
      <h1 className="mb-8 text-2xl font-bold text-[#E2E2E2]">Account</h1>
      <div className="max-w-md rounded-[21px] border border-[#2A2A34] bg-[#11111B] p-6">
        <p className="text-sm font-medium text-[#8B8B9D]">Name</p>
        <p className="mt-1 text-lg font-bold text-[#E2E2E2]">{name}</p>

        <p className="mt-6 text-sm font-medium text-[#8B8B9D]">Status</p>
        <p className="mt-1 text-lg font-bold text-[#E2E2E2]">{status}</p>

        <p className="mt-6 text-sm font-medium text-[#8B8B9D]">Venue</p>
        <p className="mt-1 text-lg font-bold text-[#E2E2E2]">
          {venue?.name ?? "Loading venue…"}
        </p>
        {venue && (
          <p className="text-xs font-medium text-[#8B8B9D]">
            {venue.city}, {venue.state}
          </p>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 rounded-lg border border-[#2A2A34] bg-[#26262F]/48 px-4 py-2.5 text-sm font-bold text-white hover:bg-[#26262F]"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
