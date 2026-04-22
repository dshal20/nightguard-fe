import { fireEvent, render, screen } from "@testing-library/react";
import NetworkAlertsCard from "@/app/venue/components/NetworkAlertsCard";

const mockUseVenueContext = jest.fn();
const mockUseNotificationActivityQuery = jest.fn();

jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => mockUseVenueContext(),
}));

jest.mock("@/lib/queries", () => ({
  useNotificationActivityQuery: (...args: unknown[]) => mockUseNotificationActivityQuery(...args),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
  }) => (
    <button type="button" onClick={onSelect}>
      {children}
    </button>
  ),
}));

describe("NetworkAlertsCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVenueContext.mockReturnValue({
      selectedVenue: { id: "venue-1" },
    });
  });

  it("shows loading placeholders while fetching activity", () => {
    mockUseNotificationActivityQuery.mockReturnValue({ data: [], isLoading: true });
    render(<NetworkAlertsCard />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders count and unique venue summary from activity", () => {
    mockUseNotificationActivityQuery.mockReturnValue({
      isLoading: false,
      data: [
        { fromVenueId: "v-1" },
        { fromVenueId: "v-1" },
        { fromVenueId: "v-2" },
      ],
    });
    render(<NetworkAlertsCard />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("From 2 venues")).toBeInTheDocument();
    expect(mockUseNotificationActivityQuery).toHaveBeenCalledWith("venue-1", 60);
  });

  it("changes query window when a new time range is selected", () => {
    mockUseNotificationActivityQuery.mockReturnValue({ data: [], isLoading: false });
    render(<NetworkAlertsCard />);

    fireEvent.click(screen.getByText("Last 24 Hours"));
    expect(mockUseNotificationActivityQuery).toHaveBeenLastCalledWith("venue-1", 1440);
    expect(screen.getByText("last 24 hours")).toBeInTheDocument();
  });
});

