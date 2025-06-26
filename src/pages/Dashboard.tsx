import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Heart, 
  Clock,
  TrendingUp,
  Bell
} from 'lucide-react';
import './Dashboard.css';
import VitalSignsModal from '../components/VitalSignsModal';
import AppointmentModal from '../components/AppointmentModal';
import CareNoteModal from '../components/CareNoteModal';
import type { VitalSignsData, AppointmentData, CareNoteData } from '../types';

interface DashboardStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

interface RecentActivity {
  id: string;
  type: 'medication' | 'appointment' | 'vital' | 'care';
  description: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCareNoteModal, setShowCareNoteModal] = useState(false);

  const handleVitalSignsSave = (data: VitalSignsData) => {
    console.log('Vital signs saved:', data);
    // In a real app, this would save to backend/state management
  };

  const handleAppointmentSave = (data: AppointmentData) => {
    console.log('Appointment saved:', data);
    // In a real app, this would save to backend/state management
  };

  const handleCareNoteSave = (data: CareNoteData) => {
    console.log('Care note saved:', data);
    // In a real app, this would save to backend/state management
  };

  const handleViewAllAlerts = () => {
    navigate('/alerts');
  };
  const stats: DashboardStat[] = [
    {
      label: 'Active Care Recipients',
      value: '3',
      icon: Users,
      color: '#0f766e',
      trend: '+1 this month'
    },
    {
      label: 'Upcoming Appointments',
      value: '7',
      icon: Calendar,
      color: '#7c3aed',
      trend: '2 this week'
    },
    {
      label: 'Health Alerts',
      value: '2',
      icon: AlertTriangle,
      color: '#dc2626',
      trend: 'Requires attention'
    },
    {
      label: 'Medications Due',
      value: '4',
      icon: Heart,
      color: '#ea580c',
      trend: 'Today'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'medication',
      description: 'Blood pressure medication taken by Eleanor',
      time: '2 hours ago',
      priority: 'low'
    },
    {
      id: '2',
      type: 'vital',
      description: 'Blood glucose reading recorded: 125 mg/dL',
      time: '4 hours ago',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'appointment',
      description: 'Cardiology appointment scheduled for John',
      time: '6 hours ago',
      priority: 'high'
    },
    {
      id: '4',
      type: 'care',
      description: 'Daily care routine completed for Mary',
      time: '8 hours ago',
      priority: 'low'
    }
  ];

  const upcomingTasks = [
    { id: '1', task: 'Give morning medication to Eleanor', time: '9:00 AM', priority: 'high' },
    { id: '2', task: 'Physical therapy session with John', time: '11:30 AM', priority: 'medium' },
    { id: '3', task: 'Doctor follow-up call for Mary', time: '2:00 PM', priority: 'high' },
    { id: '4', task: 'Weekly grocery shopping', time: '4:00 PM', priority: 'low' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'medication': return Heart;
      case 'appointment': return Calendar;
      case 'vital': return Activity;
      case 'care': return Users;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#16a34a';
      default: return '#64748b';
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
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
                <Icon style={{ color: stat.color }} />
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
            {upcomingTasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-content">
                  <h4>{task.task}</h4>
                  <p className="task-time">{task.time}</p>
                </div>
                <div 
                  className="task-priority" 
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                />
              </div>
            ))}
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
                    className="activity-priority"
                    style={{ backgroundColor: getPriorityColor(activity.priority) }}
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
          <button 
            className="btn btn-secondary"
            onClick={handleViewAllAlerts}
          >
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
