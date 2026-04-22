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
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }), usePathname: () => mockPathname, useParams: () => ({ id: "v1" }) }));

describe("Navigation — Sidebar Links", () => {
  beforeEach(() => { mockPathname = "/venue"; });

  it("renders all main navigation links", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("Patrons")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
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
    expect(screen.getByText("Venue Preferences")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });
});

describe("Navigation — Active Link Highlighting", () => {
  it('highlights "Dashboard" when on /venue/v1', () => {
    mockPathname = "/venue/v1";
    render(<VenueSidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a")!;
    expect(dashboardLink.className).toContain("bg-[#16162A]");
  });

  it('highlights "Incidents" when on /venue/v1/incidents', () => {
    mockPathname = "/venue/v1/incidents";
    render(<VenueSidebar />);
    const incidentsLink = screen.getByText("Incidents").closest("a")!;
    expect(incidentsLink.className).toContain("bg-[#16162A]");
  });

  it('highlights "Account" when on /venue/v1/account', () => {
    mockPathname = "/venue/v1/account";
    render(<VenueSidebar />);
    const accountLink = screen.getByText("Account").closest("a")!;
    expect(accountLink.className).toContain("bg-[#16162A]");
  });

  it("does not highlight Dashboard when on incidents page", () => {
    mockPathname = "/venue/v1/incidents";
    render(<VenueSidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a")!;
    expect(dashboardLink.className).toContain("text-[#8B8B9D]");
  });
});

describe("Navigation — Link Destinations", () => {
  it("Dashboard links to /venue/v1", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/venue/v1");
  });

  it("Incidents links to /venue/v1/incidents", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Incidents").closest("a")).toHaveAttribute("href", "/venue/v1/incidents");
  });

  it("Patrons links to /venue/v1/capacity", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Patrons").closest("a")).toHaveAttribute("href", "/venue/v1/capacity");
  });

  it("Logs links to /venue/v1/logs", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Logs").closest("a")).toHaveAttribute("href", "/venue/v1/logs");
  });

  it("Offenders links to /venue/v1/offenders", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Offenders").closest("a")).toHaveAttribute("href", "/venue/v1/offenders");
  });

  it("Account links to /venue/v1/account", () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Account").closest("a")).toHaveAttribute("href", "/venue/v1/account");
  });
});
