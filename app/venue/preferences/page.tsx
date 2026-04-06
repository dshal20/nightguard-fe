"use client";

import { useState } from "react";
import { Building2, MapPin, Phone, Key, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVenueContext } from "../context/VenueContext";

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  readOnly,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#555568]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#44445A]">
            {icon}
          </span>
        )}
        <Input
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`border-white/[0.08] bg-[#0D0D16] text-[#DDDBDB] placeholder:text-[#2E2E3E] focus-visible:border-primary/50 focus-visible:ring-primary/20 ${icon ? "pl-9" : ""} ${readOnly ? "cursor-default select-all opacity-60" : ""}`}
        />
      </div>
      {hint && <p className="text-[10px] text-[#44445A]">{hint}</p>}
    </div>
  );
}

export default function VenuePreferencesPage() {
  const { selectedVenue } = useVenueContext();

  const [form, setForm] = useState({
    name:          selectedVenue?.name          ?? "",
    streetAddress: selectedVenue?.streetAddress ?? "",
    city:          selectedVenue?.city          ?? "",
    state:         selectedVenue?.state         ?? "",
    postalCode:    selectedVenue?.postalCode    ?? "",
    phoneNumber:   selectedVenue?.phoneNumber   ?? "",
  });

  const [saved, setSaved] = useState(false);

  function set(key: keyof typeof form) {
    return (value: string) => {
      setSaved(false);
      setForm((f) => ({ ...f, [key]: value }));
    };
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: connect to backend
    setSaved(true);
  }

  if (!selectedVenue) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[#8B8B9D]">No venue selected.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#E2E2E2]">Venue Preferences</h1>
        <p className="mt-1 text-sm text-[#555568]">
          Update your venue's details. Changes are visible to all staff at this venue.
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">

        {/* Venue identity */}
        <section className="rounded-xl border border-white/[0.07] bg-[#11111B] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-[#555568]" />
            <h2 className="text-sm font-bold text-[#DDDBDB]">Venue Identity</h2>
          </div>
          <div className="space-y-4">
            <Field
              label="Venue Name"
              name="name"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. The Grand Ballroom"
              icon={<Building2 className="h-3.5 w-3.5" />}
            />
            <Field
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
              placeholder="e.g. +1 (555) 000-0000"
              icon={<Phone className="h-3.5 w-3.5" />}
            />
          </div>
        </section>

        {/* Address */}
        <section className="rounded-xl border border-white/[0.07] bg-[#11111B] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-[#555568]" />
            <h2 className="text-sm font-bold text-[#DDDBDB]">Address</h2>
          </div>
          <div className="space-y-4">
            <Field
              label="Street Address"
              name="streetAddress"
              value={form.streetAddress}
              onChange={set("streetAddress")}
              placeholder="e.g. 123 Main St"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={set("city")}
                placeholder="e.g. New York"
              />
              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={set("state")}
                placeholder="e.g. NY"
              />
            </div>
            <Field
              label="Postal Code"
              name="postalCode"
              value={form.postalCode}
              onChange={set("postalCode")}
              placeholder="e.g. 10001"
            />
          </div>
        </section>

        {/* Read-only info */}
        <section className="rounded-xl border border-white/[0.07] bg-[#11111B] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Key className="h-4 w-4 text-[#555568]" />
            <h2 className="text-sm font-bold text-[#DDDBDB]">Invite Code</h2>
          </div>
          <Field
            label="Invite Code"
            name="inviteCode"
            value={selectedVenue.inviteCode}
            readOnly
            hint="Share this code with staff so they can join this venue. Contact support to rotate it."
          />
        </section>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            size="sm"
            className="h-8 gap-1.5 border border-primary bg-primary/50 px-4 text-white hover:bg-primary/70"
          >
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
          {saved && (
            <p className="text-xs text-[#75FB94]">Changes saved.</p>
          )}
        </div>
      </form>
    </div>
  );
}
