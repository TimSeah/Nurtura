// Data service for managing application data
// In a real application, this would connect to a backend API

import type { 
  CareRecipient, 
  VitalSignsData, 
  AppointmentData, 
  CareNoteData, 
  RecentActivity,
  Task,
  CareTeamMember,
  Resource,
  Alert
} from '../types';

// Mock data storage (in a real app, this would be API calls)
class DataService {
  // Care Recipients
  private careRecipients: CareRecipient[] = [
    {
      id: '1',
      name: 'Eleanor Johnson',
      age: 78,
      conditions: ['Hypertension', 'Diabetes'],
      emergencyContact: 'Michael Johnson - (555) 987-6543',
      primaryCaregiver: 'Sarah Johnson'
    },
    {
      id: '2',
      name: 'John Smith',
      age: 82,
      conditions: ['Heart Disease', 'Arthritis'],
      emergencyContact: 'Mary Smith - (555) 123-4567',
      primaryCaregiver: 'Sarah Johnson'
    },
    {
      id: '3',
      name: 'Mary Brown',
      age: 75,
      conditions: ['COPD', 'Osteoporosis'],
      emergencyContact: 'Robert Brown - (555) 789-0123',
      primaryCaregiver: 'Sarah Johnson'
    }
  ];

  // Vital Signs
  private vitalSigns: VitalSignsData[] = [
    {
      id: '1',
      recipientId: '1',
      vitalType: 'blood_pressure',
      value: '130/85',
      unit: 'mmHg',
      dateTime: '2025-06-26T08:00:00',
      notes: 'Taken after morning medication'
    },
    {
      id: '2',
      recipientId: '1',
      vitalType: 'heart_rate',
      value: '72',
      unit: 'bpm',
      dateTime: '2025-06-26T08:05:00'
    },
    {
      id: '3',
      recipientId: '1',
      vitalType: 'blood_sugar',
      value: '125',
      unit: 'mg/dL',
      dateTime: '2025-06-26T08:10:00',
      notes: 'Fasting glucose level'
    },
    {
      id: '4',
      recipientId: '1',
      vitalType: 'blood_pressure',
      value: '128/82',
      unit: 'mmHg',
      dateTime: '2025-06-25T08:00:00'
    },
    {
      id: '5',
      recipientId: '1',
      vitalType: 'heart_rate',
      value: '75',
      unit: 'bpm',
      dateTime: '2025-06-25T08:05:00'
    },
    {
      id: '6',
      recipientId: '1',
      vitalType: 'blood_pressure',
      value: '125/80',
      unit: 'mmHg',
      dateTime: '2025-06-24T08:00:00'
    },
    {
      id: '7',
      recipientId: '1',
      vitalType: 'heart_rate',
      value: '70',
      unit: 'bpm',
      dateTime: '2025-06-24T08:05:00'
    }
  ];

  // Appointments
  private appointments: AppointmentData[] = [
    {
      id: '1',
      recipientId: '2',
      title: 'Cardiology Follow-up',
      type: 'specialist',
      provider: 'Dr. Michael Chen - Cardiologist',
      location: 'Springfield Heart Center',
      dateTime: '2025-06-27T14:00:00',
      duration: '60',
      reminder: true,
      reminderTime: '60',
      status: 'scheduled'
    }
  ];

  // Care Notes
  private careNotes: CareNoteData[] = [
    {
      id: '1',
      recipientId: '1',
      category: 'general',
      title: 'Morning routine completed well',
      content: 'Eleanor was in good spirits this morning. Completed all daily activities independently.',
      priority: 'normal',
      tags: ['mood', 'routine'],
      dateTime: '2025-06-26T09:00:00',
      isPrivate: false,
      authorName: 'Sarah Johnson'
    }
  ];

  // Recent Activities
  private recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'medication',
      description: 'Blood pressure medication taken by Eleanor',
      time: '2 hours ago',
      priority: 'low',
      recipientName: 'Eleanor Johnson'
    },
    {
      id: '2',
      type: 'vital',
      description: 'Blood glucose reading recorded: 125 mg/dL',
      time: '4 hours ago',
      priority: 'medium',
      recipientName: 'Eleanor Johnson'
    }
  ];

  // Tasks
  private tasks: Task[] = [
    {
      id: '1',
      task: 'Give morning medication to Eleanor',
      time: '9:00 AM',
      priority: 'high',
      recipientName: 'Eleanor Johnson',
      category: 'medication',
      completed: false,
      dueDateTime: '2025-06-26T09:00:00'
    },
    {
      id: '2',
      task: 'Physical therapy session with John',
      time: '11:30 AM',
      priority: 'medium',
      recipientName: 'John Smith',
      category: 'appointment',
      completed: false,
      dueDateTime: '2025-06-26T11:30:00'
    }
  ];

  // Care Team Members
  private careTeamMembers: CareTeamMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Williams',
      role: 'Primary Care Physician',
      relationship: 'Professional',
      phone: '(555) 123-4567',
      email: 'swilliams@medicenter.com',
      address: '123 Medical Center Drive',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      specialties: ['General Medicine', 'Geriatrics'],
      emergencyContact: false
    },
    {
      id: '2',
      name: 'Michael Johnson',
      role: 'Son',
      relationship: 'Family',
      phone: '(555) 987-6543',
      email: 'mjohnson@email.com',
      availability: ['Saturday', 'Sunday', 'Evenings'],
      emergencyContact: true
    },
    {
      id: '3',
      name: 'Lisa Martinez',
      role: 'Home Health Aide',
      relationship: 'Professional',
      phone: '(555) 456-7890',
      email: 'lmartinez@homecare.com',
      availability: ['Monday', 'Wednesday', 'Friday'],
      specialties: ['Personal Care', 'Medication Management'],
      emergencyContact: false
    },
    {
      id: '4',
      name: 'Robert Chen',
      role: 'Neighbor/Friend',
      relationship: 'Community',
      phone: '(555) 321-0987',
      email: 'rchen@email.com',
      availability: ['Tuesday', 'Thursday', 'Weekends'],
      emergencyContact: true
    }
  ];

  // Resources
  private resources: Resource[] = [
    {
      id: '1',
      name: 'Mercy General Hospital',
      category: 'medical',
      description: 'Full-service hospital with emergency care and specialized geriatric services.',
      address: '1234 Hospital Drive, Springfield, IL 62701',
      phone: '(217) 555-0100',
      website: 'https://mercygeneral.org',
      hours: '24/7',
      rating: 4.5,
      distance: '2.3 miles',
      services: ['Emergency Care', 'Cardiology', 'Geriatrics', 'Physical Therapy'],
      verified: true
    },
    {
      id: '2',
      name: 'Senior Transportation Service',
      category: 'transportation',
      description: 'Door-to-door transportation for medical appointments and daily activities.',
      address: '567 Main Street, Springfield, IL 62701',
      phone: '(217) 555-0200',
      hours: 'Mon-Fri 7AM-7PM',
      rating: 4.2,
      distance: '1.8 miles',
      services: ['Medical Transport', 'Grocery Shopping', 'Social Outings'],
      verified: true
    },
    {
      id: '3',
      name: 'Springfield Senior Center',
      category: 'recreation',
      description: 'Community center offering meals, activities, and social programs for seniors.',
      address: '890 Community Lane, Springfield, IL 62701',
      phone: '(217) 555-0300',
      website: 'https://springfieldseniors.org',
      hours: 'Mon-Fri 8AM-5PM',
      rating: 4.7,
      distance: '3.1 miles',
      services: ['Meal Programs', 'Exercise Classes', 'Social Activities', 'Educational Programs'],
      verified: true
    },
    {
      id: '4',
      name: 'Caregiver Support Group',
      category: 'support',
      description: 'Weekly support meetings for family caregivers and professional support staff.',
      address: '123 Wellness Center, Springfield, IL 62701',
      phone: '(217) 555-0400',
      hours: 'Thursdays 7PM-8:30PM',
      rating: 4.8,
      distance: '1.5 miles',
      services: ['Support Groups', 'Educational Workshops', 'Respite Care Info'],
      verified: true
    },
    {
      id: '5',
      name: 'Area Agency on Aging',
      category: 'social',
      description: 'Government services including home care assistance, meal delivery, and benefits counseling.',
      address: '456 Government Plaza, Springfield, IL 62701',
      phone: '(217) 555-0500',
      website: 'https://springfieldaaa.gov',
      hours: 'Mon-Fri 8AM-4:30PM',
      rating: 4.0,
      distance: '2.7 miles',
      services: ['Home Care', 'Meal Delivery', 'Benefits Counseling', 'Case Management'],
      verified: true
    },
    {
      id: '6',
      name: 'Emergency Medical Services',
      category: 'emergency',
      description: '24/7 emergency medical response and ambulance services.',
      address: 'City-wide coverage',
      phone: '911',
      hours: '24/7',
      rating: 4.6,
      distance: 'City-wide',
      services: ['Emergency Response', 'Ambulance', 'Fire Department', 'Paramedics'],
      verified: true
    }
  ];

  // Alerts
  private alerts: Alert[] = [
    {
      id: '1',
      type: 'medication',
      title: 'Medication Reminder',
      description: 'Blood pressure medication due for Eleanor Johnson',
      priority: 'high',
      timestamp: '2025-06-26T09:00:00',
      isRead: false,
      actionRequired: true,
      recipient: 'Eleanor Johnson',
      recipientId: '1'
    },
    {
      id: '2',
      type: 'health',
      title: 'Vital Signs Alert',
      description: 'Blood pressure reading (145/95) is above normal range for John Smith',
      priority: 'critical',
      timestamp: '2025-06-26T08:30:00',
      isRead: false,
      actionRequired: true,
      recipient: 'John Smith',
      recipientId: '2'
    },
    {
      id: '3',
      type: 'appointment',
      title: 'Upcoming Appointment',
      description: 'Cardiology appointment tomorrow at 2:00 PM for John Smith',
      priority: 'medium',
      timestamp: '2025-06-26T07:00:00',
      isRead: true,
      actionRequired: false,
      recipient: 'John Smith',
      recipientId: '2'
    }
  ];

  // Care Recipients Methods
  getCareRecipients(): CareRecipient[] {
    return this.careRecipients;
  }

  getCareRecipient(id: string): CareRecipient | undefined {
    return this.careRecipients.find(recipient => recipient.id === id);
  }

  // Vital Signs Methods
  getVitalSigns(recipientId?: string): VitalSignsData[] {
    if (recipientId) {
      return this.vitalSigns.filter(vital => vital.recipientId === recipientId);
    }
    return this.vitalSigns;
  }

  addVitalSigns(data: VitalSignsData): VitalSignsData {
    const newVital = {
      ...data,
      id: Date.now().toString()
    };
    this.vitalSigns.push(newVital);
    return newVital;
  }

  // Appointments Methods
  getAppointments(recipientId?: string): AppointmentData[] {
    if (recipientId) {
      return this.appointments.filter(appointment => appointment.recipientId === recipientId);
    }
    return this.appointments;
  }

  addAppointment(data: AppointmentData): AppointmentData {
    const newAppointment = {
      ...data,
      id: Date.now().toString(),
      status: 'scheduled' as const
    };
    this.appointments.push(newAppointment);
    return newAppointment;
  }

  getUpcomingAppointments(limit?: number): AppointmentData[] {
    const now = new Date();
    const upcoming = this.appointments
      .filter(appointment => new Date(appointment.dateTime) > now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    
    return limit ? upcoming.slice(0, limit) : upcoming;
  }

  // Care Notes Methods
  getCareNotes(recipientId?: string): CareNoteData[] {
    if (recipientId) {
      return this.careNotes.filter(note => note.recipientId === recipientId);
    }
    return this.careNotes;
  }

  addCareNote(data: CareNoteData): CareNoteData {
    const newNote = {
      ...data,
      id: Date.now().toString(),
      authorName: 'Sarah Johnson' // In a real app, this would come from auth
    };
    this.careNotes.push(newNote);
    return newNote;
  }

  // Dashboard Data Methods
  getRecentActivities(limit: number = 10): RecentActivity[] {
    return this.recentActivities.slice(0, limit);
  }

  getTodaysTasks(): Task[] {
    const today = new Date().toDateString();
    return this.tasks.filter(task => 
      new Date(task.dueDateTime).toDateString() === today
    );
  }

  getDashboardStats() {
    const activeRecipients = this.careRecipients.length;
    const upcomingAppointments = this.getUpcomingAppointments().length;
    const incompleteTasks = this.tasks.filter(task => !task.completed).length;
    const urgentNotes = this.careNotes.filter(note => note.priority === 'urgent').length;

    return {
      activeRecipients,
      upcomingAppointments,
      incompleteTasks,
      urgentNotes
    };
  }

  // Task Management
  completeTask(taskId: string): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
      return true;
    }
    return false;
  }

  addTask(task: Omit<Task, 'id'>): Task {
    const newTask = {
      ...task,
      id: Date.now().toString()
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // Utility Methods
  searchCareRecipients(query: string): CareRecipient[] {
    const lowercaseQuery = query.toLowerCase();
    return this.careRecipients.filter(recipient =>
      recipient.name.toLowerCase().includes(lowercaseQuery) ||
      recipient.conditions.some(condition => 
        condition.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  getRecentVitalsForRecipient(recipientId: string, limit: number = 5): VitalSignsData[] {
    return this.vitalSigns
      .filter(vital => vital.recipientId === recipientId)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      .slice(0, limit);
  }

  // Care Team Methods
  getCareTeamMembers(): CareTeamMember[] {
    return this.careTeamMembers;
  }

  getCareTeamMember(id: string): CareTeamMember | undefined {
    return this.careTeamMembers.find(member => member.id === id);
  }

  addCareTeamMember(data: Omit<CareTeamMember, 'id'>): CareTeamMember {
    const newMember = {
      ...data,
      id: Date.now().toString()
    };
    this.careTeamMembers.push(newMember);
    return newMember;
  }

  updateCareTeamMember(id: string, data: Partial<CareTeamMember>): CareTeamMember | null {
    const memberIndex = this.careTeamMembers.findIndex(member => member.id === id);
    if (memberIndex !== -1) {
      this.careTeamMembers[memberIndex] = { ...this.careTeamMembers[memberIndex], ...data };
      return this.careTeamMembers[memberIndex];
    }
    return null;
  }

  removeCareTeamMember(id: string): boolean {
    const memberIndex = this.careTeamMembers.findIndex(member => member.id === id);
    if (memberIndex !== -1) {
      this.careTeamMembers.splice(memberIndex, 1);
      return true;
    }
    return false;
  }

  getEmergencyContacts(): CareTeamMember[] {
    return this.careTeamMembers.filter(member => member.emergencyContact);
  }

  getCareTeamByRelationship(relationship: CareTeamMember['relationship']): CareTeamMember[] {
    return this.careTeamMembers.filter(member => member.relationship === relationship);
  }

  // Resource Methods
  getResources(): Resource[] {
    return this.resources;
  }

  getResource(id: string): Resource | undefined {
    return this.resources.find(resource => resource.id === id);
  }

  getResourcesByCategory(category: Resource['category']): Resource[] {
    return this.resources.filter(resource => resource.category === category);
  }

  searchResources(query: string, category?: Resource['category']): Resource[] {
    let filteredResources = this.resources;
    
    if (category) {
      filteredResources = filteredResources.filter(resource => resource.category === category);
    }
    
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredResources = filteredResources.filter(resource =>
        resource.name.toLowerCase().includes(lowercaseQuery) ||
        resource.description.toLowerCase().includes(lowercaseQuery) ||
        resource.services.some(service => 
          service.toLowerCase().includes(lowercaseQuery)
        )
      );
    }
    
    return filteredResources;
  }

  addResource(data: Omit<Resource, 'id'>): Resource {
    const newResource = {
      ...data,
      id: Date.now().toString()
    };
    this.resources.push(newResource);
    return newResource;
  }

  // Alert Methods
  getAlerts(): Alert[] {
    return this.alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getUnreadAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.isRead);
  }

  getAlertsByType(type: Alert['type']): Alert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  getAlertsByPriority(priority: Alert['priority']): Alert[] {
    return this.alerts.filter(alert => alert.priority === priority);
  }

  markAlertAsRead(id: string): boolean {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.isRead = true;
      return true;
    }
    return false;
  }

  addAlert(data: Omit<Alert, 'id'>): Alert {
    const newAlert = {
      ...data,
      id: Date.now().toString()
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  removeAlert(id: string): boolean {
    const alertIndex = this.alerts.findIndex(alert => alert.id === id);
    if (alertIndex !== -1) {
      this.alerts.splice(alertIndex, 1);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;
