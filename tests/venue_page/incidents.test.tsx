import { render, screen, waitFor } from "@testing-library/react";
import IncidentsPage from "@/app/venue/[id]/incidents/page";
import { mockVenues, mockIncidents } from "./helpers";

const mockUseVenueContext = jest.fn();
jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => mockUseVenueContext(),
}));

const mockUseIncidentsQuery = jest.fn();
jest.mock("@/lib/queries", () => ({
  useIncidentsQuery: (...args: unknown[]) => mockUseIncidentsQuery(...args),
}));

jest.mock("@/app/src/lib/firebase", () => ({
  auth: { currentUser: { uid: "uid-1", email: "john@example.com", getIdToken: jest.fn().mockResolvedValue("t") } },
}));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_a: unknown, cb: (u: unknown) => void) => { cb({ uid: "uid-1", getIdToken: jest.fn().mockResolvedValue("t") }); return jest.fn(); }),
  getAuth: jest.fn(),
}));
jest.mock("@/lib/api", () => ({}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/venue/venue-1/incidents",
  useSearchParams: () => ({ get: () => null }),
}));
jest.mock("@/app/venue/components/EditIncidentModal", () => ({ __esModule: true, default: () => null }));

describe("Incidents Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVenueContext.mockReturnValue({ venues: mockVenues, selectedVenue: mockVenues[0], setSelectedVenue: jest.fn(), loading: false, refetch: jest.fn() });
  });

  it('shows "No incidents reported yet." when there are zero incidents', () => {
    mockUseIncidentsQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<IncidentsPage />);
    expect(screen.getByText("No incidents reported yet.")).toBeInTheDocument();
  });

  it("renders a table of incidents when incidents exist", () => {
    mockUseIncidentsQuery.mockReturnValue({ data: mockIncidents, isLoading: false, isError: false });
    render(<IncidentsPage />);
    expect(screen.getByText("Verbal Harassment")).toBeInTheDocument();
    expect(screen.getByText("Physical Assault")).toBeInTheDocument();
  });

  it("displays incident descriptions", () => {
    mockUseIncidentsQuery.mockReturnValue({ data: mockIncidents, isLoading: false, isError: false });
    render(<IncidentsPage />);
    expect(screen.getByText("Patron was verbally aggressive toward staff.")).toBeInTheDocument();
    expect(screen.getByText("Fight broke out near the bar area.")).toBeInTheDocument();
  });

  it("displays incident keywords", () => {
    mockUseIncidentsQuery.mockReturnValue({ data: mockIncidents, isLoading: false, isError: false });
    render(<IncidentsPage />);
    expect(screen.getByText("aggressive")).toBeInTheDocument();
    expect(screen.getByText("verbal")).toBeInTheDocument();
    expect(screen.getByText("fight")).toBeInTheDocument();
    expect(screen.getByText("bar")).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    mockUseIncidentsQuery.mockReturnValue({ data: [], isLoading: true, isError: false });
    const { container } = render(<IncidentsPage />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows error message when query fails", () => {
    mockUseIncidentsQuery.mockReturnValue({ data: [], isLoading: false, isError: true });
    render(<IncidentsPage />);
    expect(screen.getByText("Failed to load incidents.")).toBeInTheDocument();
  });

  it("passes selectedVenue.id to the query hook", () => {
    mockUseIncidentsQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<IncidentsPage />);
    expect(mockUseIncidentsQuery).toHaveBeenCalledWith("venue-1");
  });
});
