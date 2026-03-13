const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserRole = "ADMIN" | "USER";

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: UserRole;
}

export interface Venue {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  inviteCode: string;
}

export interface CreateVenueRequest {
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

export interface OffenderResponse {
  id: string;
  venueId: string;
  firstName: string;
  lastName: string;
  physicalMarkers?: string;
  riskScore?: number;
  currentStatus?: string;
  globalId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOffenderRequest {
  venueId: string;
  firstName: string;
  lastName: string;
  physicalMarkers?: string;
  riskScore?: number;
  currentStatus?: string;
  notes?: string;
}

export interface CreateIncidentRequest {
  venueId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  keywords: string[];
  offenderIds?: string[];
}

export type IncidentStatus = "ACTIVE" | "COMPLETED";

export interface IncidentResponse {
  id: string;
  venueId: string;
  reporter: UserProfile;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  keywords: string[];
  offenders: OffenderResponse[];
  createdAt: string;
  updatedAt: string;
}

export async function createVenue(
  token: string,
  payload: CreateVenueRequest,
): Promise<Venue> {
  const res = await fetch(`${API_URL}/venues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create venue");
  return res.json();
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

export async function getUserByEmail(token: string, email: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
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

export interface VenueCapacityResponse {
  id: string;
  venueId: string;
  updatedBy: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeadcountRecordedBy {
  firstName: string;
  lastName: string;
}

export interface VenueHeadcountResponse {
  id: string;
  venueId: string;
  headcount: number;
  recordedBy: HeadcountRecordedBy | null;
  createdAt: string;
}

export async function getCapacity(
  token: string,
  venueId: string,
): Promise<VenueCapacityResponse | null> {
  const res = await fetch(`${API_URL}/venues/${venueId}/capacity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch capacity");
  return res.json();
}

export async function setCapacity(
  token: string,
  venueId: string,
  capacity: number,
): Promise<VenueCapacityResponse> {
  const res = await fetch(`${API_URL}/venues/${venueId}/capacity`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ capacity }),
  });
  if (!res.ok) throw new Error("Failed to set capacity");
  return res.json();
}

export async function getHeadcounts(
  token: string,
  venueId: string,
): Promise<VenueHeadcountResponse[]> {
  const res = await fetch(`${API_URL}/venues/${venueId}/headcount`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch headcounts");
  return res.json();
}

export async function addHeadcount(
  token: string,
  venueId: string,
  headcount: number,
): Promise<VenueHeadcountResponse> {
  const res = await fetch(`${API_URL}/venues/${venueId}/headcount`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ headcount }),
  });
  if (!res.ok) throw new Error("Failed to log headcount");
  return res.json();
}

export interface UpdateIncidentRequest {
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  description?: string;
  keywords?: string[];
  offenderIds?: string[];
}

export async function updateIncident(
  token: string,
  id: string,
  payload: UpdateIncidentRequest,
): Promise<IncidentResponse> {
  const res = await fetch(`${API_URL}/incidents/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update incident");
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

export async function getOffenders(
  token: string,
  venueId: string,
): Promise<OffenderResponse[]> {
  const res = await fetch(`${API_URL}/offenders?venueId=${venueId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch offenders");
  return res.json();
}

export async function createOffender(
  token: string,
  payload: CreateOffenderRequest,
): Promise<OffenderResponse> {
  const res = await fetch(`${API_URL}/offenders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create offender");
  return res.json();
}
