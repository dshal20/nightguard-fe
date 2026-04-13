"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../src/lib/firebase";
import { joinVenue } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, KeyRound, Loader2 } from "lucide-react";
import { useVenueContext } from "./context/VenueContext";

function JoinVenuePrompt() {
  const { refetch } = useVenueContext();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();
      await joinVenue(token, trimmed);
      refetch();
    } catch {
      setError("Invalid invite code. Please check with your venue manager.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2A2A34] bg-[#11111D]">
            <Building2 className="h-6 w-6 text-[#8B8B9D]" />
          </div>
          <h1 className="text-xl font-bold text-[#DDDBDB]">Join a Venue</h1>
          <p className="mt-1.5 text-sm text-[#8B8B9D]">
            Enter the invite code provided by your venue manager.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8B9D]" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="INVITE CODE"
              spellCheck={false}
              className="pl-9 uppercase border-[#2A2A34] bg-[#11111D] text-[#DDDBDB] placeholder:text-[#4A4A5A] focus-visible:ring-[#3B3B5A]"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-[#262B75] hover:bg-[#2e3490] text-white disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Join Venue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function VenueIndexPage() {
  const { venues, loading } = useVenueContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && venues.length > 0) {
      router.replace(`/venue/${venues[0].id}`);
    }
  }, [venues, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#8B8B9D]">Loading…</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return <JoinVenuePrompt />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-[#8B8B9D]">Loading…</p>
    </div>
  );
}
