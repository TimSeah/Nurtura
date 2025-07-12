// API Types for the backend
export interface AppointmentResponse {
  id: string;
  caregiverName: string;
  caregiverEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  notes: string;
  reminderSent: boolean;
  createdAt: string;
}

export interface ApiResponse {
  message: string;
  appointment?: AppointmentResponse;
}

export interface EmailJSResponse {
  status: number;
  text: string;
}
