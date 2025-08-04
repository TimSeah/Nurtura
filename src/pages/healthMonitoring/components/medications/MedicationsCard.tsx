import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import "./MedicationsCard.css";
import { CareRecipient } from "../../../../types";

interface MedicationsCardProps {
  selectedRecipient: CareRecipient | null;
  onMedicationAdded?: () => void;
}

const MedicationsCard = ({ selectedRecipient, onMedicationAdded }: MedicationsCardProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [medications, setMedications] = useState([{
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    notes: ""
  }]);
  // Edit form states
  const [editName, setEditName] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editFrequency, setEditFrequency] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

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
          credentials:"include",
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

  // Initialize edit form when a medication is selected
  useEffect(() => {
    if (selectedMedication) {
      setEditName(selectedMedication.name);
      setEditDosage(selectedMedication.dosage);
      setEditFrequency(selectedMedication.frequency);
      setEditStartDate(selectedMedication.startDate ? new Date(selectedMedication.startDate).toISOString().slice(0, 10) : "");
      setEditEndDate(selectedMedication.endDate ? new Date(selectedMedication.endDate).toISOString().slice(0, 10) : "");
      setEditNotes(selectedMedication.notes || "");
      setIsEditing(false);
    }
  }, [selectedMedication]);

  // Handle medication update
  const handleEditMedication = async () => {
    if (!selectedRecipient || !selectedMedication) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/care-recipients/${selectedRecipient._id}/medications/${selectedMedication._id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editName,
            dosage: editDosage,
            frequency: editFrequency,
            startDate: editStartDate ? new Date(editStartDate) : new Date(),
            endDate: editEndDate ? new Date(editEndDate) : undefined,
            notes: editNotes
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update medication");
      }

      // Notify parent component to refresh data
      if (onMedicationAdded) {
        onMedicationAdded();
      }

      setSelectedMedication(null);
      setIsEditing(false);
      alert("Medication updated successfully!");
    } catch (error) {
      console.error("Error updating medication:", error);
      alert('Error updating medication. Please try again.');
    }
  };

  // Handle medication deletion
  const handleDeleteMedication = async () => {
    if (!selectedRecipient || !selectedMedication) return;

    if (!window.confirm('Are you sure you want to delete this medication?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/care-recipients/${selectedRecipient._id}/medications/${selectedMedication._id}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error("Failed to delete medication");
      }

      // Notify parent component to refresh data
      if (onMedicationAdded) {
        onMedicationAdded();
      }

      setSelectedMedication(null);
      alert("Medication deleted successfully!");
    } catch (error) {
      console.error("Error deleting medication:", error);
      alert('Error deleting medication. Please try again.');
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
                <div 
                  key={index} 
                  className="medication-card"
                  onClick={() => setSelectedMedication(med)}
                >
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

      {/* Medication Detail Modal */}
      {selectedMedication && (
        <div className="medication-modal-overlay" onClick={() => setSelectedMedication(null)}>
          <div className="medication-modal" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <div className="edit-medication-form">
                <h3>Edit Medication</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Medication Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dosage</label>
                    <input
                      type="text"
                      value={editDosage}
                      onChange={(e) => setEditDosage(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={editFrequency}
                      onChange={(e) => setEditFrequency(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleEditMedication} className="btn btn-primary">
                    Save Changes
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="medication-detail-header">
                  <h3>{selectedMedication.name}</h3>
                  <span className="medication-detail-dosage">{selectedMedication.dosage}</span>
                </div>
                <div className="medication-detail-content">
                  <div className="medication-detail-info">
                    <p><strong>Frequency:</strong> {selectedMedication.frequency}</p>
                    {selectedMedication.startDate && (
                      <p><strong>Started:</strong> {new Date(selectedMedication.startDate).toLocaleDateString()}</p>
                    )}
                    {selectedMedication.endDate && (
                      <p><strong>Ends:</strong> {new Date(selectedMedication.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  {selectedMedication.notes && (
                    <div className="medication-detail-notes">
                      <strong>Notes:</strong> {selectedMedication.notes}
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                    <Edit className="btn-icon" />
                    Edit
                  </button>
                  <button onClick={handleDeleteMedication} className="btn btn-danger">
                    <Trash2 className="btn-icon" />
                    Delete
                  </button>
                  <button onClick={() => setSelectedMedication(null)} className="btn btn-secondary">
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsCard;
