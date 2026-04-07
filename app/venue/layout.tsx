"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../src/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import VenueSidebar from "./components/VenueSidebar";
import TopBar from "./components/TopBar";
import { VenueProvider } from "./context/VenueContext";
import { useVenuesQuery } from "@/lib/queries";
import { Menu } from "lucide-react";

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

const { data: venues = [], isLoading: venuesLoading, refetch } = useVenuesQuery();

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101018]">
        <p className="text-[#8B8B9D]">Loading...</p>
      </div>
    );
  }

  return (
    <VenueProvider venues={venues} loading={venuesLoading} refetch={refetch}>
      <div className="min-h-screen bg-[#101018]">
        <VenueSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Backdrop — mobile only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[9] bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="lg:pl-67">
          {/* Hamburger — only visible when sidebar would overlay */}
          <div className="flex items-center px-4 pt-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-lg border border-[#2A2A34] bg-[#11111B] p-2 text-[#8B8B9D] transition hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <TopBar />
          {children}
        </div>
      </div>
    </VenueProvider>
  );
}
