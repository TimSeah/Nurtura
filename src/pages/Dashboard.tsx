import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  Users,
  AlertTriangle,
  Heart,
  Clock,
  TrendingUp,
  Bell,
} from "lucide-react";
import "./Dashboard.css";
import VitalSignsModal from "../components/VitalSignsModal";
import AppointmentModal from "../components/AppointmentModal";
import CareNoteModal from "../components/CareNoteModal";
import { apiService } from "../services/apiService";
import type { VitalSignsData, AppointmentData, CareNoteData } from "../types";

interface Event {
  title: string;
  startTime: string;
  remark: string;
}

interface DashboardStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

interface RecentActivity {
  id: string;
  type: "medication" | "appointment" | "vital" | "care";
  description: string;
  time: string;
  priority?: "low" | "medium" | "high";
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCareNoteModal, setShowCareNoteModal] = useState(false);

  const handleVitalSignsSave = (data: VitalSignsData) => {
    console.log("Vital signs saved:", data);
    // In a real app, this would save to backend/state management
  };

  const handleAppointmentSave = (data: AppointmentData) => {
    console.log("Appointment saved:", data);
    // In a real app, this would save to backend/state management
  };

  const handleCareNoteSave = (data: CareNoteData) => {
    console.log("Care note saved:", data);
    // In a real app, this would save to backend/state management
  };

  const handleViewAllAlerts = () => {
    navigate("/alerts");
  };
  const stats: DashboardStat[] = [
    {
      label: "Active Care Recipients",
      value: "3",
      icon: Users,
      color: "#0f766e",
      trend: "+1 this month",
    },
    {
      label: "Upcoming Appointments",
      value: "7",
      icon: Calendar,
      color: "#7c3aed",
      trend: "2 this week",
    },
    {
      label: "Health Alerts",
      value: "2",
      icon: AlertTriangle,
      color: "#dc2626",
      trend: "Requires attention",
    },
    {
      label: "Medications Due",
      value: "4",
      icon: Heart,
      color: "#ea580c",
      trend: "Today",
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "medication",
      description: "Blood pressure medication taken by Eleanor",
      time: "2 hours ago",
      priority: "low",
    },
    {
      id: "2",
      type: "vital",
      description: "Blood glucose reading recorded: 125 mg/dL",
      time: "4 hours ago",
      priority: "medium",
    },
    {
      id: "3",
      type: "appointment",
      description: "Cardiology appointment scheduled for John",
      time: "6 hours ago",
      priority: "high",
    },
    {
      id: "4",
      type: "care",
      description: "Daily care routine completed for Mary",
      time: "8 hours ago",
      priority: "low",
    },
  ];

  const [todayEvents, setTodayEvents] = useState<Event[]>([]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "medication":
        return Heart;
      case "appointment":
        return Calendar;
      case "vital":
        return Activity;
      case "care":
        return Users;
      default:
        return Bell;
    }
  };

  const getStatIconClass = (color: string) => {
    switch (color) {
      case "#0f766e":
        return "stat-icon--teal";
      case "#7c3aed":
        return "stat-icon--purple";
      case "#dc2626":
        return "stat-icon--red";
      case "#ea580c":
        return "stat-icon--orange";
      default:
        return "stat-icon--teal";
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch today's events
        const eventsData = await apiService.getTodaysEvents();
        setTodayEvents(eventsData);

        // Load other dashboard data
        loadStats();
        loadRecentActivities();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const loadStats = async () => {
    try {
      // You can enhance this to fetch real stats from backend
      // For now, keeping the mock data structure
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // You can enhance this to fetch real activities from backend
      // For now, keeping the mock data structure
    } catch (error) {
      console.error("Error loading recent activities:", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, Sarah</h1>
        <p>Here's what's happening with your care recipients today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${getStatIconClass(stat.color)}`}>
                <Icon />
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
                {stat.trend && <p className="stat-trend">{stat.trend}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        {/* Today's Tasks */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Clock className="title-icon" />
              Today's Tasks
            </h2>
          </div>
          <div className="task-list">
            {todayEvents.length === 0 ? (
              <h3 className="no-events-today">
                No events for today. Have a wonderful day ahead!
              </h3>
            ) : (
              <>
                {todayEvents.map((event) => (
                  <div key={event.title} className="task-item">
                    <div className="task-content">
                      <h4>{event.title}</h4>
                      <p className="task-time">{event.startTime}</p>
                      <p className="task-remark">{event.remark}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <TrendingUp className="title-icon" />
              Recent Activity
            </h2>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <Icon />
                  </div>
                  <div className="activity-content">
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <div
                    className={`activity-priority ${getPriorityClass(
                      activity.priority
                    )}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowVitalSignsModal(true)}
          >
            <Heart className="btn-icon" />
            Record Vital Signs
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowAppointmentModal(true)}
          >
            <Calendar className="btn-icon" />
            Schedule Appointment
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCareNoteModal(true)}
          >
            <Users className="btn-icon" />
            Add Care Note
          </button>
          <button className="btn btn-secondary" onClick={handleViewAllAlerts}>
            <Bell className="btn-icon" />
            View All Alerts
          </button>
        </div>
      </div>

      {/* Modals */}
      <VitalSignsModal
        isOpen={showVitalSignsModal}
        onClose={() => setShowVitalSignsModal(false)}
        onSave={handleVitalSignsSave}
      />

      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSave={handleAppointmentSave}
      />

      <CareNoteModal
        isOpen={showCareNoteModal}
        onClose={() => setShowCareNoteModal(false)}
        onSave={handleCareNoteSave}
      />
    </div>
  );
};

export default Dashboard;
