import type {
  Venue,
  UserProfile,
  IncidentResponse,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/api";

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

export const mockUser: UserProfile = {
  id: "user-1",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phoneNumber: "352-555-1234",
  role: "USER",
};

export const mockUserNoName: UserProfile = {
  id: "user-2",
  firstName: null,
  lastName: null,
  email: "janedoe@example.com",
  phoneNumber: null,
  role: "USER",
};

export function buildIncident(overrides: Partial<IncidentResponse> = {}): IncidentResponse {
  return {
    id: "inc-1",
    venueId: "venue-1",
    reporter: mockUser,
    type: "VERBAL_HARASSMENT" as IncidentType,
    severity: "MEDIUM" as IncidentSeverity,
    status: "ACTIVE" as IncidentStatus,
    description: "Patron was verbally aggressive toward staff.",
    keywords: ["aggressive", "verbal"],
    offenderIds: [],
    createdAt: "2026-04-05T02:15:00Z",
    updatedAt: "2026-04-05T02:15:00Z",
    ...overrides,
  };
}

export const mockIncidents: IncidentResponse[] = [
  buildIncident(),
  buildIncident({
    id: "inc-2",
    type: "PHYSICAL_ASSAULT",
    severity: "HIGH",
    status: "ACTIVE",
    description: "Fight broke out near the bar area.",
    keywords: ["fight", "bar"],
    createdAt: "2026-04-05T01:30:00Z",
    updatedAt: "2026-04-05T01:45:00Z",
  }),
];
