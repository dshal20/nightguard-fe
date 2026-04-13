"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { type Venue } from "@/lib/api";

interface VenueContextValue {
  venues: Venue[];
  selectedVenue: Venue | null;
  setSelectedVenue: (v: Venue) => void;
  loading: boolean;
  refetch: () => unknown;
}

const VenueContext = createContext<VenueContextValue>({
  venues: [],
  selectedVenue: null,
  setSelectedVenue: () => {},
  loading: true,
  refetch: () => {},
});

export function useVenueContext() {
  return useContext(VenueContext);
}

export function VenueProvider({
  children,
  venues,
  loading,
  refetch,
}: {
  children: ReactNode;
  venues: Venue[];
  loading: boolean;
  refetch: () => unknown;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const venueId = typeof params?.id === "string" ? params.id : null;
  const selectedVenue = venueId
    ? (venues.find((v) => v.id === venueId) ?? null)
    : (venues[0] ?? null);

  function setSelectedVenue(v: Venue) {
    // Preserve the current sub-path (e.g. /incidents) when switching venues
    const subPath = pathname?.replace(/^\/venue\/[^/]+/, "") ?? "";
    router.push(`/venue/${v.id}${subPath}`);
  }

  return (
    <VenueContext.Provider value={{ venues, selectedVenue, setSelectedVenue, loading, refetch }}>
      {children}
    </VenueContext.Provider>
  );
}
