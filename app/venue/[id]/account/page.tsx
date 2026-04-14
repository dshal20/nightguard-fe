"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../../src/lib/firebase";
import { getMe, updateMe, uploadFile, getVenues, type UserProfile, type Venue } from "@/lib/api";
import { User, Phone, Mail, Save, LogOut, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Field({
  label, name, value, onChange, placeholder, icon, readOnly, type,
}: {
  label: string; name: string; value: string;
  onChange?: (v: string) => void; placeholder?: string;
  icon?: React.ReactNode; readOnly?: boolean; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#555568]">
        {label}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#44445A]">{icon}</span>}
        <Input
          name={name} value={value} type={type}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder} readOnly={readOnly}
          className={`border-white/[0.08] bg-[#0D0D16] text-[#DDDBDB] placeholder:text-[#2E2E3E] focus-visible:border-primary/50 focus-visible:ring-primary/20 ${icon ? "pl-9" : ""} ${readOnly ? "cursor-default select-all opacity-60" : ""}`}
        />
      </div>
    </div>
  );
}

export default function VenueAccountPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "" });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const [me, venues] = await Promise.all([getMe(token), getVenues(token)]);
        setProfile(me);
        setForm({
          firstName: me.firstName ?? "",
          lastName: me.lastName ?? "",
          email: me.email ?? "",
          phoneNumber: me.phoneNumber ?? "",
        });
        if (venues.length > 0) setVenue(venues[0]);
      } catch {
        // ignore load failures
      }
    }
    load();
  }, []);

  function set(key: keyof typeof form) {
    return (v: string) => { setSaved(false); setForm((f) => ({ ...f, [key]: v })); };
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setSaveError(false);
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const updated = await updateMe(token, form);
      setProfile(updated);
      setSaved(true);
    } catch {
      setSaveError(true);
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setPhotoUploading(true);
    const user = auth.currentUser;
    if (!user) { setPhotoUploading(false); return; }
    try {
      const token = await user.getIdToken();
      const url = await uploadFile(token, file);
      const updated = await updateMe(token, { profileUrl: url });
      setProfile(updated);
    } catch {
      // ignore upload failures silently
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  const initials =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`
      : (profile?.email?.[0] ?? "U").toUpperCase();

  const roleLabel = profile?.role === "ADMIN" ? "Admin" : "Venue Member";

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#E2E2E2]">Account</h1>
        <p className="mt-1 text-sm text-[#555568]">Manage your profile and personal details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Photo */}
        <section className="rounded-xl border border-white/[0.07] bg-[#11111B] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Camera className="h-4 w-4 text-[#555568]" />
            <h2 className="text-sm font-bold text-[#DDDBDB]">Profile Photo</h2>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
              className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-[#1E1E2C] focus:outline-none disabled:opacity-60"
            >
              {profile?.profileUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profileUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg font-bold text-[#555568]">
                  {initials}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-4 w-4 text-white" />
              </span>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <div>
              <p className="text-xs font-medium text-[#DDDBDB]">
                {photoUploading ? "Uploading…" : "Click your avatar to change photo"}
              </p>
              <p className="mt-0.5 text-[11px] text-[#555568]">
                JPG, PNG or WebP. Max 10 MB.
              </p>
            </div>
          </div>
        </section>

        {/* Personal Info */}
        <section className="rounded-xl border border-white/[0.07] bg-[#11111B] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <User className="h-4 w-4 text-[#555568]" />
            <h2 className="text-sm font-bold text-[#DDDBDB]">Personal Info</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" name="firstName" value={form.firstName} onChange={set("firstName")} placeholder="e.g. Alex" />
              <Field label="Last Name" name="lastName" value={form.lastName} onChange={set("lastName")} placeholder="e.g. Smith" />
            </div>
            <Field label="Email" name="email" value={form.email} onChange={set("email")} placeholder="you@example.com" icon={<Mail className="h-3.5 w-3.5" />} type="email" />
            <Field label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+1 (555) 000-0000" icon={<Phone className="h-3.5 w-3.5" />} />
          </div>
        </section>

        {/* Role & Venue — read-only */}
        <section className="rounded-xl border border-white/[0.07] bg-[#11111B] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <User className="h-4 w-4 text-[#555568]" />
            <h2 className="text-sm font-bold text-[#DDDBDB]">Access</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" name="role" value={roleLabel} readOnly />
            <Field label="Venue" name="venue" value={venue?.name ?? "—"} readOnly />
          </div>
        </section>

        {/* Save row */}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" className="h-8 gap-1.5 border border-primary bg-primary/50 px-4 text-white hover:bg-primary/70">
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
          {saved && <p className="text-xs text-[#75FB94]">Changes saved.</p>}
          {saveError && <p className="text-xs text-red-400">Failed to save changes.</p>}
        </div>
      </form>

      {/* Logout */}
      <div className="mt-10 border-t border-white/[0.06] pt-8">
        <Button
          type="button"
          size="sm"
          onClick={handleLogout}
          className="h-8 gap-1.5 border border-white/10 bg-white/5 px-4 text-[#8B8B9D] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </Button>
      </div>
    </div>
  );
}
