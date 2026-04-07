"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500";
const inputClass =
  "w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:ring-2 focus:ring-[#2B36CD]";
const inputStyle = { backgroundColor: "#1a1a28", border: "1px solid rgba(255,255,255,0.08)" };

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AbuseReportModal({ open, onClose }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phoneNumber, setPhone]   = useState("");
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/abuse-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phoneNumber, message }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset after dialog closes
    setTimeout(() => {
      setFirstName(""); setLastName(""); setEmail("");
      setPhone(""); setMessage(""); setError(null); setSubmitted(false);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="border-[#2A2A34] bg-[#11111D] text-[#DDDBDB] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-[#E2E2E2]">
            Submit an Abuse Report
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            Report a concern about venue safety or staff conduct. Your report will be reviewed confidentially.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="font-semibold text-[#E2E2E2]">Report submitted</p>
            <p className="mt-1 text-sm text-zinc-500">Thank you. We&apos;ll review your report shortly.</p>
            <button
              onClick={handleClose}
              className="mt-6 w-full rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: "#2B36CD" }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number <span className="normal-case font-normal text-zinc-600">(optional)</span></label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Describe the incident or concern…"
                className={`${inputClass} resize-none`}
                style={inputStyle}
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

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium text-zinc-400 transition hover:text-white"
                style={{ backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#2B36CD" }}
              >
                {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
