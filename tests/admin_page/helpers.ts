import type { UserProfile, Venue } from "@/lib/api";

export const adminProfile: UserProfile = {
  id: "admin-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "admin@nightguard.test",
  phoneNumber: "352-555-1010",
  role: "ADMIN",
};

export const userProfile: UserProfile = {
  id: "user-1",
  firstName: "Regular",
  lastName: "User",
  email: "user@nightguard.test",
  phoneNumber: null,
  role: "USER",
};

export const mockVenues: Venue[] = [
  {
    id: "venue-1",
    name: "NightGuard Downtown",
    streetAddress: "123 Main St",
    city: "Gainesville",
    state: "FL",
    postalCode: "32601",
    phoneNumber: "352-555-0001",
    inviteCode: "NG1234",
  },
  {
    id: "venue-2",
    name: "NightGuard Midtown",
    streetAddress: "456 Oak Ave",
    city: "Orlando",
    state: "FL",
    postalCode: "32801",
    phoneNumber: "407-555-0002",
    inviteCode: "NG5678",
  },
];

export function buildMockAuthUser(email = "admin@nightguard.test") {
  return {
    uid: "uid-1",
    email,
    getIdToken: jest.fn().mockResolvedValue("mock-token"),
  };
}
