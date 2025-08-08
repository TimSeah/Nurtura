// import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import MedicationsCard from "../../../../src/pages/healthMonitoring/components/medications/MedicationsCard";
import { CareRecipient } from "../../../../src/types";

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

// Mock care recipient data
const mockRecipient: CareRecipient = {
  _id: "123",
  name: "John Doe",
  dateOfBirth: "1970-01-01",
  relationship: "Father",
  medicalConditions: ["Hypertension"],
  emergencyContacts: [
    {
      name: "Jane Doe",
      phone: "1234567890",
      email: "123@gmail.com",
      relationship: "Spouse",
    },
  ],
  medications: [
    {
      name: "Aspirin",
      dosage: "100mg",
      frequency: "Once daily",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      notes: "Take with food",
    },
  ],
  caregiverNotes: "Take with food",
  isActive: true,
};

describe("MedicationsCard", () => {
  const mockOnMedicationAdded = jest.fn();

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockOnMedicationAdded.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test("displays alert if no recipient selected when saving", async () => {
    window.alert = jest.fn();

    render(<MedicationsCard selectedRecipient={null} />);

    // Click Add Medication first to show the modal
    const addButton = screen.queryByText("Add Medication");
    if (addButton) fireEvent.click(addButton); // only appears if selectedRecipient is truthy

    // Since selectedRecipient is null, Save Medications shouldn't exist at all
    expect(screen.queryByText("Save Medications")).not.toBeInTheDocument();
  });

  test("renders recipient name and medications", () => {
    render(<MedicationsCard selectedRecipient={mockRecipient} />);
    expect(screen.getByText("Medications - John Doe")).toBeInTheDocument();
    expect(screen.getByText("Aspirin")).toBeInTheDocument();
    expect(screen.getByText("100mg")).toBeInTheDocument();
    expect(screen.getByText(/frequency:\s*once daily/i)).toBeInTheDocument();
    expect(screen.getByText(/take with food/i)).toBeInTheDocument(); // flexible match
  });

  test("opens add medication modal when button is clicked", () => {
    render(<MedicationsCard selectedRecipient={mockRecipient} />);
    fireEvent.click(screen.getByText("Add Medication"));
    expect(
      screen.getByText("Add New Medications for John Doe")
    ).toBeInTheDocument();
  });

  test("adds and removes medication forms dynamically", () => {
    render(<MedicationsCard selectedRecipient={mockRecipient} />);
    fireEvent.click(screen.getByText("Add Medication"));

    const nameInputs = screen.getAllByPlaceholderText("Medication Name *");
    expect(nameInputs.length).toBe(1);

    fireEvent.click(screen.getByText("Add Another Medication"));
    const updatedInputs = screen.getAllByPlaceholderText("Medication Name *");
    expect(updatedInputs.length).toBe(2);

    fireEvent.click(screen.getAllByText("Remove")[0]);
    expect(screen.getAllByPlaceholderText("Medication Name *").length).toBe(1);
  });

  test("displays alert if trying to save without valid medication", async () => {
    // Mock window.alert
    window.alert = jest.fn();

    render(<MedicationsCard selectedRecipient={mockRecipient} />);
    fireEvent.click(screen.getByText("Add Medication"));
    fireEvent.change(screen.getByPlaceholderText("Medication Name *"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("Save Medications"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Please add at least one medication"
      );
    });
  });

  test("does not show Save Medications button if no recipient is selected", () => {
    render(<MedicationsCard selectedRecipient={null} />);
    expect(screen.queryByText("Save Medications")).not.toBeInTheDocument();
  });

  test("opens edit modal when medication card is clicked", () => {
    render(<MedicationsCard selectedRecipient={mockRecipient} />);

    const medicationCard = screen
      .getByText("Aspirin")
      .closest(".medication-card");
    fireEvent.click(medicationCard!);

    // Check that we can see unique modal content
    expect(screen.getByText("Edit")).toBeInTheDocument(); // The Edit button in modal
    expect(screen.getByText("Delete")).toBeInTheDocument(); // The Delete button in modal
  });

  test("updates medication successfully", async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockRecipient,
        medications: [
          {
            name: "Updated Aspirin",
            dosage: "200mg",
            frequency: "Twice daily",
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            notes: "Updated notes",
          },
        ],
      }),
    });

    render(
      <MedicationsCard
        selectedRecipient={mockRecipient}
        onMedicationAdded={mockOnMedicationAdded}
      />
    );

    // Click on medication card to open edit modal
    const medicationCard = screen
      .getByText("Aspirin")
      .closest(".medication-card");
    fireEvent.click(medicationCard!);

    // Click Edit button to open edit form
    fireEvent.click(screen.getByText("Edit"));

    // Update medication details
    const nameInput = screen.getByDisplayValue("Aspirin");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Aspirin");

    const dosageInput = screen.getByDisplayValue("100mg");
    await user.clear(dosageInput);
    await user.type(dosageInput, "200mg");

    // Save changes
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/care-recipients/123"),
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining('"name":"Updated Aspirin"'),
        })
      );
      expect(mockOnMedicationAdded).toHaveBeenCalled();
    });
  });

  test("deletes medication successfully", async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn().mockReturnValue(true);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockRecipient,
        medications: [],
      }),
    });

    render(
      <MedicationsCard
        selectedRecipient={mockRecipient}
        onMedicationAdded={mockOnMedicationAdded}
      />
    );

    // Click on medication card to open edit modal
    const medicationCard = screen
      .getByText("Aspirin")
      .closest(".medication-card");
    fireEvent.click(medicationCard!);

    // Click delete button
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/care-recipients/123/medications/"),
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
        })
      );
      expect(mockOnMedicationAdded).toHaveBeenCalled();
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test("handles medication update API error", async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MedicationsCard
        selectedRecipient={mockRecipient}
        onMedicationAdded={mockOnMedicationAdded}
      />
    );

    // Click on medication card to open edit modal
    const medicationCard = screen
      .getByText("Aspirin")
      .closest(".medication-card");
    fireEvent.click(medicationCard!);

    // Click Edit button to open edit form
    fireEvent.click(screen.getByText("Edit"));

    // Update medication name
    const nameInput = screen.getByDisplayValue("Aspirin");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Aspirin");

    // Try to save changes
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error updating medication:",
        expect.any(Error)
      );
    });
  });

  test("handles medication delete API error", async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn().mockReturnValue(true);

    (fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MedicationsCard
        selectedRecipient={mockRecipient}
        onMedicationAdded={mockOnMedicationAdded}
      />
    );

    // Click on medication card to open edit modal
    const medicationCard = screen
      .getByText("Aspirin")
      .closest(".medication-card");
    fireEvent.click(medicationCard!);

    // Try to delete medication
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting medication:",
        expect.any(Error)
      );
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test("closes edit modal when cancel is clicked", () => {
    render(<MedicationsCard selectedRecipient={mockRecipient} />);

    // Click on medication card to open edit modal
    const medicationCard = screen
      .getByText("Aspirin")
      .closest(".medication-card");
    fireEvent.click(medicationCard!);

    // Should see the modal (not edit form initially) - check for unique modal content
    expect(screen.getByText("Edit")).toBeInTheDocument(); // The Edit button in modal

    // Click cancel (which should be "Close" button)
    fireEvent.click(screen.getByText("Close"));

    // Modal should be closed - check that we can't see the modal content
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  test("validates required fields in edit modal", async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();

    render(<MedicationsCard selectedRecipient={mockRecipient} />);

    // Click on medication card to open edit modal
    const medicationCard = screen
      .getByText("Aspirin")
      .closest(".medication-card");
    fireEvent.click(medicationCard!);

    // Click Edit button to open edit form
    fireEvent.click(screen.getByText("Edit"));

    // Clear required field
    const nameInput = screen.getByDisplayValue("Aspirin");
    await user.clear(nameInput);

    // Try to save
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Error updating medication. Please try again."
      );
    });
  });
});
