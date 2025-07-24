import { useAuth } from "@clerk/clerk-react";
import { apiService } from "../services/apiService";

type AnyFn = (...args: any[]) => Promise<any>;

function wrapWithToken<T extends AnyFn>(
  fn: T,
  getToken: () => Promise<string | null>
) {
  return async (...args: Parameters<T>) => {
    const token = await getToken();
    return fn(...args, token || undefined);
  };
}

export function useApi() {
  const { getToken } = useAuth();

  return {
    // Events
    getEvents: wrapWithToken(apiService.getEvents.bind(apiService), getToken),
    getTodaysEvents: wrapWithToken(apiService.getTodaysEvents.bind(apiService), getToken),
    createEvent: wrapWithToken(apiService.createEvent.bind(apiService), getToken),
    updateEvent: wrapWithToken(apiService.updateEvent.bind(apiService), getToken),
    deleteEvent: wrapWithToken(apiService.deleteEvent.bind(apiService), getToken),
    sendEventReminder: wrapWithToken(apiService.sendEventReminder.bind(apiService), getToken),

    // Vital Signs
    getVitalSigns: wrapWithToken(apiService.getVitalSigns.bind(apiService), getToken),
    getVitalSignsByType: wrapWithToken(apiService.getVitalSignsByType.bind(apiService), getToken),
    addVitalSigns: wrapWithToken(apiService.addVitalSigns.bind(apiService), getToken),
    updateVitalSigns: wrapWithToken(apiService.updateVitalSigns.bind(apiService), getToken),
    deleteVitalSigns: wrapWithToken(apiService.deleteVitalSigns.bind(apiService), getToken),

    // Care Recipients
    getCareRecipients: wrapWithToken(apiService.getCareRecipients.bind(apiService), getToken),
    getCareRecipient: wrapWithToken(apiService.getCareRecipient.bind(apiService), getToken),
    createCareRecipient: wrapWithToken(apiService.createCareRecipient.bind(apiService), getToken),
    updateCareRecipient: wrapWithToken(apiService.updateCareRecipient.bind(apiService), getToken),
    addMedication: wrapWithToken(apiService.addMedication.bind(apiService), getToken),
    updateMedication: wrapWithToken(apiService.updateMedication.bind(apiService), getToken),
    deleteMedication: wrapWithToken(apiService.deleteMedication.bind(apiService), getToken),
    deleteCareRecipient: wrapWithToken(apiService.deleteCareRecipient.bind(apiService), getToken),

    // Alerts
    getAlerts: wrapWithToken(apiService.getAlerts.bind(apiService), getToken),
    getAlertStats: wrapWithToken(apiService.getAlertStats.bind(apiService), getToken),
    createAlert: wrapWithToken(apiService.createAlert.bind(apiService), getToken),
    markAlertAsRead: wrapWithToken(apiService.markAlertAsRead.bind(apiService), getToken),
    resolveAlert: wrapWithToken(apiService.resolveAlert.bind(apiService), getToken),
    deleteAlert: wrapWithToken(apiService.deleteAlert.bind(apiService), getToken),
    markAllAlertsAsRead: wrapWithToken(apiService.markAllAlertsAsRead.bind(apiService), getToken),

    // User Settings
    getUserSettings: wrapWithToken(apiService.getUserSettings.bind(apiService), getToken),
    updateUserSettings: wrapWithToken(apiService.updateUserSettings.bind(apiService), getToken),

    // Forum / Threads
    getThreads: wrapWithToken(apiService.getThreads.bind(apiService), getToken),
    getThread: wrapWithToken(apiService.getThread.bind(apiService), getToken),
    createThread: wrapWithToken(apiService.createThread.bind(apiService), getToken),
    getComments: wrapWithToken(apiService.getComments.bind(apiService), getToken),
    addComment: wrapWithToken(apiService.addComment.bind(apiService), getToken),
  };
}
