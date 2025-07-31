// import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TrendsCard from "../../src/pages/healthMonitoring/components/trendsCard/TrendsCard";
import "@testing-library/jest-dom";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Assign mock to global object
global.ResizeObserver = ResizeObserverMock;

const mockVitals = [
  {
    _id: "1",
    recipientId: "user123",
    vitalType: "heart_rate" as const,
    value: "85",
    unit: "bpm",
    dateTime: new Date().toISOString(),
  },
  {
    _id: "2",
    recipientId: "user123",
    vitalType: "blood_pressure" as const,
    value: "120/80",
    unit: "mmHg",
    dateTime: new Date().toISOString(),
  },
];

describe("TrendsCard", () => {
  test("displays empty message when no readings are available", () => {
    render(<TrendsCard vitalReadings={[]} />);
    expect(
      screen.getByText(/no vital readings available/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add some readings to see trend charts/i)
    ).toBeInTheDocument();
  });

  test("renders correctly with heart rate data", () => {
    render(<TrendsCard vitalReadings={[mockVitals[0]]} />);

    // Use a more specific matcher for the card title
    expect(
      screen.getByRole("heading", {
        name: /heart rate trend/i,
        level: 2,
      })
    ).toBeInTheDocument();
  });

  test("renders dropdown with available vital types", () => {
    render(<TrendsCard vitalReadings={mockVitals} />);
    const dropdown = screen.getByRole("combobox");
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveValue("blood_pressure");
    fireEvent.change(dropdown, { target: { value: "heart_rate" } });
    expect(dropdown).toHaveValue("heart_rate");
  });

  test("dropdown does NOT display non-existent data", () => {
    const data = [
      { ...mockVitals[0], vitalType: "heart_rate" as const },
      { ...mockVitals[1], vitalType: "blood_pressure" as const },
    ];
    render(<TrendsCard vitalReadings={data} />);

    // Get all options in the dropdown
    const options = screen.getAllByRole("option");
    const optionValues = options.map((option) => option.getAttribute("value"));

    // Check that only available types are present
    expect(optionValues).toContain("heart_rate");
    expect(optionValues).toContain("blood_pressure");

    // Check that unavailable types are NOT present
    expect(optionValues).not.toContain("weight");
    expect(optionValues).not.toContain("temperature");
    expect(optionValues).not.toContain("blood_sugar");
    expect(optionValues).not.toContain("oxygen_saturation");
  });
});
