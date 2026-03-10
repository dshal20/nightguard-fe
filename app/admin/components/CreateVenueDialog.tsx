"use client";

import { useState, type FormEvent } from "react";
import { X, CheckCircle, Loader2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { auth } from "@/app/src/lib/firebase";
import { createVenue } from "@/lib/api";

const inputClasses =
  "w-full rounded-lg bg-[#1a1a28] border border-[#2A2A34] px-4 py-2.5 text-sm text-white placeholder-[#555566] outline-none transition focus:border-[#2B36CD] focus:ring-1 focus:ring-[#2B36CD]";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface CreateVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export default function CreateVenueDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateVenueDialogProps) {
  const [name, setName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function resetForm() {
    setName("");
    setStreetAddress("");
    setCity("");
    setState("");
    setPostalCode("");
    setPhoneNumber("");
    setSubmitting(false);
    setError(null);
    setCreatedInviteCode(null);
    setCopied(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetForm();
      if (createdInviteCode) onCreated();
    }
    onOpenChange(next);
  }

  function copyCode() {
    if (!createdInviteCode) return;
    navigator.clipboard.writeText(createdInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be signed in");

      const token = await user.getIdToken();
      const venue = await createVenue(token, {
        name: name.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state,
        postalCode: postalCode.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      setCreatedInviteCode(venue.inviteCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = name.trim() && streetAddress.trim() && city.trim() && state && postalCode.trim();

  if (createdInviteCode) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="border-[#2A2A34] bg-[#11111B] sm:max-w-md"
          showCloseButton={false}
        >
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#75FB94]/10">
              <CheckCircle className="h-7 w-7 text-[#75FB94]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Venue Created</h3>
              <p className="mt-1 text-sm text-[#8B8B9D]">
                Share this invite code with your team members so they can join.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#2A2A34] bg-[#1a1a28] px-4 py-3">
              <span className="font-mono text-lg font-bold text-[#5B6AFF]">
                {createdInviteCode}
              </span>
              <button
                onClick={copyCode}
                className="rounded-md p-1.5 text-[#8B8B9D] transition hover:bg-white/5 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#75FB94]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="mt-2 rounded-lg bg-[#2B36CD] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-[#2A2A34] bg-[#11111B] sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-black text-[#E2E2E2]">
            Create New Venue
          </DialogTitle>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8B8B9D] transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
              Venue Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Blue Lounge"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
              Street Address *
            </label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="123 Main St"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Gainesville"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
                State *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`${inputClasses} appearance-none`}
              >
                <option value="" disabled>
                  Select...
                </option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
                Postal Code *
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="32601"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#DDDBDB]">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(352) 555-0100"
                className={inputClasses}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-[#EB4869]/30 bg-[#EB4869]/10 px-4 py-2 text-sm text-[#E84868]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2B36CD] py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Creating..." : "Create Venue"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
