import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Save, Info } from 'lucide-react';
import type { VitalSignsData } from '../types';
import { apiService } from '../services/apiService';
import './VitalSignsModal.css';

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

  const [careRecipients, setCareRecipients] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCareRecipients();
    }
  }, [isOpen]);

  const loadCareRecipients = async () => {
    try {
      setLoading(true);
      const recipients = await apiService.getCareRecipients();
      setCareRecipients(recipients.map((r: any) => ({ id: r._id, name: r.name })));
    } catch (error) {
      console.error('Error loading care recipients:', error);
      // Fallback to mock data if API fails
      setCareRecipients([
        { id: '1', name: 'Eleanor Johnson' },
        { id: '2', name: 'John Smith' },
        { id: '3', name: 'Mary Brown' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const vitalTypes = [
    { 
      value: 'blood_pressure', 
      label: 'Blood Pressure', 
      unit: 'mmHg', 
      placeholder: '120/80',
      hint: 'Sit comfortably for 5 minutes before taking. Place cuff on upper arm at heart level. Record as systolic/diastolic (e.g., 120/80).',
      normalRange: 'Normal: Less than 120/80 mmHg'
    },
    { 
      value: 'heart_rate', 
      label: 'Heart Rate', 
      unit: 'bpm', 
      placeholder: '72',
      hint: 'Rest for 5 minutes before measuring. Place two fingers on wrist pulse point. Count beats for 60 seconds or use a heart rate monitor.',
      normalRange: 'Normal: 60-100 beats per minute'
    },
    { 
      value: 'temperature', 
      label: 'Temperature', 
      unit: '°F', 
      placeholder: '98.6',
      hint: 'Wait 30 minutes after eating/drinking hot/cold items. Place thermometer under tongue for oral reading or follow device instructions.',
      normalRange: 'Normal: 97.8°F - 99.1°F (36.5°C - 37.3°C)'
    },
    { 
      value: 'weight', 
      label: 'Weight', 
      unit: 'lbs', 
      placeholder: '150',
      hint: 'Weigh at the same time each day, preferably in the morning after using the bathroom. Use the same scale on a hard, flat surface.',
      normalRange: 'Track changes over time rather than single readings'
    },
    { 
      value: 'blood_sugar', 
      label: 'Blood Sugar', 
      unit: 'mg/dL', 
      placeholder: '120',
      hint: 'Wash hands thoroughly. Use fresh lancet and test strip. Follow your glucose meter instructions. Record timing (fasting, before/after meals).',
      normalRange: 'Fasting: 80-100 mg/dL | After meals: Less than 140 mg/dL'
    },
    { 
      value: 'oxygen_saturation', 
      label: 'Oxygen Saturation', 
      unit: '%', 
      placeholder: '98',
      hint: 'Ensure finger is clean and warm. Remove nail polish if present. Place pulse oximeter on fingertip and wait for stable reading.',
      normalRange: 'Normal: 95-100%'
    }
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

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      recipientId: '',
      vitalType: 'blood_pressure',
      value: '',
      unit: '',
      notes: '',
      dateTime: new Date().toISOString().slice(0, 16)
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Record Vital Signs" size="medium">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Care Recipient</label>
            <select 
              value={formData.recipientId}
              onChange={(e) => handleInputChange('recipientId', e.target.value)}
              required
              disabled={loading}
            >
              <option value="">{loading ? 'Loading recipients...' : 'Select recipient'}</option>
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
            <div className="vital-input-container">
              <input
                type="text"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder={selectedVitalType?.placeholder}
                required
              />
              <span className="vital-unit-label">
                {selectedVitalType?.unit}
              </span>
            </div>
            {selectedVitalType?.hint && (
              <div className="vital-hint">
                <Info className="hint-icon" />
                <div className="hint-content">
                  <p className="hint-text">{selectedVitalType.hint}</p>
                  <p className="normal-range">📊 {selectedVitalType.normalRange}</p>
                </div>
              </div>
            )}
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
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VitalSignsModal;
