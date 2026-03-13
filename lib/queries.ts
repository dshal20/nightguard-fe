"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/src/lib/firebase";
import { getVenues, getIncidents, getCapacity, getHeadcounts, getOffenders, getOffenderIncidents } from "@/lib/api";

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const t = await user.getIdToken();
        setToken(t);
      } else {
        setToken(null);
      }
    });
    return () => unsub();
  }, []);

  return token;
}

export function useVenuesQuery() {
  const token = useAuthToken();
  return useQuery({
    queryKey: ["venues", token],
    queryFn: () => getVenues(token!),
    enabled: !!token,
  });
}

export function useIncidentsQuery(venueId: string | null | undefined) {
  const token = useAuthToken();
  return useQuery({
    queryKey: ["incidents", venueId],
    queryFn: () => getIncidents(token!, venueId!),
    enabled: !!token && !!venueId,
  });
}

export function useCapacityQuery(venueId: string | null | undefined) {
  const token = useAuthToken();
  return useQuery({
    queryKey: ["capacity", venueId],
    queryFn: () => getCapacity(token!, venueId!),
    enabled: !!token && !!venueId,
  });
}

export function useHeadcountsQuery(venueId: string | null | undefined) {
  const token = useAuthToken();
  return useQuery({
    queryKey: ["headcounts", venueId],
    queryFn: () => getHeadcounts(token!, venueId!),
    enabled: !!token && !!venueId,
  });
}

export function useOffenderIncidentsQuery(offenderId: string | null | undefined) {
  const token = useAuthToken();
  return useQuery({
    queryKey: ["offenderIncidents", offenderId],
    queryFn: () => getOffenderIncidents(token!, offenderId!),
    enabled: !!token && !!offenderId,
  });
}

export function useOffendersQuery(venueId: string | null | undefined) {
  const token = useAuthToken();
  return useQuery({
    queryKey: ["offenders", venueId],
    queryFn: () => getOffenders(token!, venueId!),
    enabled: !!token && !!venueId,
  });
}
