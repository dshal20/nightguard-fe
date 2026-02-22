import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
        NightGuard
      </h1>
      <p className="text-center text-zinc-600 dark:text-zinc-400">
        Venue management and admin
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Log in
      </Link>
    </main>
  );
}
