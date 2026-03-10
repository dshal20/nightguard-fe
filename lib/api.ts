const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
}

export interface Venue {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export type IncidentType =
  | "VERBAL_HARASSMENT"
  | "SEXUAL_HARASSMENT"
  | "PHYSICAL_ASSAULT"
  | "THREAT"
  | "STALKING"
  | "THEFT"
  | "DRUG_RELATED"
  | "TRESPASSING"
  | "DISORDERLY_CONDUCT"
  | "VANDALISM"
  | "OTHER";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface CreateIncidentRequest {
  venueId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  keywords: string[];
}

export interface IncidentResponse {
  id: string;
  venueId: string;
  reporterId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export async function joinVenue(token: string, code: string): Promise<void> {
  const res = await fetch(`${API_URL}/venues/join/${encodeURIComponent(code)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Invalid invite code");
}

export async function getVenues(token: string): Promise<Venue[]> {
  const res = await fetch(`${API_URL}/venues`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch venues");
  return res.json();
}

export async function getMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateMe(token: string, payload: UpdateProfilePayload): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function getIncidents(
  token: string,
  venueId: string,
): Promise<IncidentResponse[]> {
  const res = await fetch(`${API_URL}/incidents?venueId=${venueId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function createIncident(
  token: string,
  payload: CreateIncidentRequest,
): Promise<IncidentResponse> {
  const res = await fetch(`${API_URL}/incidents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create incident");
  return res.json();
}

