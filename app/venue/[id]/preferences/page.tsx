"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, MapPin, Phone, Key, Save, Bell, BellOff, Loader2, Search, Share2, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVenueContext } from "../../context/VenueContext";
import { useNearbyVenuesQuery, useSubscriptionsQuery, useAuthToken } from "@/lib/queries";
import { subscribeToVenues, unsubscribeFromVenue, updateDataSharing, updateSubscriptionLevel, updateVenue, uploadFile, type IncidentSeverity } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type Tab = "settings" | "notifications";

function Field({
  label, name, value, onChange, placeholder, icon, readOnly, hint,
}: {
  label: string; name: string; value: string;
  onChange?: (v: string) => void; placeholder?: string;
  icon?: React.ReactNode; readOnly?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#555568]">
        {label}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#44445A]">{icon}</span>}
        <Input
          name={name} value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder} readOnly={readOnly}
          className={`border-white/8 bg-[#0D0D16] text-[#DDDBDB] placeholder:text-[#2E2E3E] focus-visible:border-primary/50 focus-visible:ring-primary/20 ${icon ? "pl-9" : ""} ${readOnly ? "cursor-default select-all opacity-60" : ""}`}
        />
      </div>
      {hint && <p className="text-[10px] text-[#44445A]">{hint}</p>}
    </div>
  );
}

export default function VenuePreferencesPage() {
  const { selectedVenue, refetch } = useVenueContext();
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("settings");
  const [form, setForm] = useState({
    name: "", streetAddress: "", city: "", state: "", postalCode: "", phoneNumber: "",
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [dataSharingPending, setDataSharingPending] = useState(false);
  const [search, setSearch] = useState({ city: "", state: "", zip: "" });
  const [committed, setCommitted] = useState({ city: "", state: "", zip: "" });
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingLevelId, setPendingLevelId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!selectedVenue) return;
    setForm({
      name:          selectedVenue.name,
      streetAddress: selectedVenue.streetAddress,
      city:          selectedVenue.city,
      state:         selectedVenue.state,
      postalCode:    selectedVenue.postalCode,
      phoneNumber:   selectedVenue.phoneNumber,
    });
    setImagePreview(selectedVenue.venueImageUrl ?? null);
    setImageFile(null);
    const loc = { city: selectedVenue.city, state: selectedVenue.state, zip: selectedVenue.postalCode };
    setSearch(loc);
    setCommitted(loc);
  }, [selectedVenue]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setSaved(false);
  }

  const { data: nearbyVenues = [], isLoading: loadingNearby } = useNearbyVenuesQuery(selectedVenue?.id, committed.city, committed.state, committed.zip || undefined);
  const { data: subscriptions = [] } = useSubscriptionsQuery(selectedVenue?.id);

  const subscribedIds = new Set(subscriptions.map((s) => s.venueId));

  function set(key: keyof typeof form) {
    return (v: string) => { setSaved(false); setForm((f) => ({ ...f, [key]: v })); };
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !selectedVenue) return;
    setSaved(false);
    setSaveError(false);
    try {
      let venueImageUrl: string | undefined = selectedVenue.venueImageUrl ?? undefined;
      if (imageFile) {
        setImageUploading(true);
        venueImageUrl = await uploadFile(token, imageFile);
        setImageFile(null);
      }
      await updateVenue(token, selectedVenue.id, { ...form, venueImageUrl });
      await refetch();
      setSaved(true);
    } catch {
      setSaveError(true);
    } finally {
      setImageUploading(false);
    }
  }

  async function handleDataSharingToggle() {
    if (!token || !selectedVenue) return;
    setDataSharingPending(true);
    try {
      await updateDataSharing(token, selectedVenue.id, !selectedVenue.dataSharingEnabled);
      await refetch();
    } finally {
      setDataSharingPending(false);
    }
  }

  async function handleToggle(targetId: string) {
    if (!token || !selectedVenue) return;
    setPendingId(targetId);
    try {
      if (subscribedIds.has(targetId)) {
        await unsubscribeFromVenue(token, selectedVenue.id, targetId);
      } else {
        await subscribeToVenues(token, selectedVenue.id, [targetId]);
      }
      queryClient.invalidateQueries({ queryKey: ["subscriptions", selectedVenue.id] });
    } finally {
      setPendingId(null);
    }
  }

  async function handleLevelChange(targetVenueId: string, level: IncidentSeverity) {
    if (!token || !selectedVenue) return;
    setPendingLevelId(targetVenueId);
    try {
      await updateSubscriptionLevel(token, selectedVenue.id, targetVenueId, level);
      queryClient.invalidateQueries({ queryKey: ["subscriptions", selectedVenue.id] });
    } finally {
      setPendingLevelId(null);
    }
  }

  if (!selectedVenue) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[#8B8B9D]">No venue selected.</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "settings",      label: "Settings"      },
    { key: "notifications", label: "Notifications" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#E2E2E2]">Venue Preferences</h1>
        <p className="mt-1 text-sm text-[#555568]">
          Manage your venue details and notification subscriptions.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 border-b border-white/6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{ marginBottom: tab === key ? "-1px" : undefined }}
            className={`px-4 pb-3 text-xs font-semibold transition-colors ${
              tab === key
                ? "border-b-2 border-primary text-white"
                : "text-[#555568] hover:text-[#8B8B9D]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Settings tab */}
      {tab === "settings" && (
        <form onSubmit={handleSave} className="space-y-8">
          <section className="rounded-xl border border-white/[0.07] bg-[#11111B]">
            <div className="flex items-center gap-2.5 border-b border-white/6 px-6 py-4">
              <Building2 className="h-4 w-4 text-[#555568]" />
              <h2 className="text-sm font-bold text-[#DDDBDB]">Venue Identity</h2>
            </div>

            {/* Venue image upload */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="group relative w-full overflow-hidden border-b border-white/6s:outline-none"
              style={{ height: imagePreview ? undefined : "140px" }}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Venue"
                  className="w-full object-cover"
                  style={{ maxHeight: "220px", minHeight: "140px" }}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#0D0D16]">
                  <Camera className="h-6 w-6 text-[#44445A]" />
                  <span className="text-[11px] text-[#44445A]">Upload venue photo</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/60 px-3 py-2">
                  <Camera className="h-4 w-4 text-white" />
                  <span className="text-xs font-medium text-white">
                    {imagePreview ? "Change photo" : "Upload photo"}
                  </span>
                </div>
              </div>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            <div className="space-y-4 p-6">
              <Field label="Venue Name" name="name" value={form.name} onChange={set("name")} placeholder="e.g. The Grand Ballroom" icon={<Building2 className="h-3.5 w-3.5" />} />
              <Field label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="e.g. +1 (555) 000-0000" icon={<Phone className="h-3.5 w-3.5" />} />
            </div>
          </section>

          <section className="rounded-xl border border-white/[0.07] bg-[#11111B]">
            <div className="flex items-center gap-2.5 border-b border-white/6 py-4">
              <MapPin className="h-4 w-4 text-[#555568]" />
              <h2 className="text-sm font-bold text-[#DDDBDB]">Address</h2>
            </div>
            <div className="space-y-4 p-6">
              <Field label="Street Address" name="streetAddress" value={form.streetAddress} onChange={set("streetAddress")} placeholder="e.g. 123 Main St" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" name="city" value={form.city} onChange={set("city")} placeholder="e.g. New York" />
                <Field label="State" name="state" value={form.state} onChange={set("state")} placeholder="e.g. NY" />
              </div>
              <Field label="Postal Code" name="postalCode" value={form.postalCode} onChange={set("postalCode")} placeholder="e.g. 10001" />
            </div>
          </section>

          <section className="rounded-xl border border-white/[0.07] bg-[#11111B]">
            <div className="flex items-center gap-2.5 border-b border-white/6 px-6 py-4">
              <Key className="h-4 w-4 text-[#555568]" />
              <h2 className="text-sm font-bold text-[#DDDBDB]">Invite Code</h2>
            </div>
            <div className="p-6">
              <Field label="Invite Code" name="inviteCode" value={selectedVenue.inviteCode} readOnly hint="Share this code with staff so they can join this venue. Contact support to rotate it." />
            </div>
          </section>

          <section className="rounded-xl border border-white/[0.07] bg-[#11111B]">
            <div className="flex items-center gap-2.5 border-b border-white/6 px-6 py-4">
              <Share2 className="h-4 w-4 text-[#555568]" />
              <h2 className="text-sm font-bold text-[#DDDBDB]">Data Sharing</h2>
            </div>
            <div className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="text-xs font-medium text-[#DDDBDB]">Share venue data with the network</p>
                <p className="mt-0.5 text-[11px] text-[#555568]">
                  When enabled, this venue appears in nearby venue searches and can receive network subscriptions from other venues.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDataSharingToggle}
                disabled={dataSharingPending}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${
                  selectedVenue.dataSharingEnabled ? "bg-primary" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                    selectedVenue.dataSharingEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          <div className="space-y-2">
            <Button type="submit" size="sm" disabled={imageUploading} className="h-10 w-full gap-1.5 border border-primary bg-primary/50 px-4 text-white hover:bg-primary/70 disabled:opacity-60">
              {imageUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {imageUploading ? "Uploading photo…" : "Save Changes"}
            </Button>
            {saved && <p className="text-center text-xs text-[#75FB94]">Changes saved.</p>}
            {saveError && <p className="text-center text-xs text-red-400">Failed to save changes.</p>}
          </div>
        </form>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <div className="space-y-6">

          {/* Current subscriptions */}
          <section className="rounded-xl border border-white/[0.07] bg-[#11111B]">
            <div className="flex items-center gap-2.5 border-b border-white/6 px-6 py-4">
              <Bell className="h-4 w-4 text-[#555568]" />
              <h2 className="text-sm font-bold text-[#DDDBDB]">Current Subscriptions</h2>
              {subscriptions.length > 0 && (
                <span className="ml-auto text-[10px] font-semibold text-[#555568]">
                  {subscriptions.length} venue{subscriptions.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {subscriptions.length === 0 ? (
              <p className="px-6 py-8 text-center text-xs text-[#555568]">
                Not subscribed to any venues yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/6 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase text-[#555568]">Venue</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-[#555568]">Address</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-[#555568]">Location</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-[#555568]">Min. Level</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => {
                    const loading = pendingId === sub.venueId;
                    const levelLoading = pendingLevelId === sub.venueId;
                    return (
                      <TableRow key={sub.id} className="border-white/6r:bg-white/2">
                        <TableCell className="py-2.5 text-xs font-medium text-[#DDDBDB]">
                          {sub.name}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-[#555568]">
                          {sub.streetAddress}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-[#555568]">
                          {sub.city}, {sub.state} {sub.postalCode}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="relative inline-flex items-center gap-1.5">
                            {levelLoading && <Loader2 className="h-3 w-3 animate-spin text-[#555568]" />}
                            <select
                              value={sub.notificationLevel}
                              disabled={levelLoading}
                              onChange={(e) => handleLevelChange(sub.venueId, e.target.value as IncidentSeverity)}
                              className="h-7 rounded border border-white/8 bg-[#0D0D16] px-2 text-[11px] font-semibold text-[#DDDBDB] focus:outline-none disabled:opacity-50"
                            >
                              <option value="LOW">Low+</option>
                              <option value="MEDIUM">Medium+</option>
                              <option value="HIGH">High only</option>
                            </select>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <Button
                            size="sm"
                            disabled={loading}
                            onClick={() => handleToggle(sub.venueId)}
                            className="h-8 gap-1.5 border border-white/10 bg-white/5 px-3 text-[#8B8B9D] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><BellOff className="h-3.5 w-3.5" />Unsubscribe</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </section>

          {/* Search */}
          <section className="rounded-xl border border-white/[0.07] bg-[#11111B]">
            <div className="flex items-center gap-2.5 border-b border-white/6 px-6 py-4">
              <Search className="h-4 w-4 text-[#555568]" />
              <h2 className="text-sm font-bold text-[#DDDBDB]">Search Nearby Venues</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3">
                <Field label="City" name="city" value={search.city} onChange={(v) => setSearch((s) => ({ ...s, city: v }))} placeholder="City" />
                <Field label="State" name="state" value={search.state} onChange={(v) => setSearch((s) => ({ ...s, state: v }))} placeholder="State" />
                <Field label="Zip" name="zip" value={search.zip} onChange={(v) => setSearch((s) => ({ ...s, zip: v }))} placeholder="Zip" />
              </div>
              <Button
                type="button" size="sm"
                onClick={() => setCommitted(search)}
                className="mt-4 h-8 gap-1.5 border border-primary bg-primary/50 px-4 text-white hover:bg-primary/70"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </Button>
            </div>
          </section>

          {/* Results table */}
          <section className="rounded-xl border border-white/[0.07] bg-[#11111B]">
            <div className="flex items-center gap-2.5 border-b border-white/6 px-6 py-4">
              <MapPin className="h-4 w-4 text-[#555568]" />
              <h2 className="text-sm font-bold text-[#DDDBDB]">
                Results — {committed.city}, {committed.state}
              </h2>
            </div>

            {loadingNearby && (
              <div className="flex items-center gap-2 px-6 py-8 text-xs text-[#555568]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading nearby venues…
              </div>
            )}

            {!loadingNearby && nearbyVenues.length === 0 && (
              <p className="px-6 py-8 text-center text-xs text-[#555568]">
                No venues found in {committed.city}, {committed.state}.
              </p>
            )}

            {!loadingNearby && nearbyVenues.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/6 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase text-[#555568]">Venue</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-[#555568]">Address</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-[#555568]">Phone</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nearbyVenues.map((venue) => {
                    const subscribed = subscribedIds.has(venue.id);
                    const loading = pendingId === venue.id;
                    return (
                      <TableRow key={venue.id} className="border-white/6 hover:bg-white/2">
                        <TableCell className="py-2.5 text-xs font-medium text-[#DDDBDB]">{venue.name}</TableCell>
                        <TableCell className="py-2.5 text-xs text-[#555568]">{venue.streetAddress}, {venue.city}</TableCell>
                        <TableCell className="py-2.5 text-xs text-[#555568]">{venue.phoneNumber || "—"}</TableCell>
                        <TableCell className="py-2.5 text-right">
                          <Button
                            size="sm"
                            disabled={loading}
                            onClick={() => handleToggle(venue.id)}
                            className={
                              subscribed
                                ? "h-8 gap-1.5 border border-white/10 bg-white/5 px-3 text-[#8B8B9D] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                                : "h-8 gap-1.5 border border-primary bg-primary/50 px-3 text-white hover:bg-primary/70"
                            }
                          >
                            {loading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : subscribed ? (
                              <><BellOff className="h-3.5 w-3.5" />Unsubscribe</>
                            ) : (
                              <><Bell className="h-3.5 w-3.5" />Subscribe</>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
