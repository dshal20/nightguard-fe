"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { House, ShieldAlert, FileUser, Users, Megaphone, MapPin, Settings, User } from "lucide-react";
import { auth } from "../../src/lib/firebase";
import { getMe } from "@/lib/api";

const iconClass = "h-4 w-4 shrink-0 text-current";

const nav = [
  { label: "Dashboard", href: "/venue", icon: <House className={iconClass} /> },
  {
    label: "Incidents",
    href: "#",
    icon: <ShieldAlert className={iconClass} />,
    badge: 3,
  },
  { label: "Offenders", href: "#", icon: <FileUser className={iconClass} /> },
  { label: "Staff", href: "#", icon: <Users className={iconClass} /> },
];
const network = [
  { label: "Network Alerts", href: "#", icon: <Megaphone className={iconClass} /> },
  { label: "Nearby Venues", href: "#", icon: <MapPin className={iconClass} /> },
];
const settings = [
  { label: "Preferences", href: "#", icon: <Settings className={iconClass} /> },
  { label: "Account", href: "/venue/account", icon: <User className={iconClass} /> },
];

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: { label: string; href: string; icon: React.ReactNode; badge?: number }[];
  pathname: string;
}) {
  return (
    <div className="mb-6">
      <p className="mb-3 px-[25px] font-bold text-[10px] uppercase leading-[18px] text-[#959595]">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center gap-[14px] px-[25px] py-2 text-sm font-medium hover:text-white ${
                  active ? "text-white" : "text-[#DDDBDB]"
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </span>
                {item.label}
                {item.badge != null && (
                  <span className="ml-auto mr-4 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#E84868] text-[8px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function VenueSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState<string | null>(null);

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
    <aside className="fixed left-0 top-0 z-10 flex h-screen w-[268px] flex-col border-r border-[#272731] bg-[#0F0F19]">
      <div className="px-[25px] py-5">
        <img
          src="/NigtGuardLogo.png"
          alt="NightGuard"
          className="h-8 w-auto max-w-[230px] object-contain object-left"
        />
      </div>

      <div className="mx-3 mb-4 rounded-lg border border-[#2A2A34] bg-[#11111D] p-3">
        <p className="text-base font-bold text-[#DDDBDB]">NG Midtown</p>
        <p className="text-[10px] font-bold text-[#8B8B9D]">
          Currently Open • 247 guests
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-0">
        <NavSection pathname={pathname ?? ""} title="NAVIGATION" items={nav} />
        <NavSection pathname={pathname ?? ""} title="NETWORK" items={network} />
        <NavSection pathname={pathname ?? ""} title="SETTINGS" items={settings} />
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-[#2A2A34] bg-[#11111B] p-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#262B75]" />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#DDDBDB]">
              {displayName ?? "…"}
            </p>
            <p className="text-[10px] font-bold text-[#8B8B9D]">
              Venue Manager
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs font-medium text-[#DDDBDB] hover:text-white"
        >
          Sign out
        </button>
        <p className="mt-2 text-xs text-[#DDDBDB]">Need help? Contact Support</p>
      </div>
    </aside>
  );
}
