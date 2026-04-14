import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Users,
  FileText,
  Bell,
  BarChart3,
  Search,
  ArrowRight,
  CheckCircle2,
  Play,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Small reusable primitives (no extra files)
───────────────────────────────────────────── */

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "linear-gradient(135deg, #13131F 0%, #11111B 100%)",
        borderColor: "#1A1A26",
      }}
    >
      {/* glow dot */}
      <div
        className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: `${accent}22` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <h3 className="mb-2 text-base font-semibold text-[#DDDBDB]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#8B8B9D]">{description}</p>
    </div>
  );
}

function StatPill({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-4xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-sm text-[#8B8B9D]">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Marketing Page
───────────────────────────────────────────── */

export default function MarketingPage() {
  const features = [
    {
      icon: Search,
      title: "Offender Database",
      description:
        "Instantly search a shared network of flagged individuals across all partner venues. Keep your crowd safe before trouble starts.",
      accent: "#4B5BE8",
    },
    {
      icon: FileText,
      title: "Incident Reporting",
      description:
        "Log incidents in seconds from any device. Attach notes, severity levels, and let the system route alerts automatically.",
      accent: "#E84868",
    },
    {
      icon: BarChart3,
      title: "Live Capacity Tracking",
      description:
        "Real-time headcount with over/under indicators. Set thresholds and receive alerts the moment capacity limits are reached.",
      accent: "#DBA940",
    },
    {
      icon: Bell,
      title: "Network Alerts",
      description:
        "Push notifications reach your entire team simultaneously. Critical alerts propagate venue-wide in under a second.",
      accent: "#4B7BF5",
    },
    {
      icon: Users,
      title: "Multi-Venue Management",
      description:
        "Manage an entire portfolio of venues from one admin dashboard. Invite staff, assign roles, and monitor everything centrally.",
      accent: "#75FB94",
    },
    {
      icon: ShieldCheck,
      title: "Safety Intelligence",
      description:
        "Trend analysis and incident heatmaps reveal risk patterns so your team can act proactively, not reactively.",
      accent: "#C77EFF",
    },
  ];

  const checkPoints = [
    "No hardware required — works on any device",
    "Invite your whole security team in minutes",
    "Shared offender network across partner venues",
    "GDPR-conscious data handling",
  ];

  return (
    <div
      className="min-h-screen antialiased"
      style={{ background: "#0B0B12", color: "#DDDBDB" }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md md:px-12"
        style={{
          borderBottom: "1px solid #1A1A26",
          background: "rgba(11,11,18,0.85)",
        }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="NightGuard"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[#8B8B9D] transition-colors hover:text-[#DDDBDB]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#4B5BE8" }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-28 text-center md:px-12">
        {/* background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(75,91,232,0.25) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
            style={{
              background: "rgba(75,91,232,0.1)",
              border: "1px solid rgba(75,91,232,0.3)",  
              color: "#818CF8",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#4B5BE8]" />
            Now live — real-time network alerts
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            The venue safety
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, #4B5BE8 0%, #818CF8 50%, #C77EFF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              platform that works
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-[#8B8B9D]">
            NightGuard gives nightclubs, bars, and event venues a single
            command centre — incident logs, offender search, live capacity, and
            team alerts all in one place.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_24px_rgba(75,91,232,0.5)]"
              style={{ background: "#4B5BE8" }}
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-semibold transition-colors duration-200 hover:bg-white/5"
              style={{ borderColor: "#2A2A34", color: "#DDDBDB" }}
            >
              <Play className="h-4 w-4" /> Watch demo
            </a>
          </div>
        </div>

        {/* Hero app screenshot */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              border: "1px solid #1A1A26",
              boxShadow:
                "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(75,91,232,0.1)",
            }}
          >
            <div className="relative h-[400px] md:h-[520px]">
              <Image
                src="/screenshot-dashboard.png"
                alt="NightGuard dashboard"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
          {/* bottom fade */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
            style={{
              background: "linear-gradient(to top, #0B0B12 0%, transparent 100%)",
            }}
          />
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        className="px-6 py-16 md:px-12"
        style={{ borderTop: "1px solid #1A1A26", borderBottom: "1px solid #1A1A26" }}
      >
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 md:grid-cols-4">
          <StatPill value="< 1s" label="Alert delivery" color="#4B5BE8" />
          <StatPill value="100%" label="Device agnostic" color="#75FB94" />
          <StatPill value="∞" label="Incident history" color="#DBA940" />
          <StatPill value="24/7" label="Real-time sync" color="#E84868" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
              Everything your venue needs
            </h2>
            <p className="text-[#8B8B9D]">
              One platform. Every tool your security team relies on.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT SCREENSHOTS ── */}
      <section className="px-6 py-24 md:px-12" style={{ background: "#0D0D16" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
              Built for the floor
            </h2>
            <p className="text-[#8B8B9D]">
              Designed to be used quickly under real conditions.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Screenshot 1 */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{ border: "1px solid #1A1A26" }}
            >
              <div className="relative h-64 md:h-80">
                <Image
                  src="/screenshot-incidents.png"
                  alt="Incident reporting screen"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-5" style={{ background: "#11111B", borderTop: "1px solid #1A1A26" }}>
                <h4 className="mb-1 font-semibold text-[#DDDBDB]">Fast incident logging</h4>
                <p className="text-sm text-[#8B8B9D]">
                  File a full incident report in under 30 seconds, even mid-shift.
                </p>
              </div>
            </div>

            {/* Screenshot 2 */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{ border: "1px solid #1A1A26" }}
            >
              <div className="relative h-64 md:h-80">
                <Image
                  src="/screenshot-offenders.png"
                  alt="Offender search screen"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-5" style={{ background: "#11111B", borderTop: "1px solid #1A1A26" }}>
                <h4 className="mb-1 font-semibold text-[#DDDBDB]">Shared offender network</h4>
                <p className="text-sm text-[#8B8B9D]">
                  Search the cross-venue database by name or description in real time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO DEMO ── */}
      <section id="demo" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            See it in action
          </h2>
          <p className="mb-12 text-[#8B8B9D]">
            A 2-minute walkthrough of the full platform.
          </p>

          {/* Video embed container */}
          <div
            className="group relative overflow-hidden rounded-2xl"
            style={{
              border: "1px solid #1A1A26",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/*
              Replace the placeholder below with an actual video embed, e.g.:
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                title="NightGuard demo"
                allowFullScreen
              />
            */}
            <div
              className="flex aspect-video items-center justify-center"
              style={{ background: "#11111B" }}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                  style={{ background: "rgba(75,91,232,0.2)", border: "1px solid rgba(75,91,232,0.4)" }}
                >
                  <Play className="h-8 w-8 text-[#4B5BE8]" style={{ marginLeft: "4px" }} />
                </div>
                <span className="text-sm text-[#8B8B9D]">
                  Video placeholder — add your demo video URL above
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY NIGHTGUARD ── */}
      <section
        className="px-6 py-24 md:px-12"
        style={{ background: "#0D0D16" }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Why venue teams
              <br />
              choose NightGuard
            </h2>
            <p className="mb-8 text-[#8B8B9D]">
              Managing safety across a busy venue used to mean spreadsheets,
              radios, and crossed wires. NightGuard replaces all of that with a
              single, fast, mobile-ready platform your whole team can trust.
            </p>
            <ul className="space-y-3">
              {checkPoints.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm text-[#DDDBDB]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#75FB94]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: stacked mini stat cards */}
          <div className="space-y-4">
            {[
              { label: "Active incidents tonight", value: "3", color: "#E84868", bar: 30 },
              { label: "Current capacity", value: "247 / 300", color: "#DBA940", bar: 82 },
              { label: "Network alerts sent", value: "12", color: "#4B5BE8", bar: 60 },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4"
                style={{ background: "#13131F", border: "1px solid #1A1A26" }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-[#8B8B9D]">{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "#1A1A26" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.bar}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-28 text-center md:px-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(75,91,232,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="mb-5 text-4xl font-bold text-white md:text-5xl">
            Ready to secure
            <br />
            your venue?
          </h2>
          <p className="mb-10 text-[#8B8B9D]">
            Set up takes minutes. No card required to start.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_32px_rgba(75,91,232,0.6)]"
            style={{ background: "#4B5BE8" }}
          >
            Get started free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-6 py-10 md:px-12"
        style={{ borderTop: "1px solid #1A1A26" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <Image
            src="/logo.png"
            alt="NightGuard"
            width={120}
            height={34}
            className="h-7 w-auto object-contain opacity-70"
          />
          <p className="text-xs text-[#8B8B9D]">
            © {new Date().getFullYear()} NightGuard. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#8B8B9D]">
            <Link href="/login" className="transition-colors hover:text-[#DDDBDB]">
              Log in
            </Link>
            <Link href="/signup" className="transition-colors hover:text-[#DDDBDB]">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
