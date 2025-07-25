import { useState } from "react";
import { Plus } from "lucide-react";
import "./MedicationsCard.css";
import { CareRecipient } from "../../../../types";

interface MedicationsCardProps {
  selectedRecipient: CareRecipient | null;
  onMedicationAdded?: () => void;
}

const MedicationsCard = ({ selectedRecipient, onMedicationAdded }: MedicationsCardProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [medications, setMedications] = useState([{
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    notes: ""
  }]);

  // Helper functions for managing medications
  const addMedication = () => {
    setMedications([...medications, {
      name: "",
      dosage: "",
      frequency: "",
      startDate: "",
      endDate: "",
      notes: ""
    }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    // Reset form to initial state
    setMedications([{
      name: "",
      dosage: "",
      frequency: "",
      startDate: "",
      endDate: "",
      notes: ""
    }]);
  };

  const saveMedications = async () => {
    if (!selectedRecipient) {
      alert("Please select a care recipient first");
      return;
    }

    // Filter out empty medications
    const validMedications = medications.filter(med => med.name.trim());
    
    if (validMedications.length === 0) {
      alert("Please add at least one medication");
      return;
    }

    const medicationsToSave = validMedications.map(med => ({
      ...med,
      startDate: med.startDate ? new Date(med.startDate) : new Date(),
      endDate: med.endDate ? new Date(med.endDate) : undefined
    }));

    try {
      // Update the care recipient with new medications
      const updatedRecipient = {
        ...selectedRecipient,
        medications: [...(selectedRecipient.medications || []), ...medicationsToSave]
      };

      const response = await fetch(
        `http://localhost:5000/api/care-recipients/${selectedRecipient._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedRecipient),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save medications");
      }

      alert("Medications added successfully!");
      
      // Clear form and close
      setMedications([{
        name: "",
        dosage: "",
        frequency: "",
        startDate: "",
        endDate: "",
        notes: ""
      }]);
      setShowAddForm(false);

      // Notify parent component to refresh data
      if (onMedicationAdded) {
        onMedicationAdded();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add medications");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          Medications{selectedRecipient ? ` - ${selectedRecipient.name}` : ''}
        </h2>
        {selectedRecipient && (
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="btn-icon" />
              Add Medication
            </button>
          </div>
        )}
      </div>

      {!selectedRecipient ? (
        <div className="empty-state">
          <p>Please select a care recipient to manage medications.</p>
        </div>
      ) : (
        <div className="medications-content">
          {selectedRecipient.medications && selectedRecipient.medications.length > 0 ? (
            <div className="medications-grid">
              {selectedRecipient.medications.map((med, index) => (
                <div key={index} className="medication-card">
                  <div className="medication-header">
                    <h4>{med.name}</h4>
                    <span className="medication-dosage">{med.dosage}</span>
                  </div>
                  <div className="medication-details">
                    <p className="medication-frequency">Frequency: {med.frequency}</p>
                    {med.startDate && (
                      <p className="medication-date">Started: {new Date(med.startDate).toLocaleDateString()}</p>
                    )}
                    {med.endDate && (
                      <p className="medication-date">Ends: {new Date(med.endDate).toLocaleDateString()}</p>
                    )}
                    {med.notes && (
                      <p className="medication-notes">Notes: {med.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No medications recorded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Medication Modal/Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Medications for {selectedRecipient?.name}</h3>
              <button className="modal-close" onClick={handleCloseForm}>×</button>
            </div>
            <div className="modal-body">
              {medications.map((medication, index) => (
                <div key={index} className="medication-form-item">
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Medication Name *"
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Dosage *"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Frequency *"
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    />
                    <input
                      type="date"
                      title="Start Date"
                      value={medication.startDate}
                      onChange={(e) => updateMedication(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="date"
                      title="End Date (optional)"
                      value={medication.endDate}
                      onChange={(e) => updateMedication(index, 'endDate', e.target.value)}
                    />
                  </div>
                  <textarea
                    placeholder="Medication Notes (optional)"
                    value={medication.notes}
                    onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                    rows={2}
                  />
                  {medications.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-danger btn-small" 
                      onClick={() => removeMedication(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={addMedication}>
                  Add Another Medication
                </button>
                <button className="btn btn-primary" onClick={saveMedications}>
                  Save Medications
                </button>
                <button className="btn btn-outline" onClick={handleCloseForm}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsCard;
