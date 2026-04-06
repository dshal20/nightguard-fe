import { render, screen } from "@testing-library/react";
import VenueSidebar from "@/app/venue/components/VenueSidebar";
/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => ({
    venues: [
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
    ],
    selectedVenue: {
      id: "venue-1",
      name: "NightGuard Downtown",
      streetAddress: "123 Main St",
      city: "Gainesville",
      state: "FL",
      postalCode: "32601",
      phoneNumber: "352-555-0001",
      inviteCode: "NG1234",
    },
    setSelectedVenue: jest.fn(),
    loading: false,
    refetch: jest.fn(),
  }),
}));

jest.mock("@/app/src/lib/firebase", () => ({
  auth: {
    currentUser: {
      uid: "firebase-uid-1",
      email: "john.doe@example.com",
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    },
  },
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_auth: unknown, cb: (u: unknown) => void) => {
    cb({
      uid: "firebase-uid-1",
      email: "john.doe@example.com",
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    });
    return jest.fn();
  }),
  signOut: jest.fn(),
  getAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  getMe: jest.fn().mockResolvedValue({
    id: "user-1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "352-555-1234",
    role: "USER",
  }),
}));

let mockPathname = "/venue";
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => mockPathname,
}));

/* ------------------------------------------------------------------ */
/*  Tests: Navigation Links                                            */
/* ------------------------------------------------------------------ */

describe("Navigation — Sidebar Links", () => {
  beforeEach(() => {
    mockPathname = "/venue";
  });

  it("renders all main navigation links", () => {
    render(<VenueSidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("Offenders")).toBeInTheDocument();
    expect(screen.getByText("Staff")).toBeInTheDocument();
  });

  it("renders network section links", () => {
    render(<VenueSidebar />);

    expect(screen.getByText("Network Alerts")).toBeInTheDocument();
    expect(screen.getByText("Nearby Venues")).toBeInTheDocument();
  });

  it("renders settings section links", () => {
    render(<VenueSidebar />);

    expect(screen.getByText("Preferences")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("renders section headings", () => {
    render(<VenueSidebar />);

    expect(screen.getByText("NAVIGATION")).toBeInTheDocument();
    expect(screen.getByText("NETWORK")).toBeInTheDocument();
    expect(screen.getByText("SETTINGS")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Active Link Highlighting                                    */
/* ------------------------------------------------------------------ */

describe("Navigation — Active Link Highlighting", () => {
  it('highlights "Dashboard" when on /venue', () => {
    mockPathname = "/venue";
    render(<VenueSidebar />);

    const dashboardLink = screen.getByText("Dashboard").closest("a")!;
    expect(dashboardLink.className).toContain("text-white");
  });

  it('highlights "Incidents" when on /venue/incidents', () => {
    mockPathname = "/venue/incidents";
    render(<VenueSidebar />);

    const incidentsLink = screen.getByText("Incidents").closest("a")!;
    expect(incidentsLink.className).toContain("text-white");
  });

  it('highlights "Account" when on /venue/account', () => {
    mockPathname = "/venue/account";
    render(<VenueSidebar />);

    const accountLink = screen.getByText("Account").closest("a")!;
    expect(accountLink.className).toContain("text-white");
  });

  it("does not highlight Dashboard when on incidents page", () => {
    mockPathname = "/venue/incidents";
    render(<VenueSidebar />);

    const dashboardLink = screen.getByText("Dashboard").closest("a")!;
    expect(dashboardLink.className).toContain("text-[#DDDBDB]");
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Badge Rendering                                             */
/* ------------------------------------------------------------------ */

describe("Navigation — Badges", () => {
  it("renders a badge with count 3 on the Incidents link", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("the badge is inside the Incidents link", () => {
    render(<VenueSidebar />);

    const badge = screen.getByText("3");
    const incidentsLink = screen.getByText("Incidents").closest("a")!;
    expect(incidentsLink).toContainElement(badge);
  });

  it("no badge is rendered on the Dashboard link", () => {
    render(<VenueSidebar />);

    const dashboardLink = screen.getByText("Dashboard").closest("a")!;
    const badges = dashboardLink.querySelectorAll('[class*="rounded-full"]');
    expect(badges.length).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Link hrefs                                                  */
/* ------------------------------------------------------------------ */

describe("Navigation — Link Destinations", () => {
  it("Dashboard links to /venue", () => {
    render(<VenueSidebar />);
    const link = screen.getByText("Dashboard").closest("a");
    expect(link).toHaveAttribute("href", "/venue");
  });

  it("Incidents links to /venue/incidents", () => {
    render(<VenueSidebar />);
    const link = screen.getByText("Incidents").closest("a");
    expect(link).toHaveAttribute("href", "/venue/incidents");
  });

  it("Account links to /venue/account", () => {
    render(<VenueSidebar />);
    const link = screen.getByText("Account").closest("a");
    expect(link).toHaveAttribute("href", "/venue/account");
  });
});
