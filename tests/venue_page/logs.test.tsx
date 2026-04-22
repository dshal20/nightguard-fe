import { fireEvent, render, screen } from "@testing-library/react";
import LogsPage from "@/app/venue/[id]/logs/page";
import type { PatronLogResponse } from "@/lib/api";

const mockUseVenueContext = jest.fn();
const mockUsePatronLogsQuery = jest.fn();

jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => mockUseVenueContext(),
}));

jest.mock("@/lib/queries", () => ({
  usePatronLogsQuery: (...args: unknown[]) => mockUsePatronLogsQuery(...args),
}));

jest.mock("@/app/venue/components/CreateOffenderModal", () => ({
  __esModule: true,
  default: () => null,
}));

const sampleLog: PatronLogResponse = {
  id: "log-1",
  venueId: "venue-1",
  recordedByUserId: "user-1",
  decision: "ADMITTED",
  firstName: "Alex",
  middleName: null,
  lastName: "Johnson",
  driversLicenseId: "D1234567",
  dateOfBirth: "1998-06-21",
  expirationDate: "2030-06-21",
  state: "FL",
  streetAddress: "123 Main St",
  city: "Gainesville",
  postalCode: "32601",
  gender: "M",
  eyeColor: "BRN",
  createdAt: "2026-04-20T02:00:00Z",
  updatedAt: "2026-04-20T02:00:00Z",
  recordedBy: {
    id: "user-1",
    firstName: "Taylor",
    lastName: "Lee",
    email: "taylor@example.com",
  },
};

describe("Venue Logs Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVenueContext.mockReturnValue({
      selectedVenue: { id: "venue-1" },
    });
  });

  it("passes selected venue id into the patron logs query", () => {
    mockUsePatronLogsQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LogsPage />);
    expect(mockUsePatronLogsQuery).toHaveBeenCalledWith("venue-1");
  });

  it("shows loading state while logs are being fetched", () => {
    mockUsePatronLogsQuery.mockReturnValue({ data: [], isLoading: true });
    render(<LogsPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows empty state when there are no logs", () => {
    mockUsePatronLogsQuery.mockReturnValue({ data: [], isLoading: false });
    render(<LogsPage />);
    expect(
      screen.getByText("No patron logs yet. Use the ID Scanner on the Patrons page to log entries."),
    ).toBeInTheDocument();
  });

  it("renders rows and supports search filtering", () => {
    mockUsePatronLogsQuery.mockReturnValue({
      data: [sampleLog],
      isLoading: false,
    });
    render(<LogsPage />);

    expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
    expect(screen.getByText("Admitted")).toBeInTheDocument();
    expect(screen.getByText("1 of 1 log")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search logs..."), {
      target: { value: "zzz-no-match" },
    });
    expect(screen.getByText("No logs match your search.")).toBeInTheDocument();
  });
});

