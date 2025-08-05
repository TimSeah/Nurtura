import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HealthTracking from "../../src/pages/healthMonitoring/HealthTracking";
import { apiService } from "../../src/services/apiService";

// Mock Modal to prevent full DOM rendering
jest.mock("../../src/components/Modal", () => ({
  __esModule: true,
  default: ({ isOpen, children }: any) =>
    isOpen ? <div>{children}</div> : null,
}));

// Mock API service
jest.mock("../../src/services/apiService");

const mockCareRecipients = [
  { _id: "1", name: "John Doe" },
  { _id: "2", name: "Jane Smith" },
];

const mockVitalSigns = [
  {
    _id: "v1",
    recipientId: "1",
    vitalType: "blood_pressure",
    value: "120/80",
    unit: "mmHg",
    dateTime: new Date().toISOString(),
    notes: "",
  },
];

describe("HealthTracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (apiService.getCareRecipients as jest.Mock).mockResolvedValue(
      mockCareRecipients
    );
    (apiService.getVitalSigns as jest.Mock).mockResolvedValue(mockVitalSigns);
    (apiService.addVitalSigns as jest.Mock).mockImplementation((data) =>
      Promise.resolve({ ...data, _id: "new_vital" })
    );
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it("renders header and recipient selector", async () => {
    // Mock API call before rendering
    jest
      .spyOn(apiService, "getCareRecipients")
      .mockResolvedValue(mockCareRecipients);

    render(<HealthTracking />);

    // Check static header
    expect(screen.getByText("Health Tracking")).toBeInTheDocument();

    // Wait for dynamic content
    const firstRecipient = await screen.findByText("John Doe");
    expect(firstRecipient).toBeInTheDocument();

    // Verify API call
    expect(apiService.getCareRecipients).toHaveBeenCalled();
  });

  it("opens and submits add vital form", async () => {
    render(<HealthTracking />);
    await waitFor(() => screen.getByText("John Doe"));

    const addButton = screen.getByText("Add Reading");
    fireEvent.click(addButton);

    const valueInput = screen.getByPlaceholderText("120/80");
    fireEvent.change(valueInput, { target: { value: "118/75" } });

    const saveButton = screen.getByText("Save Reading");
    fireEvent.click(saveButton);

    await waitFor(() => expect(apiService.addVitalSigns).toHaveBeenCalled());

    expect(apiService.addVitalSigns).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: "1",
        vitalType: "blood_pressure",
        value: "118/75",
        unit: "mmHg",
      })
    );
  });

  it("handles API errors gracefully", async () => {
    (apiService.getCareRecipients as jest.Mock).mockRejectedValue(
      new Error("Fetch error")
    );
    render(<HealthTracking />);

    await waitFor(() => {
      expect(
        screen.getByText((text) =>
          text.includes("Error loading care recipients")
        )
      ).toBeInTheDocument();
    });
  });
});
