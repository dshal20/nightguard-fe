"use client";

import { useEffect, useState } from "react";
import { auth } from "../src/lib/firebase";
import { getVenues, getIncidents, type IncidentResponse } from "@/lib/api";
import VenueHeader from "./components/VenueHeader";
import StatCard from "./components/StatCard";
import RecentReports from "./components/RecentReports";
import LiveActivity from "./components/LiveActivity";

export default function VenueDashboard() {
  const [venueId, setVenueId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  useEffect(() => {
    async function loadData() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const venues = await getVenues(token);
        if (venues.length > 0) {
          setVenueId(venues[0].id);
          const data = await getIncidents(token, venues[0].id);
          setIncidents(data);
        }
      } catch {
        // fetch failed silently
      } finally {
        setLoadingIncidents(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-[1172px] px-8 py-8">
      <VenueHeader venueId={venueId ?? ""} />
      <p className="mt-2 font-mono text-xs text-white/[0.28]">
        3h 20m 5s elapsed
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="ACTIVE INCIDENTS"
              value={2}
              meta="Last report 2 mins ago"
              subtitle="↑ 2 from Last Hour"
              accent="red"
            />
            <StatCard
              title="TOTAL TONIGHT"
              value={2}
              meta="Last report 2 mins ago"
              subtitle="↑ 2% vs Last Friday"
              accent="amber"
            />
            <StatCard
              title="CURRENT CAPACITY"
              value={247}
              meta="Last reported 1 min ago"
              subtitle="of 300 Max Capacity"
              accent="green"
            />
            <StatCard
              title="NETWORK ALERTS"
              value={13}
              meta="Last report 2 mins ago"
              subtitle="From 4 Venues"
              accent="blue"
            />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RecentReports incidents={incidents} loading={loadingIncidents} />
            </div>
            <div>
              <LiveActivity />
            </div>
          </div>
    </div>
  );
}
