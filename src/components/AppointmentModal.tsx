import React, { useState } from 'react';
import Modal from './Modal';
import { Save } from 'lucide-react';
import type { AppointmentData } from '../types';
import './AppointmentModal.css';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AppointmentData) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<AppointmentData>({
    recipientId: '',
    title: '',
    type: 'medical',
    provider: '',
    location: '',
    dateTime: '',
    duration: '60',
    notes: '',
    reminder: true,
    reminderTime: '60'
  });

  const careRecipients = [
    { id: '1', name: 'Eleanor Johnson' },
    { id: '2', name: 'John Smith' },
    { id: '3', name: 'Mary Brown' }
  ];

  const appointmentTypes = [
    { value: 'medical', label: 'Medical Checkup' },
    { value: 'dental', label: 'Dental' },
    { value: 'vision', label: 'Vision/Eye Care' },
    { value: 'specialist', label: 'Specialist Consultation' },
    { value: 'therapy', label: 'Physical Therapy' },
    { value: 'lab', label: 'Lab Work' },
    { value: 'imaging', label: 'Imaging (X-ray, MRI, etc.)' },
    { value: 'other', label: 'Other' }
  ];

  const commonProviders = [
    'Dr. Sarah Williams - Primary Care',
    'Dr. Michael Chen - Cardiologist',
    'Dr. Lisa Rodriguez - Dentist',
    'Springfield Eye Center',
    'City Physical Therapy',
    'Memorial Hospital Lab'
  ];

  const handleInputChange = (field: keyof AppointmentData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.recipientId && formData.title && formData.dateTime) {
      onSave(formData);
      // Reset form
      setFormData({
        recipientId: '',
        title: '',
        type: 'medical',
        provider: '',
        location: '',
        dateTime: '',
        duration: '60',
        notes: '',
        reminder: true,
        reminderTime: '60'
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Appointment" size="large">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Care Recipient</label>
            <select 
              value={formData.recipientId}
              onChange={(e) => handleInputChange('recipientId', e.target.value)}
              required
            >
              <option value="">Select recipient</option>
              {careRecipients.map(recipient => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Appointment Type</label>
            <select 
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              {appointmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Appointment Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Annual Physical Exam, Cardiology Follow-up"
            required
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Healthcare Provider</label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => handleInputChange('provider', e.target.value)}
              placeholder="Doctor or clinic name"
              list="providers-list"
            />
            <datalist id="providers-list">
              {commonProviders.map((provider, index) => (
                <option key={index} value={provider} />
              ))}
            </datalist>
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Address or facility name"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => handleInputChange('dateTime', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Duration (minutes)</label>
            <select 
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes, special instructions, or preparation requirements..."
            rows={3}
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.reminder}
                onChange={(e) => handleInputChange('reminder', e.target.checked)}
              />
              Set reminder
            </label>
          </div>
          
          {formData.reminder && (
            <div className="form-group">
              <label>Reminder time (minutes before)</label>
              <select 
                value={formData.reminderTime}
                onChange={(e) => handleInputChange('reminderTime', e.target.value)}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="1440">1 day</option>
              </select>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">
            <Save className="btn-icon" />
            Schedule Appointment
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;
