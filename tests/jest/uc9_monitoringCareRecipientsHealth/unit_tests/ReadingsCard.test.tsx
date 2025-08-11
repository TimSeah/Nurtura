import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ReadingsCard from "../../../../src/pages/healthMonitoring/components/readingsCard/ReadingsCard";
import { CareRecipient } from "../../../../src/types";

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

const mockRecipient: CareRecipient = {
  _id: "1",
  name: "John Doe",
  dateOfBirth: "1980-01-01",
  relationship: "Father",
  medicalConditions: ["Hypertension"],
  medications: [
    {
      name: "Atenolol",
      dosage: "50mg",
      frequency: "Once a day",
      startDate: "2023-01-01",
      notes: "Take after meals",
    },
  ],
  emergencyContacts: [
    {
      name: "Jane Doe",
      relationship: "Daughter",
      phone: "123-456-7890",
      email: "jane@example.com",
    },
  ],
  caregiverNotes: "Check BP daily",
  isActive: true,
  createdAt: "2023-06-01T10:00:00Z",
  updatedAt: "2023-06-05T15:00:00Z",
};

const mockReadings: {
  _id: string;
  recipientId: string;
  vitalType:
    | "heart_rate"
    | "blood_pressure"
    | "temperature"
    | "weight"
    | "blood_sugar"
    | "oxygen_saturation";
  value: string;
  unit: string;
  dateTime: string;
  notes?: string;
}[] = [
  {
    _id: "r1",
    recipientId: "1",
    vitalType: "heart_rate",
    value: "75",
    unit: "bpm",
    dateTime: "2023-07-01T08:00:00Z",
    notes: "Feeling good",
  },
  {
    _id: "r2",
    recipientId: "1",
    vitalType: "blood_pressure",
    value: "120/80",
    unit: "mmHg",
    dateTime: "2023-07-02T09:30:00Z",
  },
  {
    _id: "r3",
    recipientId: "1",
    vitalType: "temperature",
    value: "37",
    unit: "°C",
    dateTime: "2023-07-03T10:00:00Z",
  },
  {
    _id: "r4",
    recipientId: "1",
    vitalType: "weight",
    value: "70",
    unit: "kg",
    dateTime: "2023-07-04T11:00:00Z",
  },
  {
    _id: "r5",
    recipientId: "1",
    vitalType: "blood_sugar",
    value: "90",
    unit: "mg/dL",
    dateTime: "2023-07-05T12:00:00Z",
  },
];

describe("ReadingsCard", () => {
  const mockOnReadingUpdated = jest.fn();

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockOnReadingUpdated.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not render without a selected recipient", () => {
    const { container } = render(
      <ReadingsCard
        selectedRecipient={null}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders readings for the selected recipient", () => {
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );
    expect(screen.getByText(/Recent Readings - John Doe/i)).toBeInTheDocument();
    const heartRateCards = screen.getAllByText(/Heart Rate/);
    expect(heartRateCards.length).toBeGreaterThan(0); // in the screen, there are multiple elements with the text Heart Rate
    const BloodPressureCards = screen.getAllByText(/Blood Pressure/);
    expect(BloodPressureCards.length).toBeGreaterThan(0); // in the screen, there are multiple elements with the text Heart Rate
  });

  it("calls onAddReading when button is clicked", () => {
    const onAddReading = jest.fn();
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={onAddReading}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    const addButton = screen.getByRole("button", { name: /Add Reading/i });
    fireEvent.click(addButton);
    expect(onAddReading).toHaveBeenCalled();
  });

  it("filters readings by selected vital type", () => {
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "heart_rate" },
    });

    const heartRateCards = screen.getAllByText(/Heart Rate/);
    expect(heartRateCards.length).toBeGreaterThan(0); // in the screen, there are multiple elements with the text Heart Rate
  });

  it("displays pagination controls when readings exceed items per page", () => {
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/i })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );
    expect(screen.getByRole("button", { name: /Previous/i })).toBeDisabled();
  });

  it("shows message when there are no readings for selected filter", () => {
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "oxygen_saturation" },
    });

    expect(
      screen.getByText(/No readings found for the selected filter/)
    ).toBeInTheDocument();
  });

  // Edit/Delete functionality tests
  it("opens edit modal when reading card is clicked", async () => {
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    // Click on a reading card
    const heartRateCard = screen.getByText("75 bpm").closest(".reading-card");
    fireEvent.click(heartRateCard!);

    // Check if modal opened
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Delete/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Close/i })
      ).toBeInTheDocument();
    });
  });

  it("edits reading successfully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    // Click on a reading card to open modal
    const heartRateCard = screen.getByText("75 bpm").closest(".reading-card");
    fireEvent.click(heartRateCard!);

    // Wait for modal to open and click edit button
    await waitFor(() => {
      const editButton = screen.getByRole("button", { name: /Edit/i });
      fireEvent.click(editButton);
    });

    // Fill out the edit form
    const valueInput = screen.getByDisplayValue("75");
    const notesInput = screen.getByDisplayValue("Feeling good");

    await act(async () => {
      await userEvent.clear(valueInput);
      await userEvent.type(valueInput, "80");
      await userEvent.clear(notesInput);
      await userEvent.type(notesInput, "Updated notes");
    });

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveButton);

    // Check API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/vital-signs/r1",
        expect.objectContaining({
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value: "80",
            unit: "bpm",
            dateTime: "2023-07-01T08:00",
            notes: "Updated notes",
          }),
        })
      );
    });

    // Check callback was called
    expect(mockOnReadingUpdated).toHaveBeenCalled();
  });

  it("handles edit reading API failure", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    // Click on a reading card and edit
    const heartRateCard = screen.getByText("75 bpm").closest(".reading-card");
    fireEvent.click(heartRateCard!);

    await waitFor(() => {
      const editButton = screen.getByRole("button", { name: /Edit/i });
      fireEvent.click(editButton);
    });

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveButton);

    // Check error alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Error updating reading. Please try again."
      );
    });
  });

  it("deletes reading successfully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    // Click on a reading card to open modal
    const heartRateCard = screen.getByText("75 bpm").closest(".reading-card");
    fireEvent.click(heartRateCard!);

    // Wait for modal and click delete button
    await waitFor(() => {
      const deleteButton = screen.getByRole("button", { name: /Delete/i });
      fireEvent.click(deleteButton);
    });

    // Check API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/vital-signs/r1",
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
        })
      );
    });

    // Check callback was called
    expect(mockOnReadingUpdated).toHaveBeenCalled();
  });

  it("handles delete reading API failure", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    // Click on a reading card and delete
    const heartRateCard = screen.getByText("75 bpm").closest(".reading-card");
    fireEvent.click(heartRateCard!);

    await waitFor(() => {
      const deleteButton = screen.getByRole("button", { name: /Delete/i });
      fireEvent.click(deleteButton);
    });

    // Check error alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Error deleting reading. Please try again."
      );
    });
  });

  it("cancels edit mode when cancel button is clicked", async () => {
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    // Click on a reading card and edit
    const heartRateCard = screen.getByText("75 bpm").closest(".reading-card");
    fireEvent.click(heartRateCard!);

    await waitFor(() => {
      const editButton = screen.getByRole("button", { name: /Edit/i });
      fireEvent.click(editButton);
    });

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Should be back to view mode
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Save Changes/i })
      ).not.toBeInTheDocument();
    });
  });

  it("closes modal when close button is clicked", async () => {
    render(
      <ReadingsCard
        selectedRecipient={mockRecipient}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
        onReadingUpdated={mockOnReadingUpdated}
      />
    );

    // Click on a reading card
    const heartRateCard = screen.getByText("75 bpm").closest(".reading-card");
    fireEvent.click(heartRateCard!);

    await waitFor(() => {
      const closeButton = screen.getByRole("button", { name: /Close/i });
      fireEvent.click(closeButton);
    });

    // Modal should be closed
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Edit/i })
      ).not.toBeInTheDocument();
    });
  });
});
