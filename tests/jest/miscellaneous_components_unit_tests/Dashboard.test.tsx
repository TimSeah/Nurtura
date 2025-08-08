import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../../src/pages/dashboard/Dashboard";
import { AuthContext } from "../../../src/contexts/AuthContext";
import { apiService } from "../../../src/services/apiService";
import "@testing-library/jest-dom";

// Mock API service
jest.mock("../../../src/services/apiService", () => ({
  apiService: {
    getTodaysEvents: jest.fn(),
    addVitalSigns: jest.fn(),
    getRecentVitalSigns: jest.fn(),
  },
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Activity: () => <div>ActivityIcon</div>,
  Calendar: () => <div>CalendarIcon</div>,
  Users: () => <div>UsersIcon</div>,
  BookPlus: () => <div>BookPlusIcon</div>,
  Heart: () => <div>HeartIcon</div>,
  Clock: () => <div>ClockIcon</div>,
  TrendingUp: () => <div>TrendingUpIcon</div>,
  Bell: () => <div>BellIcon</div>,
}));

// Mock images
jest.mock("./components/pics/koala.png", () => "koala.png");

describe("Dashboard Component", () => {
  const mockUser = {
    username: "JohnDoe",
    userId: "123",
    token: "test-token",
  };

  const mockAuthContext = {
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
  };

  const mockEvents = [
    {
      title: "Doctor Appointment",
      startTime: "10:00 AM",
      remark: "Annual checkup",
    },
    {
      title: "Medication Reminder",
      startTime: "02:30 PM",
      remark: "Take blood pressure pills",
    },
  ];

  const mockRecentActivities = [
    {
      id: "1",
      _id: "1",
      recipientName: "Eleanor",
      vitalType: "medication",
      value: "Blood pressure medication",
      unit: "",
      recordedAt: new Date().toISOString(),
      description: "Blood pressure medication taken by Eleanor",
      priority: "medium",
      time: "2 hours ago",
    },
    {
      id: "2",
      _id: "2",
      recipientName: "John",
      vitalType: "blood_glucose",
      value: "125",
      unit: "mg/dL",
      recordedAt: new Date().toISOString(),
      description: "Blood glucose reading recorded: 125 mg/dL",
      priority: "low",
      time: "1 hour ago",
    },
    {
      id: "3",
      _id: "3",
      recipientName: "John",
      vitalType: "appointment",
      value: "Cardiology appointment",
      unit: "",
      recordedAt: new Date().toISOString(),
      description: "Cardiology appointment scheduled for John",
      priority: "high",
      time: "30 minutes ago",
    },
  ];

  const renderDashboard = async () => {
    const completeMockAuthContext = {
      ...mockAuthContext,
      loading: false, // Add the missing property
      refreshToken: jest.fn(), // Add other required properties if any
    };
    await act(async () => {
      render(
        <MemoryRouter>
          <AuthContext.Provider value={completeMockAuthContext}>
            <Dashboard />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    });
  };

  beforeEach(() => {
    (apiService.getTodaysEvents as jest.Mock).mockReset();
    (apiService.addVitalSigns as jest.Mock).mockReset();
    (apiService.getRecentVitalSigns as jest.Mock).mockReset();

    // Default mocks to prevent errors
    (apiService.getTodaysEvents as jest.Mock).mockResolvedValue([]);
    (apiService.getRecentVitalSigns as jest.Mock).mockResolvedValue([]);
  });

  test("renders welcome message with username", async () => {
    await renderDashboard();
    expect(
      screen.getByText((content) => content.includes("Welcome back,"))
    ).toBeInTheDocument();
  });

  test("displays all dashboard stats cards", async () => {
    await renderDashboard();

    expect(screen.getByText("Monitor Recipients")).toBeInTheDocument();
    expect(screen.getByText("View Calendar")).toBeInTheDocument();
    expect(screen.getByText("Ask in Forum")).toBeInTheDocument();
    expect(screen.getByText("See Caregiver Resources")).toBeInTheDocument();

    // Verify icons
    expect(screen.getAllByText("ActivityIcon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CalendarIcon").length).toBeGreaterThan(0);
  });

  test("displays no events message when there are no tasks", async () => {
    (apiService.getTodaysEvents as jest.Mock).mockResolvedValue([]);
    await renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText("Nothing for today. Have a wonderful day ahead!")
      ).toBeInTheDocument();
    });
  });

  test("displays today's tasks when events exist", async () => {
    (apiService.getTodaysEvents as jest.Mock).mockResolvedValue(mockEvents);
    await renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
      expect(screen.getByText("10:00 AM")).toBeInTheDocument();
      expect(screen.getByText("Annual checkup")).toBeInTheDocument();

      expect(screen.getByText("Medication Reminder")).toBeInTheDocument();
      expect(screen.getByText("02:30 PM")).toBeInTheDocument();
    });
  });

  test("displays recent activities", async () => {
    (apiService.getTodaysEvents as jest.Mock).mockResolvedValue([]);
    (apiService.getRecentVitalSigns as jest.Mock).mockResolvedValue(
      mockRecentActivities
    );

    await renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText("Blood pressure medication taken by Eleanor")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Blood glucose reading recorded: 125 mg/dL")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Cardiology appointment scheduled for John")
      ).toBeInTheDocument();
    });
  });

  test("handles API errors gracefully", async () => {
    (apiService.getTodaysEvents as jest.Mock).mockRejectedValue(
      new Error("API Error")
    );

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    await renderDashboard();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching dashboard data:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("navigates to correct routes from stats cards", async () => {
    await renderDashboard();

    const healthLink = screen
      .getByText("Monitor Recipients")
      .closest("a") as HTMLAnchorElement;
    const calendarLink = screen
      .getByText("View Calendar")
      .closest("a") as HTMLAnchorElement;

    expect(healthLink?.href).toContain("/health");
    expect(calendarLink?.href).toContain("/calendar");
  });

  test("displays priority indicators for activities", async () => {
    (apiService.getTodaysEvents as jest.Mock).mockResolvedValue([]);
    (apiService.getRecentVitalSigns as jest.Mock).mockResolvedValue(
      mockRecentActivities
    );

    await renderDashboard();

    await waitFor(() => {
      const highPriority = screen
        .getByText("Cardiology appointment scheduled for John")
        .closest(".activity-item")
        ?.querySelector(".activity-priority");

      expect(highPriority).toHaveClass("priority-high");
    });
  });
});
