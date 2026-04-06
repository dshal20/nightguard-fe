import { render, screen } from "@testing-library/react";
import VenueSidebar from "@/app/venue/components/VenueSidebar";

jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => ({
    venues: [{ id: "v1", name: "NightGuard Downtown", streetAddress: "123 Main", city: "Gainesville", state: "FL", postalCode: "32601", phoneNumber: "555-0001", inviteCode: "NG1234" }],
    selectedVenue: { id: "v1", name: "NightGuard Downtown", streetAddress: "123 Main", city: "Gainesville", state: "FL", postalCode: "32601", phoneNumber: "555-0001", inviteCode: "NG1234" },
    setSelectedVenue: jest.fn(), loading: false, refetch: jest.fn(),
  }),
}));
jest.mock("@/app/src/lib/firebase", () => ({
  auth: { currentUser: { uid: "uid-1", email: "john@example.com", getIdToken: jest.fn().mockResolvedValue("t") } },
}));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_a: unknown, cb: (u: unknown) => void) => { cb({ uid: "uid-1", email: "john@example.com", getIdToken: jest.fn().mockResolvedValue("t") }); return jest.fn(); }),
  signOut: jest.fn(), getAuth: jest.fn(),
}));
jest.mock("@/lib/api", () => ({
  getMe: jest.fn().mockResolvedValue({ id: "u1", firstName: "John", lastName: "Doe", email: "john@example.com", phoneNumber: null, role: "USER" }),
}));

let mockPathname = "/venue";
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => mockPathname }));

describe("Navigation — Sidebar Links", () => {
  beforeEach(() => { mockPathname = "/venue"; });

  it("renders all main navigation links", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("Capacity")).toBeInTheDocument();
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
});

describe("Navigation — Active Link Highlighting", () => {
  it('highlights "Dashboard" when on /venue', () => {
    mockPathname = "/venue";
    render(<VenueSidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a")!;
    expect(dashboardLink.className).toContain("bg-[#16162A]");
  });

  it('highlights "Incidents" when on /venue/incidents', () => {
    mockPathname = "/venue/incidents";
    render(<VenueSidebar />);
    const incidentsLink = screen.getByText("Incidents").closest("a")!;
    expect(incidentsLink.className).toContain("bg-[#16162A]");
  });

  it('highlights "Account" when on /venue/account', () => {
    mockPathname = "/venue/account";
    render(<VenueSidebar />);
    const accountLink = screen.getByText("Account").closest("a")!;
    expect(accountLink.className).toContain("bg-[#16162A]");
  });

  it("does not highlight Dashboard when on incidents page", () => {
    mockPathname = "/venue/incidents";
    render(<VenueSidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a")!;
    expect(dashboardLink.className).toContain("text-[#8B8B9D]");
  });
});

describe("Navigation — Link Destinations", () => {
  it("Dashboard links to /venue", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/venue");
  });

  it("Incidents links to /venue/incidents", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Incidents").closest("a")).toHaveAttribute("href", "/venue/incidents");
  });

  it("Capacity links to /venue/capacity", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Capacity").closest("a")).toHaveAttribute("href", "/venue/capacity");
  });

  it("Offenders links to /venue/offenders", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Offenders").closest("a")).toHaveAttribute("href", "/venue/offenders");
  });

  it("Account links to /venue/account", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Account").closest("a")).toHaveAttribute("href", "/venue/account");
  });
});
