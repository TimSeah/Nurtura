import React, { useState, useEffect } from "react";
import {
  Info,
} from "lucide-react";
import { apiService } from "../../services/apiService";
import { CareRecipient } from "../../types";
import Modal from "../../components/Modal";
import HealthMonitoring from "./components/add new recipient/HealthMonitoring";
import MedicationsCard from "./components/medications/MedicationsCard";
import JournalEntryForm from "./components/journal/JournalEntryForm";
import JournalEntriesCard from "./components/journal/JournalEntriesCard";
import CareRecipientSelector from "./components/careRecipientSelector";
import ReadingsCard from "./components/readingsCard";
import TrendsCard from "./components/trendsCard";
import "./HealthTracking.css";

interface VitalSignsData {
  _id?: string;
  recipientId: string;
  vitalType:
    | "blood_pressure"
    | "heart_rate"
    | "temperature"
    | "weight"
    | "blood_sugar"
    | "oxygen_saturation";
  value: string;
  unit: string;
  dateTime: string;
  notes?: string;
}

const HealthTracking: React.FC = () => {
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedVitalType, setSelectedVitalType] =
    useState<string>("blood_pressure");
  const [showAddForm, setShowAddForm] = useState(false);
  const [careRecipients, setCareRecipients] = useState<CareRecipient[]>([]);
  const [vitalReadings, setVitalReadings] = useState<VitalSignsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newVitalForm, setNewVitalForm] = useState({
    value: "",
    dateTime: new Date().toISOString().slice(0, 16),
    notes: "",
  });
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [isAddingJournal, setIsAddingJournal] = useState(false);
  const [journalRefreshKey, setJournalRefreshKey] = useState(0);

  const handleJournalSaved = () => {
    // Force refresh of journal entries when a new journal is saved
    setJournalRefreshKey(prev => prev + 1);
    setIsAddingJournal(false);
  };

  const handleMedicationAdded = () => {
    // Refresh care recipients data when medications are updated
    loadCareRecipients();
  };

  useEffect(() => {
    // Load care recipients on initial mount
    loadCareRecipients();
  }, []);

  useEffect(() => {
    // Load vital readings when selected recipient changes
    if (selectedRecipient) {
      loadVitalReadings(selectedRecipient);
    }
  }, [selectedRecipient]);

  const loadCareRecipients = async () => {
    try {
      setLoading(true);
      setError(null);
      const recipients = await apiService.getCareRecipients();
      setCareRecipients(recipients);
      if (recipients.length > 0 && !selectedRecipient) {
        setSelectedRecipient(recipients[0]._id);
      }
    } catch (error) {
      console.error("Error loading care recipients:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load care recipients"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadVitalReadings = async (recipientId: string) => {
    try {
      const readings = await apiService.getVitalSigns(recipientId);
      setVitalReadings(readings);
    } catch (error) {
      console.error("Error loading vital readings:", error);
    }
  };

  const handleRecipientChange = (recipientId: string) => {
    setSelectedRecipient(recipientId);
  };

  const handleAddVital = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const vitalData: VitalSignsData = {
        recipientId: selectedRecipient,
        vitalType: selectedVitalType as VitalSignsData["vitalType"],
        value: newVitalForm.value,
        unit: getVitalUnit(selectedVitalType),
        dateTime: newVitalForm.dateTime,
        notes: newVitalForm.notes || undefined,
      };

      const savedVital = await apiService.addVitalSigns(vitalData);
      setVitalReadings((prev) => [savedVital, ...prev]);

      // Reset form and close modal
      setNewVitalForm({ 
        value: "", 
        dateTime: new Date().toISOString().slice(0, 16), 
        notes: "" 
      });
      setShowAddForm(false);
      
      alert("Vital signs recorded successfully!");
    } catch (error) {
      console.error("Error saving vital signs:", error);
      alert("Failed to save vital signs. Please try again.");
    }
  };

  const handleCloseAddForm = () => {
    // Reset form when closing
    setNewVitalForm({ 
      value: "", 
      dateTime: new Date().toISOString().slice(0, 16), 
      notes: "" 
    });
    setShowAddForm(false);
  };

  const getVitalUnit = (type: string) => {
    switch (type) {
      case "blood_pressure":
        return "mmHg";
      case "heart_rate":
        return "bpm";
      case "temperature":
        return "°F";
      case "weight":
        return "lbs";
      case "blood_sugar":
        return "mg/dL";
      case "oxygen_saturation":
        return "%";
      default:
        return "";
    }
  };

  const getVitalTypeDetails = (type: string) => {
    switch (type) {
      case "blood_pressure":
        return {
          placeholder: "120/80",
          hint: "Sit comfortably for 5 minutes before taking. Place cuff on upper arm at heart level. Record as systolic/diastolic (e.g., 120/80).",
          normalRange: "Normal: Less than 120/80 mmHg"
        };
      case "heart_rate":
        return {
          placeholder: "72",
          hint: "Rest for 5 minutes before measuring. Place two fingers on wrist pulse point. Count beats for 60 seconds or use a heart rate monitor.",
          normalRange: "Normal: 60-100 beats per minute"
        };
      case "temperature":
        return {
          placeholder: "98.6",
          hint: "Wait 30 minutes after eating/drinking hot/cold items. Place thermometer under tongue for oral reading or follow device instructions.",
          normalRange: "Normal: 97.8°F - 99.1°F (36.5°C - 37.3°C)"
        };
      case "weight":
        return {
          placeholder: "150",
          hint: "Weigh at the same time each day, preferably in the morning after using the bathroom. Use the same scale on a hard, flat surface.",
          normalRange: "Track changes over time rather than single readings"
        };
      case "blood_sugar":
        return {
          placeholder: "120",
          hint: "Wash hands thoroughly. Use fresh lancet and test strip. Follow your glucose meter instructions. Record timing (fasting, before/after meals).",
          normalRange: "Fasting: 80-100 mg/dL | After meals: Less than 140 mg/dL"
        };
      case "oxygen_saturation":
        return {
          placeholder: "98",
          hint: "Ensure finger is clean and warm. Remove nail polish if present. Place pulse oximeter on fingertip and wait for stable reading.",
          normalRange: "Normal: 95-100%"
        };
      default:
        return {
          placeholder: "",
          hint: "",
          normalRange: ""
        };
    }
  };

  const selectedRecipientData = careRecipients.find(
    (r) => r._id === selectedRecipient
  );

  return (
    <div className="health-tracking">
      <div className="page-header">
        <h1>Health Tracking</h1>
        <p>
          Monitor and track vital signs and health metrics for your care
          recipients.
        </p>
      </div>
      {/* Care Recipient Selector */}
      <CareRecipientSelector
        careRecipients={careRecipients}
        selectedRecipient={selectedRecipient}
        loading={loading}
        error={error}
        isAddingRecipient={isAddingRecipient}
        onRecipientChange={handleRecipientChange}
        onAddRecipient={() => setIsAddingRecipient(true)}
        onRetry={() => loadCareRecipients()}
        onRecipientUpdated={loadCareRecipients}
      />

      {/* Medications Card */}
      <MedicationsCard 
        selectedRecipient={selectedRecipientData || null} 
        onMedicationAdded={handleMedicationAdded}
      />

      {selectedRecipientData && (
        <>
          {/* Recent Readings */}
          <ReadingsCard
            selectedRecipient={selectedRecipientData}
            vitalReadings={vitalReadings}
            onAddReading={() => setShowAddForm(true)}
            onReadingUpdated={() => loadVitalReadings(selectedRecipient)}
          />

          {/* Health Trends Chart */}
          <TrendsCard vitalReadings={vitalReadings} />

          {/* Journal Entries Section */}
          {selectedRecipientData && (
            <div style={{ marginTop: '2rem' }}>
              <JournalEntriesCard 
                key={`journal-${selectedRecipient}-${journalRefreshKey}`}
                recipientId={selectedRecipient}
                recipientName={selectedRecipientData.name}
                onAddJournal={() => setIsAddingJournal(true)}
              />
            </div>
          )}
        </>
      )}
      {/* Add Reading Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={handleCloseAddForm}
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
            <div className="vital-input-container">
              <input
                type="text"
                value={newVitalForm.value}
                onChange={(e) =>
                  setNewVitalForm((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder={getVitalTypeDetails(selectedVitalType).placeholder}
                required
              />
              <span className="vital-unit-label">
                {getVitalUnit(selectedVitalType)}
              </span>
            </div>
            {getVitalTypeDetails(selectedVitalType).hint && (
              <div className="vital-hint">
                <Info className="hint-icon" />
                <div className="hint-content">
                  <p className="hint-text">{getVitalTypeDetails(selectedVitalType).hint}</p>
                  <p className="normal-range">📊 {getVitalTypeDetails(selectedVitalType).normalRange}</p>
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={newVitalForm.dateTime}
              onChange={(e) =>
                setNewVitalForm((prev) => ({
                  ...prev,
                  dateTime: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={newVitalForm.notes}
              onChange={(e) =>
                setNewVitalForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional notes..."
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" className="btn btn-primary">
              Save Reading
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseAddForm}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Care Recipient Modal */}
      {isAddingRecipient && (
        <Modal
          isOpen={isAddingRecipient}
          onClose={() => setIsAddingRecipient(false)}
          title="Add New Care Recipient"
          size="medium"
        >
          <HealthMonitoring 
            onSaveSuccess={() => {
              setIsAddingRecipient(false);
              loadCareRecipients(); // Reload the care recipients list
            }}
            onCancel={() => setIsAddingRecipient(false)}
          />
        </Modal>
      )}

      {/* Add Journal Modal */}
      {isAddingJournal && selectedRecipientData && (
        <Modal
          isOpen={isAddingJournal}
          onClose={() => setIsAddingJournal(false)}
          title={`New Journal Entry for ${selectedRecipientData.name}`}
          size="medium"
        >
          <JournalEntryForm 
            recipientId={selectedRecipient}
            recipientName={selectedRecipientData.name}
            onSave={handleJournalSaved}
          />
        </Modal>
      )}
    </div>
  );
};

export default HealthTracking;
