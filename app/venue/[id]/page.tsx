"use client";

import { useIncidentsQuery, useCapacityQuery, useHeadcountsQuery } from "@/lib/queries";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
import VenueHeader from "../components/VenueHeader";
import StatCard from "../components/StatCard";
import NetworkAlertsCard from "../components/NetworkAlertsCard";
import RecentReports from "../components/RecentReports";
import LiveActivity from "../components/LiveActivity";
import OffenderSearch from "../components/OffenderSearch";
import { useVenueContext } from "../context/VenueContext";

export default function VenueDashboard() {
  const { selectedVenue } = useVenueContext();
  const { data: incidents = [], isLoading: loadingIncidents } =
    useIncidentsQuery(selectedVenue?.id);
  const { data: capacityData } = useCapacityQuery(selectedVenue?.id);
  const { data: headcounts = [] } = useHeadcountsQuery(selectedVenue?.id);

  const activeIncidents = incidents.filter((i) => i.status === "ACTIVE");
  const maxCapacity = capacityData?.capacity ?? null;
  const latestHeadcount =
    headcounts.length > 0 ? headcounts[headcounts.length - 1] : null;
  const currentCount = latestHeadcount?.headcount ?? 0;
  const capacityPct = maxCapacity ? currentCount / maxCapacity : null;
  const capacityAccent =
    capacityPct == null
      ? "green"
      : capacityPct >= 1
        ? "red"
        : capacityPct >= 0.9
          ? "amber"
          : "green";

  return (
    <div className="mx-auto max-w-screen-2xl px-8 py-8">
      <VenueHeader venueId={selectedVenue?.id ?? ""} />
      <p className="mt-2 font-mono text-xs text-white/[0.28]">
        3h 20m 5s elapsed
      </p>
      <div className="mt-5">
        <OffenderSearch />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="ACTIVE INCIDENTS"
          value={loadingIncidents ? "—" : activeIncidents.length}
          meta={
            loadingIncidents
              ? "Loading..."
              : `${activeIncidents.length} reported`
          }
          subtitle="Within this venue"
          accent="red"
        />
        <StatCard
          title="TOTAL - LAST 24 HOURS"
          value={
            incidents.filter(
              (i) => dayjs().diff(dayjs(i.createdAt), "hour") < 24,
            ).length
          }
          meta={
            loadingIncidents
              ? "Loading..."
              : `${
                  incidents.filter(
                    (i) => dayjs().diff(dayjs(i.createdAt), "hour") < 24,
                  ).length
                } reports in queue`
          }
          subtitle="All incidents logged last 24 hours"
          accent="amber"
        />
        <StatCard
          title="CURRENT CAPACITY"
          value={maxCapacity == null ? "—" : currentCount}
          meta={
            maxCapacity == null
              ? "No capacity set"
              : latestHeadcount
                ? `Updated ${dayjs(latestHeadcount.createdAt).fromNow()}`
                : "No headcount logged"
          }
          subtitle={
            maxCapacity != null ? `of ${maxCapacity} max capacity` : undefined
          }
          accent={capacityAccent}
          progress={capacityPct ?? undefined}
        />
        <NetworkAlertsCard />
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
