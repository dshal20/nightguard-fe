import { render, screen, waitFor } from "@testing-library/react";
import IncidentsPage from "@/app/venue/incidents/page";
import { mockVenues, mockIncidents } from "./helpers";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockGetVenues = jest.fn();
const mockGetIncidents = jest.fn();

jest.mock("@/lib/api", () => ({
  getVenues: (...args: unknown[]) => mockGetVenues(...args),
  getIncidents: (...args: unknown[]) => mockGetIncidents(...args),
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
  getAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/venue/incidents",
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("Incidents Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Incidents heading", async () => {
    mockGetVenues.mockResolvedValue(mockVenues);
    mockGetIncidents.mockResolvedValue([]);

    render(<IncidentsPage />);
    expect(screen.getByText("Incidents")).toBeInTheDocument();
  });

  it('shows "No incidents reported yet." when there are zero incidents', async () => {
    mockGetVenues.mockResolvedValue(mockVenues);
    mockGetIncidents.mockResolvedValue([]);

    render(<IncidentsPage />);

    await waitFor(() => {
      expect(screen.getByText("No incidents reported yet.")).toBeInTheDocument();
    });
  });

  it("renders a table of incidents when incidents exist", async () => {
    mockGetVenues.mockResolvedValue(mockVenues);
    mockGetIncidents.mockResolvedValue(mockIncidents);

    render(<IncidentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Verbal Harassment")).toBeInTheDocument();
    });

    expect(screen.getByText("Physical Assault")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("displays incident descriptions", async () => {
    mockGetVenues.mockResolvedValue(mockVenues);
    mockGetIncidents.mockResolvedValue(mockIncidents);

    render(<IncidentsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Patron was verbally aggressive toward staff."),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Fight broke out near the bar area."),
    ).toBeInTheDocument();
  });

  it("displays incident keywords", async () => {
    mockGetVenues.mockResolvedValue(mockVenues);
    mockGetIncidents.mockResolvedValue(mockIncidents);

    render(<IncidentsPage />);

    await waitFor(() => {
      expect(screen.getByText("aggressive")).toBeInTheDocument();
    });

    expect(screen.getByText("verbal")).toBeInTheDocument();
    expect(screen.getByText("fight")).toBeInTheDocument();
    expect(screen.getByText("bar")).toBeInTheDocument();
  });

  it("shows an error message when venue fetch fails", async () => {
    mockGetVenues.mockRejectedValue(new Error("Network error"));
    mockGetIncidents.mockResolvedValue([]);

    render(<IncidentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it('shows "No venue found" when user has no venues', async () => {
    mockGetVenues.mockResolvedValue([]);
    mockGetIncidents.mockResolvedValue([]);

    render(<IncidentsPage />);

    await waitFor(() => {
      expect(screen.getByText("No venue found")).toBeInTheDocument();
    });
  });

  it("fetches incidents for the first venue", async () => {
    mockGetVenues.mockResolvedValue(mockVenues);
    mockGetIncidents.mockResolvedValue(mockIncidents);

    render(<IncidentsPage />);

    await waitFor(() => {
      expect(mockGetIncidents).toHaveBeenCalledWith("mock-token", "venue-1");
    });
  });
});
