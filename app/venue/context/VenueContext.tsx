"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type Venue } from "@/lib/api";

interface VenueContextValue {
  venues: Venue[];
  selectedVenue: Venue | null;
  setSelectedVenue: (v: Venue) => void;
  loading: boolean;
  refetch: () => void;
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
  refetch: () => void;
}) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    if (venues.length > 0 && !selectedVenue) {
      setSelectedVenue(venues[0]);
    }
  }, [venues]);

  return (
    <VenueContext.Provider value={{ venues, selectedVenue, setSelectedVenue, loading, refetch }}>
      {children}
    </VenueContext.Provider>
  );
}
