import { render, screen } from "@testing-library/react";
import VenueDashboard from "@/app/venue/[id]/page";
import StatCard from "@/app/venue/components/StatCard";
import { mockVenues } from "./helpers";

const mockUseVenueContext = jest.fn();
jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => mockUseVenueContext(),
}));

const mockUseIncidentsQuery = jest.fn();
const mockUseCapacityQuery = jest.fn();
const mockUseHeadcountsQuery = jest.fn();
jest.mock("@/lib/queries", () => ({
  useIncidentsQuery: (...a: unknown[]) => mockUseIncidentsQuery(...a),
  useCapacityQuery: (...a: unknown[]) => mockUseCapacityQuery(...a),
  useHeadcountsQuery: (...a: unknown[]) => mockUseHeadcountsQuery(...a),
  useOffendersQuery: jest.fn().mockReturnValue({ data: [] }),
  useNotificationActivityQuery: jest.fn().mockReturnValue({ data: [], isLoading: false }),
}));
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn().mockReturnValue({ invalidateQueries: jest.fn() }),
  useQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false }),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  QueryClient: jest.fn(),
}));

jest.mock("@/app/src/lib/firebase", () => ({
  auth: { currentUser: { uid: "uid-1", email: "john@example.com", getIdToken: jest.fn().mockResolvedValue("t") } },
}));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_a: unknown, cb: (u: unknown) => void) => { cb({ uid: "uid-1", getIdToken: jest.fn().mockResolvedValue("t") }); return jest.fn(); }),
  signOut: jest.fn(), getAuth: jest.fn(),
}));
jest.mock("@/lib/api", () => ({ getMe: jest.fn().mockResolvedValue({ id: "u1", firstName: "John", lastName: "Doe", email: "john@example.com", phoneNumber: null, role: "USER" }), joinVenue: jest.fn() }));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/venue/venue-1",
  useParams: () => ({ id: "venue-1" }),
}));
jest.mock("@/app/venue/components/OffenderSearch", () => ({ __esModule: true, default: () => <div data-testid="offender-search" /> }));

describe("Capacity — Dashboard StatCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVenueContext.mockReturnValue({ venues: mockVenues, selectedVenue: mockVenues[0], setSelectedVenue: jest.fn(), loading: false, refetch: jest.fn() });
    mockUseIncidentsQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseCapacityQuery.mockReturnValue({ data: { capacity: 300 } });
    mockUseHeadcountsQuery.mockReturnValue({ data: [{ headcount: 247, createdAt: "2026-04-05T02:00:00Z" }] });
  });

  it("renders the CURRENT CAPACITY card on the dashboard", () => {
    render(<VenueDashboard />);
    expect(screen.getByText("CURRENT CAPACITY")).toBeInTheDocument();
  });

  it("displays the current headcount value", () => {
    render(<VenueDashboard />);
    expect(screen.getByText("247")).toBeInTheDocument();
  });

  it('displays the max capacity subtitle', () => {
    render(<VenueDashboard />);
    expect(screen.getByText("of 300 max capacity")).toBeInTheDocument();
  });

  it('shows "—" when no capacity is set', () => {
    mockUseCapacityQuery.mockReturnValue({ data: null });
    mockUseHeadcountsQuery.mockReturnValue({ data: [] });
    render(<VenueDashboard />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("Capacity StatCard — Isolated", () => {
  it("renders the capacity value and max subtitle", () => {
    render(<StatCard title="CURRENT CAPACITY" value={247} meta="Updated 5m ago" subtitle="of 300 max capacity" accent="green" />);
    expect(screen.getByText("CURRENT CAPACITY")).toBeInTheDocument();
    expect(screen.getByText("247")).toBeInTheDocument();
    expect(screen.getByText("of 300 max capacity")).toBeInTheDocument();
  });

  it("renders correctly when capacity is zero", () => {
    render(<StatCard title="CURRENT CAPACITY" value={0} subtitle="of 100 max capacity" accent="green" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("can accept a red accent for over-capacity", () => {
    render(<StatCard title="CURRENT CAPACITY" value={350} subtitle="of 300 max capacity" accent="red" />);
    expect(screen.getByText("350")).toBeInTheDocument();
  });

  it("renders a progress bar", () => {
    const { container } = render(<StatCard title="CURRENT CAPACITY" value={200} accent="green" progress={0.67} />);
    expect(container.querySelector("[style*='width: 67%']")).toBeInTheDocument();
  });
});

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
