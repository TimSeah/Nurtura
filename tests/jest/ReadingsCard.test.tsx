// ReadingsCard.test.tsx

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReadingsCard from "../../src/pages/healthMonitoring/components/readingsCard/ReadingsCard";
import { CareRecipient } from "../../src/types";

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
}[] = [
  {
    _id: "r1",
    recipientId: "1",
    vitalType: "heart_rate",
    value: "75",
    unit: "bpm",
    dateTime: "2023-07-01T08:00:00Z",
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
  it("does not render without a selected recipient", () => {
    const { container } = render(
      <ReadingsCard
        selectedRecipient={null}
        vitalReadings={mockReadings}
        onAddReading={jest.fn()}
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
      />
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "oxygen_saturation" },
    });

    expect(
      screen.getByText(/No readings found for the selected filter/)
    ).toBeInTheDocument();
  });
});
