import React, { useState } from 'react';
import Modal from './Modal';
import { Save } from 'lucide-react';
import type { VitalSignsData } from '../types';

interface VitalSignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VitalSignsData) => void;
}

const VitalSignsModal: React.FC<VitalSignsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<VitalSignsData>({
    recipientId: '',
    vitalType: 'blood_pressure',
    value: '',
    unit: '',
    notes: '',
    dateTime: new Date().toISOString().slice(0, 16)
  });

  const careRecipients = [
    { id: '1', name: 'Eleanor Johnson' },
    { id: '2', name: 'John Smith' },
    { id: '3', name: 'Mary Brown' }
  ];

  const vitalTypes = [
    { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', placeholder: '120/80' },
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', placeholder: '72' },
    { value: 'temperature', label: 'Temperature', unit: '°F', placeholder: '98.6' },
    { value: 'weight', label: 'Weight', unit: 'lbs', placeholder: '150' },
    { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', placeholder: '120' },
    { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%', placeholder: '98' }
  ];

  const selectedVitalType = vitalTypes.find(type => type.value === formData.vitalType);

  const handleInputChange = (field: keyof VitalSignsData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'vitalType' ? { 
        unit: vitalTypes.find(type => type.value === value)?.unit || '',
        value: ''
      } : {})
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.recipientId && formData.value) {
      onSave({
        ...formData,
        unit: selectedVitalType?.unit || formData.unit
      });
      // Reset form
      setFormData({
        recipientId: '',
        vitalType: 'blood_pressure',
        value: '',
        unit: '',
        notes: '',
        dateTime: new Date().toISOString().slice(0, 16)
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Vital Signs" size="medium">
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
            <label>Vital Sign Type</label>
            <select 
              value={formData.vitalType}
              onChange={(e) => handleInputChange('vitalType', e.target.value)}
            >
              {vitalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Value</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder={selectedVitalType?.placeholder}
                required
              />
              <span style={{ color: '#64748b', fontSize: '0.875rem', minWidth: '40px' }}>
                {selectedVitalType?.unit}
              </span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => handleInputChange('dateTime', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional observations or context..."
            rows={3}
          />
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">
            <Save className="btn-icon" />
            Save Vital Signs
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VitalSignsModal;
