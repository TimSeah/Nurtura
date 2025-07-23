// API configuration and base functions
const API_BASE_URL = 'http://localhost:5000/api';


class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Events API
  async getEvents() {
    return this.request('/events');
  }

  async getTodaysEvents() {
    return this.request('/events/today');
  }

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: any) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async sendEventReminder(id: string) {
    return this.request(`/events/${id}/send-reminder`, {
      method: 'POST',
    });
  }

  // Vital Signs API
  async getVitalSigns(recipientId: string) {
    return this.request(`/vital-signs/${recipientId}`);
  }

  async getVitalSignsByType(recipientId: string, vitalType: string) {
    return this.request(`/vital-signs/${recipientId}/${vitalType}`);
  }

  async addVitalSigns(vitalData: any) {
    return this.request('/vital-signs', {
      method: 'POST',
      body: JSON.stringify(vitalData),
    });
  }

  async updateVitalSigns(id: string, vitalData: any) {
    return this.request(`/vital-signs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vitalData),
    });
  }

  async deleteVitalSigns(id: string) {
    return this.request(`/vital-signs/${id}`, {
      method: 'DELETE',
    });
  }

  // Care Recipients API
  async getCareRecipients() {
    return this.request('/care-recipients');
  }

  async getCareRecipient(id: string) {
    return this.request(`/care-recipients/${id}`);
  }

  async createCareRecipient(recipientData: any) {
    return this.request('/care-recipients', {
      method: 'POST',
      body: JSON.stringify(recipientData),
    });
  }

  async updateCareRecipient(id: string, recipientData: any) {
    return this.request(`/care-recipients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipientData),
    });
  }

  async addMedication(recipientId: string, medicationData: any) {
    return this.request(`/care-recipients/${recipientId}/medications`, {
      method: 'POST',
      body: JSON.stringify(medicationData),
    });
  }

  async updateMedication(recipientId: string, medicationId: string, medicationData: any) {
    return this.request(`/care-recipients/${recipientId}/medications/${medicationId}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData),
    });
  }

  async deleteMedication(recipientId: string, medicationId: string) {
    return this.request(`/care-recipients/${recipientId}/medications/${medicationId}`, {
      method: 'DELETE',
    });
  }

  async deleteCareRecipient(id: string) {
    return this.request(`/care-recipients/${id}`, {
      method: 'DELETE',
    });
  }

  // Alerts API
  async getAlerts(recipientId: string, filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/alerts/${recipientId}?${queryParams}` : `/alerts/${recipientId}`;
    return this.request(endpoint);
  }

  async getAlertStats(recipientId: string) {
    return this.request(`/alerts/${recipientId}/stats`);
  }

  async createAlert(alertData: any) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async markAlertAsRead(id: string) {
    return this.request(`/alerts/${id}/read`, {
      method: 'PATCH',
    });
  }

  async resolveAlert(id: string) {
    return this.request(`/alerts/${id}/resolve`, {
      method: 'PATCH',
    });
  }

  async deleteAlert(id: string) {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  async markAllAlertsAsRead(recipientId: string) {
    return this.request(`/alerts/${recipientId}/mark-all-read`, {
      method: 'PATCH',
    });
  }

  // User Settings API
  async getUserSettings(userId: string) {
    return this.request(`/user-settings/${userId}`);
  }

  async updateUserSettings(userId: string, settings: any) {
    return this.request(`/user-settings/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Forum/Threads API
  async getThreads() {
    return this.request('/threads');
  }

  async getThread(id: string) {
    return this.request(`/threads/${id}`);
  }

  async createThread(threadData: any) {
    return this.request('/threads', {
      method: 'POST',
      body: JSON.stringify(threadData),
    });
  }

  async getComments(threadId: string) {
    return this.request(`/threads/${threadId}/comments`);
  }

  async addComment(threadId: string, commentData: any) {
    return this.request(`/threads/${threadId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }
}

export const apiService = new ApiService();



