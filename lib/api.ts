const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserRole = "ADMIN" | "USER";

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  profileUrl: string | null;
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
  dataSharingEnabled: boolean;
  venueImageUrl: string | null;
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
  profileUrl?: string;
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
  photoUrls: string[];
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
  photoUrls?: string[];
}

export interface CreateIncidentRequest {
  venueId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  keywords: string[];
  offenderIds?: string[];
  mediaUrls?: string[];
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
  offenderIds: string[];
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVenueRequest {
  name?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phoneNumber?: string;
  venueImageUrl?: string;
}

export async function updateVenue(
  token: string,
  venueId: string,
  payload: UpdateVenueRequest,
): Promise<Venue> {
  const res = await fetch(`${API_URL}/venues/${venueId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update venue");
  return res.json();
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
  mediaUrls?: string[];
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

export async function getOffenderIncidents(
  token: string,
  offenderId: string,
): Promise<IncidentResponse[]> {
  const res = await fetch(`${API_URL}/offenders/${offenderId}/incidents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch offender incidents");
  return res.json();
}

export async function getOffender(
  token: string,
  id: string,
): Promise<OffenderResponse> {
  const res = await fetch(`${API_URL}/offenders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch offender");
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

export interface UpdateOffenderRequest {
  firstName?: string;
  lastName?: string;
  physicalMarkers?: string;
  riskScore?: number | null;
  currentStatus?: string;
  notes?: string;
  photoUrls?: string[];
}

export async function updateOffender(
  token: string,
  id: string,
  payload: UpdateOffenderRequest,
): Promise<OffenderResponse> {
  const res = await fetch(`${API_URL}/offenders/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update offender");
  return res.json();
}

export async function updateDataSharing(
  token: string,
  venueId: string,
  enabled: boolean,
): Promise<Venue> {
  const res = await fetch(`${API_URL}/venues/${venueId}/data-sharing`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error("Failed to update data sharing");
  return res.json();
}

// --- Nearby Venues ---

export interface NearbyVenueResponse {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
}

export async function getNearbyVenues(
  token: string,
  venueId: string,
  city: string,
  state: string,
  zip?: string,
): Promise<NearbyVenueResponse[]> {
  const params = new URLSearchParams({ venueId, city, state });
  if (zip) params.set("zip", zip);
  const res = await fetch(`${API_URL}/venues/nearby?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch nearby venues");
  return res.json();
}

// --- FCM Token ---

export async function registerFcmToken(token: string, fcmToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/me/fcm-token`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: fcmToken }),
  });
  if (!res.ok) throw new Error("Failed to register FCM token");
}

// --- Notification Activity ---

export type NotificationActivityType = "INCIDENT_REPORTED" | "OFFENDER_ADDED";

export interface NotificationActivity {
  id: string;
  type: NotificationActivityType;
  fromVenueId: string;
  fromVenueName: string;
  createdAt: string;
  incident: {
    id: string;
    type: IncidentType;
    severity: IncidentSeverity;
    status: IncidentStatus;
    description: string;
    keywords: string[];
    offenderIds: string[];
    createdAt: string;
    updatedAt: string;
  } | null;
  offender: {
    id: string;
    firstName: string;
    lastName: string;
    physicalMarkers: string | null;
  } | null;
}

export async function getNotificationActivity(
  token: string,
  venueId: string,
  sinceMinutes?: number,
): Promise<NotificationActivity[]> {
  const url = new URL(`${API_URL}/notifications/${venueId}/activity`);
  if (sinceMinutes) {
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();
    url.searchParams.set("since", since);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
}

// --- Notification Subscriptions ---

export interface NotificationSubscription {
  id: string;
  subscriber: string;
  venueId: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  notificationLevel: IncidentSeverity;
}

export async function getSubscriptions(
  token: string,
  venueId: string,
): Promise<NotificationSubscription[]> {
  const res = await fetch(`${API_URL}/notifications/${venueId}/subscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

export async function subscribeToVenues(
  token: string,
  venueId: string,
  venueIds: string[],
  notificationLevel: IncidentSeverity = "LOW",
): Promise<NotificationSubscription[]> {
  const res = await fetch(`${API_URL}/notifications/${venueId}/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ venueIds, notificationLevel }),
  });
  if (!res.ok) throw new Error("Failed to subscribe");
  return res.json();
}

export async function updateSubscriptionLevel(
  token: string,
  venueId: string,
  targetVenueId: string,
  notificationLevel: IncidentSeverity,
): Promise<NotificationSubscription> {
  const res = await fetch(
    `${API_URL}/notifications/${venueId}/subscriptions/${targetVenueId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationLevel }),
    },
  );
  if (!res.ok) throw new Error("Failed to update notification level");
  return res.json();
}

export async function uploadFile(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload file");
  const data = await res.json();
  return data.url;
}

export async function unsubscribeFromVenue(
  token: string,
  venueId: string,
  targetVenueId: string,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/notifications/${venueId}/subscriptions/${targetVenueId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error("Failed to unsubscribe");
}

// --- Offender Comments ---

export interface OffenderCommentResponse {
  id: string;
  offenderId: string;
  author: UserProfile;
  comment: string;
  createdAt: string;
}

export async function getOffenderComments(
  token: string,
  offenderId: string,
): Promise<OffenderCommentResponse[]> {
  const res = await fetch(`${API_URL}/offenders/${offenderId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch offender comments");
  return res.json();
}

export async function createOffenderComment(
  token: string,
  offenderId: string,
  comment: string,
): Promise<OffenderCommentResponse> {
  const res = await fetch(`${API_URL}/offenders/${offenderId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) throw new Error("Failed to create offender comment");
  return res.json();
}

export async function deleteOffenderComment(
  token: string,
  commentId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/offender-comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete offender comment");
}
