import { act, fireEvent, render, screen } from "@testing-library/react";
import VenueCard from "@/app/admin/components/VenueCard";
import { mockVenues } from "./helpers";

describe("Venue Card Component", () => {
  let writeTextMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    writeTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("formats address and filters empty values", () => {
    render(
      <VenueCard
        venue={{
          ...mockVenues[0],
          city: "",
        }}
      />,
    );

    expect(screen.getByText("123 Main St, FL, 32601")).toBeInTheDocument();
  });

  it("hides phone number when phone is not provided", () => {
    render(
      <VenueCard
        venue={{
          ...mockVenues[0],
          phoneNumber: "",
        }}
      />,
    );

    expect(screen.queryByText(mockVenues[0].phoneNumber)).not.toBeInTheDocument();
  });

  it("shows invite code value", () => {
    render(<VenueCard venue={mockVenues[0]} />);

    expect(screen.getByText("Invite Code")).toBeInTheDocument();
    expect(screen.getByText("NG1234")).toBeInTheDocument();
  });

  it("copies invite code and briefly shows check icon state", async () => {
    const { container } = render(<VenueCard venue={mockVenues[0]} />);

    const copyButton = screen.getByTitle("Copy invite code");
    fireEvent.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith("NG1234");
    expect(container.querySelector("svg.text-\\[\\#75FB94\\]")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(container.querySelector("svg.text-\\[\\#75FB94\\]")).not.toBeInTheDocument();
  });
});
