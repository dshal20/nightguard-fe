import { render, screen } from "@testing-library/react";
import VenueDashboard from "@/app/venue/page";
import StatCard from "@/app/venue/components/StatCard";
import { mockVenues } from "./helpers";

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
/*  Tests: Capacity on Dashboard                                       */
/* ------------------------------------------------------------------ */

describe("Capacity — Dashboard StatCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVenueContext.mockReturnValue({
      venues: mockVenues,
      selectedVenue: mockVenues[0],
      setSelectedVenue: jest.fn(),
      loading: false,
      refetch: jest.fn(),
    });
  });

  it("renders the CURRENT CAPACITY card on the dashboard", () => {
    render(<VenueDashboard />);
    expect(screen.getByText("CURRENT CAPACITY")).toBeInTheDocument();
  });

  it("displays the capacity value (247)", () => {
    render(<VenueDashboard />);
    expect(screen.getByText("247")).toBeInTheDocument();
  });

  it('displays the "of 300 Max Capacity" subtitle', () => {
    render(<VenueDashboard />);
    expect(screen.getByText("of 300 Max Capacity")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: StatCard capacity rendering                                 */
/* ------------------------------------------------------------------ */

describe("Capacity StatCard — Isolated", () => {
  it("renders the capacity value and max subtitle", () => {
    render(
      <StatCard
        title="CURRENT CAPACITY"
        value={247}
        meta="Last reported 1 min ago"
        subtitle="of 300 Max Capacity"
        accent="green"
      />,
    );

    expect(screen.getByText("CURRENT CAPACITY")).toBeInTheDocument();
    expect(screen.getByText("247")).toBeInTheDocument();
    expect(screen.getByText("of 300 Max Capacity")).toBeInTheDocument();
    expect(screen.getByText("Last reported 1 min ago")).toBeInTheDocument();
  });

  it("renders correctly when capacity is zero", () => {
    render(
      <StatCard
        title="CURRENT CAPACITY"
        value={0}
        subtitle="of 100 Max Capacity"
        accent="green"
      />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("of 100 Max Capacity")).toBeInTheDocument();
  });

  it("renders when capacity is at max", () => {
    render(
      <StatCard
        title="CURRENT CAPACITY"
        value={300}
        subtitle="of 300 Max Capacity"
        accent="green"
      />,
    );

    expect(screen.getByText("300")).toBeInTheDocument();
  });

  it("can accept a red accent (for over-capacity scenarios)", () => {
    render(
      <StatCard
        title="CURRENT CAPACITY"
        value={350}
        subtitle="of 300 Max Capacity"
        accent="red"
      />,
    );

    expect(screen.getByText("350")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Placeholder tests for future capacity counter feature              */
/* ------------------------------------------------------------------ */

describe("Capacity Counter (future feature)", () => {
  it.todo("should render a counter with plus and minus buttons");
  it.todo("should increment count when plus button is clicked");
  it.todo("should decrement count when minus button is clicked");
  it.todo("should not decrement below zero");
  it.todo("should display a log count");
  it.todo("should allow editing the capacity limit");
  it.todo("should save the new limit and return to the previous view");
  it.todo("should reset count to zero when reset button is clicked");
  it.todo("should turn red when count exceeds the limit");
});
