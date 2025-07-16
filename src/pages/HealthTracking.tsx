import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Heart, Activity, Thermometer, Scale, Plus, TrendingUp, Droplets } from 'lucide-react';
import type { CareRecipient, VitalSignsData } from '../types';
import { dataService } from '../services/dataService';
import Modal from '../components/Modal';
import './HealthTracking.css';

const HealthTracking: React.FC = () => {
  const [selectedRecipient, setSelectedRecipient] = useState<string>('1');
  const [selectedVitalType, setSelectedVitalType] = useState<string>('blood_pressure');
  const [showAddForm, setShowAddForm] = useState(false);
  const [careRecipients, setCareRecipients] = useState<CareRecipient[]>([]);
  const [vitalReadings, setVitalReadings] = useState<VitalSignsData[]>([]);
  const [newVitalForm, setNewVitalForm] = useState({
    value: '',
    dateTime: '',
    notes: ''
  });

  useEffect(() => {
    // Load data from service
    setCareRecipients(dataService.getCareRecipients());
    setVitalReadings(dataService.getVitalSigns(selectedRecipient));
  }, [selectedRecipient]);

  const handleRecipientChange = (recipientId: string) => {
    setSelectedRecipient(recipientId);
    setVitalReadings(dataService.getVitalSigns(recipientId));
  };

  const handleAddVital = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vitalData: VitalSignsData = {
      recipientId: selectedRecipient,
      vitalType: selectedVitalType as VitalSignsData['vitalType'],
      value: newVitalForm.value,
      unit: getVitalUnit(selectedVitalType),
      dateTime: newVitalForm.dateTime,
      notes: newVitalForm.notes || undefined
    };

    const savedVital = dataService.addVitalSigns(vitalData);
    setVitalReadings(prev => [savedVital, ...prev]);
    
    // Reset form
    setNewVitalForm({ value: '', dateTime: '', notes: '' });
    setShowAddForm(false);
  };

  // Generate chart data from actual readings
  const getChartData = (vitalType: VitalSignsData['vitalType']) => {
    const relevantReadings = vitalReadings
      .filter(reading => reading.vitalType === vitalType)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(-7); // Last 7 readings

    return relevantReadings.map(reading => {
      const date = new Date(reading.dateTime);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      if (vitalType === 'blood_pressure') {
        const [systolic, diastolic] = reading.value.split('/').map(v => parseInt(v.trim()));
        return { date: dateStr, systolic: systolic || 0, diastolic: diastolic || 0 };
      } else if (vitalType === 'heart_rate') {
        return { date: dateStr, rate: parseInt(reading.value) || 0 };
      }
      
      return { date: dateStr, value: parseFloat(reading.value) || 0 };
    });
  };

  const bloodPressureData = getChartData('blood_pressure');
  const heartRateData = getChartData('heart_rate');

  const getVitalIcon = (type: VitalSignsData['vitalType']) => {
    switch (type) {
      case 'blood_pressure': return Heart;
      case 'heart_rate': return Activity;
      case 'temperature': return Thermometer;
      case 'weight': return Scale;
      case 'blood_sugar': return Droplets;
      case 'oxygen_saturation': return Activity;
      default: return Heart;
    }
  };

  const getVitalUnit = (type: string) => {
    switch (type) {
      case 'blood_pressure': return 'mmHg';
      case 'heart_rate': return 'bpm';
      case 'temperature': return '°F';
      case 'weight': return 'lbs';
      case 'blood_sugar': return 'mg/dL';
      case 'oxygen_saturation': return '%';
      default: return '';
    }
  };

  const getVitalDisplayName = (type: VitalSignsData['vitalType']) => {
    switch (type) {
      case 'blood_pressure': return 'Blood Pressure';
      case 'heart_rate': return 'Heart Rate';
      case 'temperature': return 'Temperature';
      case 'weight': return 'Weight';
      case 'blood_sugar': return 'Blood Sugar';
      case 'oxygen_saturation': return 'Oxygen Saturation';
      default: return type;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const selectedRecipientData = careRecipients.find(r => r.id === selectedRecipient);

  return (
    <div className="health-tracking">
      <div className="page-header">
        <h1>Health Tracking</h1>
        <p>Monitor and track vital signs and health metrics for your care recipients.</p>
      </div>

      {/* Care Recipient Selector */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Select Care Recipient</h2>
        </div>
        <div className="recipient-selector">
          {careRecipients.map(recipient => (
            <button
              key={recipient.id}
              className={`recipient-card ${selectedRecipient === recipient.id ? 'selected' : ''}`}
              onClick={() => handleRecipientChange(recipient.id)}
            >
              <div className="recipient-info">
                <h3>{recipient.name}</h3>
                <p>Age: {recipient.age}</p>
                <div className="conditions">
                  {recipient.conditions.map(condition => (
                    <span key={condition} className="condition-tag">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedRecipientData && (
        <>
          {/* Recent Readings */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Readings - {selectedRecipientData.name}</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="btn-icon" />
                Add Reading
              </button>
            </div>
            <div className="readings-grid">
              {vitalReadings.map(reading => {
                const Icon = getVitalIcon(reading.vitalType);
                const { date, time } = formatDateTime(reading.dateTime);
                return (
                  <div key={reading.id} className="reading-card">
                    <div className="reading-icon">
                      <Icon />
                    </div>
                    <div className="reading-content">
                      <h4>{getVitalDisplayName(reading.vitalType)}</h4>
                      <p className="reading-value">
                        {reading.value} {reading.unit}
                      </p>
                      <p className="reading-time">
                        {date} at {time}
                      </p>
                      {reading.notes && (
                        <p className="reading-notes">{reading.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <TrendingUp className="title-icon" />
                  Blood Pressure Trend
                </h2>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bloodPressureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      name="Systolic"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#0f766e" 
                      strokeWidth={2}
                      name="Diastolic"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Activity className="title-icon" />
                  Heart Rate Trend
                </h2>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={heartRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Reading Modal */}
      <Modal 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Vital Reading"
        size="medium"
      >
        <form className="vital-form" onSubmit={handleAddVital}>
          <div className="form-group">
            <label>Vital Type</label>
            <select 
              value={selectedVitalType} 
              onChange={(e) => setSelectedVitalType(e.target.value)}
              required
            >
              <option value="blood_pressure">Blood Pressure</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="temperature">Temperature</option>
              <option value="weight">Weight</option>
              <option value="blood_sugar">Blood Sugar</option>
              <option value="oxygen_saturation">Oxygen Saturation</option>
            </select>
          </div>
          <div className="form-group">
            <label>Value</label>
            <input 
              type="text" 
              value={newVitalForm.value}
              onChange={(e) => setNewVitalForm(prev => ({ ...prev, value: e.target.value }))}
              placeholder={`Enter ${getVitalDisplayName(selectedVitalType as VitalSignsData['vitalType'])} value`}
              required
            />
          </div>
          <div className="form-group">
            <label>Date & Time</label>
            <input 
              type="datetime-local" 
              value={newVitalForm.dateTime}
              onChange={(e) => setNewVitalForm(prev => ({ ...prev, dateTime: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea 
              value={newVitalForm.notes}
              onChange={(e) => setNewVitalForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btn btn-primary">Save Reading</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HealthTracking;
