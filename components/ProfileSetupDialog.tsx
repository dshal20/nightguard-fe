"use client";

import { useState } from "react";
import type { User } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateMe } from "@/lib/api";

interface Props {
  open: boolean;
  firebaseUser: User;
  onComplete: () => void;
}

export default function ProfileSetupDialog({ open, firebaseUser, onComplete }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      await updateMe(token, { firstName: firstName.trim(), lastName: lastName.trim() });
      onComplete();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md border"
        style={{
          backgroundColor: "#0d0d16",
          borderColor: "rgba(255,255,255,0.08)",
        }}
        // Prevent closing by clicking outside — user must complete this step
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-white">Complete your profile</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Tell us your name to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              First name
            </label>
            <input
              placeholder="John"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:ring-2 focus:ring-[#2B36CD]"
              style={{ backgroundColor: "#1a1a28", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Last name
            </label>
            <input
              placeholder="Doe"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:ring-2 focus:ring-[#2B36CD]"
              style={{ backgroundColor: "#1a1a28", border: "1px solid rgba(255,255,255,0.08)" }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && (
            <p
              className="rounded-lg p-3 text-sm text-red-400"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full cursor-pointer rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#2B36CD" }}
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
