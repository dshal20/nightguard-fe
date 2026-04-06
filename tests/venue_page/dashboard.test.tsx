import { render, screen } from "@testing-library/react";
import VenueDashboard from "@/app/venue/page";
import StatCard from "@/app/venue/components/StatCard";
import RecentReports from "@/app/venue/components/RecentReports";
import LiveActivity from "@/app/venue/components/LiveActivity";
import { mockVenues, mockIncidents } from "./helpers";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockUseVenueContext = jest.fn();
jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => mockUseVenueContext(),
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
    phoneNumber: null,
    role: "USER",
  }),
  getVenues: jest.fn().mockResolvedValue([]),
  getIncidents: jest.fn().mockResolvedValue([]),
  joinVenue: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/venue",
}));

/* ------------------------------------------------------------------ */
/*  Tests: Dashboard Page                                              */
/* ------------------------------------------------------------------ */

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all four StatCards when a venue is selected", () => {
    mockUseVenueContext.mockReturnValue({
      venues: mockVenues,
      selectedVenue: mockVenues[0],
      setSelectedVenue: jest.fn(),
      loading: false,
      refetch: jest.fn(),
    });

    render(<VenueDashboard />);

    expect(screen.getByText("ACTIVE INCIDENTS")).toBeInTheDocument();
    expect(screen.getByText("TOTAL TONIGHT")).toBeInTheDocument();
    expect(screen.getByText("CURRENT CAPACITY")).toBeInTheDocument();
    expect(screen.getByText("NETWORK ALERTS")).toBeInTheDocument();
  });

  it("shows loading state when venue context is loading", () => {
    mockUseVenueContext.mockReturnValue({
      venues: [],
      selectedVenue: null,
      setSelectedVenue: jest.fn(),
      loading: true,
      refetch: jest.fn(),
    });

    render(<VenueDashboard />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows JoinVenuePrompt when user has no venues", () => {
    mockUseVenueContext.mockReturnValue({
      venues: [],
      selectedVenue: null,
      setSelectedVenue: jest.fn(),
      loading: false,
      refetch: jest.fn(),
    });

    render(<VenueDashboard />);
    expect(screen.getByText("Join a Venue")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("INVITE CODE")).toBeInTheDocument();
  });

  it("renders the New Report button", () => {
    mockUseVenueContext.mockReturnValue({
      venues: mockVenues,
      selectedVenue: mockVenues[0],
      setSelectedVenue: jest.fn(),
      loading: false,
      refetch: jest.fn(),
    });

    render(<VenueDashboard />);
    expect(screen.getByText("New Report")).toBeInTheDocument();
  });

  it("renders the Export Event Report button", () => {
    mockUseVenueContext.mockReturnValue({
      venues: mockVenues,
      selectedVenue: mockVenues[0],
      setSelectedVenue: jest.fn(),
      loading: false,
      refetch: jest.fn(),
    });

    render(<VenueDashboard />);
    expect(screen.getByText("Export Event Report")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: StatCard Component                                          */
/* ------------------------------------------------------------------ */

describe("StatCard Component", () => {
  it("renders title, value, meta, and subtitle", () => {
    render(
      <StatCard
        title="ACTIVE INCIDENTS"
        value={5}
        meta="Last report 2 mins ago"
        subtitle="↑ 2 from Last Hour"
        accent="red"
      />,
    );

    expect(screen.getByText("ACTIVE INCIDENTS")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Last report 2 mins ago")).toBeInTheDocument();
    expect(screen.getByText("↑ 2 from Last Hour")).toBeInTheDocument();
  });

  it("renders without optional meta", () => {
    render(
      <StatCard title="NETWORK ALERTS" value={13} accent="blue" />,
    );

    expect(screen.getByText("NETWORK ALERTS")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it.each(["red", "amber", "green", "blue"] as const)(
    "renders with %s accent without crashing",
    (accent) => {
      render(
        <StatCard title="TEST" value={0} accent={accent} />,
      );
      expect(screen.getByText("TEST")).toBeInTheDocument();
    },
  );
});

/* ------------------------------------------------------------------ */
/*  Tests: RecentReports Component                                     */
/* ------------------------------------------------------------------ */

describe("RecentReports Component", () => {
  it("shows empty message when there are no incidents", () => {
    render(<RecentReports incidents={[]} loading={false} />);
    expect(screen.getByText("No incidents reported yet.")).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    const { container } = render(<RecentReports incidents={[]} loading={true} />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders incident rows when incidents are provided", () => {
    render(<RecentReports incidents={mockIncidents} loading={false} />);

    expect(screen.getByText("Verbal Harassment")).toBeInTheDocument();
    expect(screen.getByText("Physical Assault")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("renders View All Reports link", () => {
    render(<RecentReports incidents={[]} loading={false} />);
    expect(screen.getByText("View All Reports")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: LiveActivity Component                                      */
/* ------------------------------------------------------------------ */

describe("LiveActivity Component", () => {
  it("renders the Live Activity heading", () => {
    render(<LiveActivity />);
    expect(screen.getByText("Live Activity")).toBeInTheDocument();
  });

  it("renders activity items", () => {
    render(<LiveActivity />);
    expect(screen.getByText("Nearby Report")).toBeInTheDocument();
    expect(screen.getAllByText("Medical Emergency")).toHaveLength(2);
    expect(screen.getAllByText("Trespass Issued")).toHaveLength(2);
  });

  it("renders filter button", () => {
    render(<LiveActivity />);
    expect(screen.getByText("Filter")).toBeInTheDocument();
  });
});
