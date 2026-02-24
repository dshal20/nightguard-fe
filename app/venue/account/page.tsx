"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, isAdmin } from "../../src/lib/firebase";

export default function VenueAccountPage() {
  const router = useRouter();
  const user = auth.currentUser!;

  const name = user.email!.split("@")[0];
  const status = isAdmin(user.email) ? "Admin" : "Venue Manager";

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-[1172px] px-8 py-8">
      <h1 className="mb-8 text-2xl font-bold text-[#E2E2E2]">Account</h1>
      <div className="rounded-[21px] border border-[#2A2A34] bg-[#11111B] p-6 max-w-md">
        <p className="text-sm font-medium text-[#8B8B9D]">Name</p>
        <p className="mt-1 text-lg font-bold text-[#E2E2E2]">{name}</p>
        <p className="mt-6 text-sm font-medium text-[#8B8B9D]">Status</p>
        <p className="mt-1 text-lg font-bold text-[#E2E2E2]">{status}</p>
        <button
          onClick={handleLogout}
          className="mt-8 rounded-lg border border-[#2A2A34] bg-[#26262F]/48 px-4 py-2.5 text-sm font-bold text-white hover:bg-[#26262F]"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
