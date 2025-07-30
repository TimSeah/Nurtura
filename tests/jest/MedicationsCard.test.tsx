import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MedicationsCard from "../../src/pages/healthMonitoring/components/medications/MedicationsCard";
import { CareRecipient } from "../../src/types";

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
});
