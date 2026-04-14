"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  House, ShieldAlert, FileUser, Users, Megaphone, MapPin,
  Settings, User, ChevronsUpDown, Check, LogOut, ClipboardList,
} from "lucide-react";
import { auth } from "../../src/lib/firebase";
import { getMe, type UserRole } from "@/lib/api";
import { useVenueContext } from "../context/VenueContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  badge?: number;
};

function NavGroup({
  items,
  pathname,
  divider = true,
  onLinkClick,
}: {
  items: NavItem[];
  pathname: string;
  divider?: boolean;
  onLinkClick?: () => void;
}) {
  return (
    <div>
      {divider && <div className="mx-4 my-1 h-px bg-[#1E1E2C]" />}
      <ul className="px-3 py-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={onLinkClick}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  active
                    ? "bg-[#16162A] text-white"
                    : "text-[#8B8B9D] hover:bg-[#13131F] hover:text-[#DDDBDB]"
                }`}
              >
                {/* Icon box */}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors"
                  style={{
                    background: active ? `${item.color}22` : "#1A1A28",
                    color: active ? item.color : "#6B6B7D",
                  }}
                >
                  {item.icon}
                </span>

                <span className={`text-sm font-semibold ${active ? "text-white" : ""}`}>
                  {item.label}
                </span>

                {item.badge != null && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E84868] px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}

                {/* Active indicator */}
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: item.color }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function VenueSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const { venues, selectedVenue, setSelectedVenue, loading: venuesLoading } = useVenueContext();

  const id = selectedVenue?.id ?? null;
  const nav: NavItem[] = [
    { label: "Dashboard",  href: id ? `/venue/${id}` : "#",             icon: <House      className="h-3.75 w-3.75" />, color: "#2B36CD" },
    { label: "Incidents",  href: id ? `/venue/${id}/incidents` : "#",   icon: <ShieldAlert className="h-3.75 w-3.75" />, color: "#E84868" },
    { label: "Patrons",    href: id ? `/venue/${id}/capacity` : "#",    icon: <Users      className="h-3.75 w-3.75" />, color: "#75FB94" },
    { label: "Offenders",  href: id ? `/venue/${id}/offenders` : "#",   icon: <FileUser   className="h-3.75 w-3.75" />, color: "#DBA940" },
    { label: "Staff",      href: "#",                                    icon: <Users      className="h-3.75 w-3.75" />, color: "#8B8B9D" },
    { label: "Logs",       href: id ? `/venue/${id}/logs` : "#",         icon: <ClipboardList className="h-3.75 w-3.75" />, color: "#5B6AFF" },
  ];
  const network: NavItem[] = [
    { label: "Network Alerts", href: "#", icon: <Megaphone className="h-3.75 w-3.75" />, color: "#DBA940" },
    { label: "Nearby Venues",  href: "#", icon: <MapPin    className="h-3.75 w-3.75" />, color: "#2B36CD" },
  ];
  const settings: NavItem[] = [
    { label: "Venue Preferences", href: id ? `/venue/${id}/preferences` : "#", icon: <Settings className="h-3.75 w-3.75" />, color: "#8B8B9D" },
    { label: "Account",           href: id ? `/venue/${id}/account` : "#",      icon: <User     className="h-3.75 w-3.75" />, color: "#8B8B9D" },
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const profile = await getMe(token);
        if (profile.firstName || profile.lastName) {
          setDisplayName([profile.firstName, profile.lastName].filter(Boolean).join(" "));
        } else {
          setDisplayName(user.email?.split("@")[0] ?? "User");
        }
        setProfileUrl(profile.profileUrl ?? null);
        setRole(profile.role);
      } catch {
        setDisplayName(user.email?.split("@")[0] ?? "User");
      }
    });
    return () => unsub();
  }, []);

  async function handleSignOut() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <aside className={`fixed left-0 top-0 z-10 flex h-screen w-67 flex-col border-r border-[#1A1A26] bg-[#0F0F19] transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Logo */}
      <div className="px-6 py-5">
        <img
          src="/NigtGuardLogo.png"
          alt="NightGuard"
          className="h-8 w-auto max-w-50 object-contain object-left"
        />
      </div>

      {/* Venue selector */}
      <div className="mx-3 mb-2 rounded-lg border border-[#1E1E2C] bg-[#13131F] px-3 py-2.5">
        {venuesLoading ? (
          <p className="text-xs text-[#8B8B9D]">Loading…</p>
        ) : venues.length === 0 ? (
          <p className="text-xs text-[#8B8B9D]">No venues</p>
        ) : (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 focus:outline-none">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#262B75] text-[10px] font-black text-white">
                  {selectedVenue?.name?.[0] ?? "V"}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold text-[#DDDBDB]">
                    {selectedVenue?.name}
                  </p>
                  {selectedVenue && (
                    <p className="text-[10px] text-[#6B6B7D]">
                      {selectedVenue.city}, {selectedVenue.state}
                    </p>
                  )}
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#6B6B7D]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="w-55 border-[#2A2A34] bg-[#11111D] p-1 text-[#DDDBDB]"
            >
              {venues.map((v) => (
                <DropdownMenuItem
                  key={v.id}
                  onSelect={() => setSelectedVenue(v)}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 focus:bg-[#1E1E2E] focus:text-white"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.name}</p>
                    <p className="text-[10px] text-[#8B8B9D]">
                      {v.city}, {v.state}
                    </p>
                  </div>
                  {selectedVenue?.id === v.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[#8B8B9D]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <NavGroup items={nav}      pathname={pathname ?? ""} divider={false} onLinkClick={onClose} />
        <NavGroup items={network}  pathname={pathname ?? ""} onLinkClick={onClose} />
        <NavGroup items={settings} pathname={pathname ?? ""} onLinkClick={onClose} />
      </nav>

      {/* User footer */}
      <div className="border-t border-[#1A1A26] px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#13131F] focus:outline-none">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#262B75]">
                {profileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                    {displayName?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold text-[#DDDBDB]">
                  {displayName ?? "…"}
                </p>
                <p className="text-[10px] text-[#6B6B7D]">
                  {role === "ADMIN" ? "Admin" : role === "USER" ? "Venue Member" : "…"}
                </p>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#6B6B7D]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-48 border-[#2A2A34] bg-[#11111D] p-1 text-[#DDDBDB]"
          >
            <DropdownMenuItem
              onSelect={handleSignOut}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm focus:bg-[#1E1E2E] focus:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
