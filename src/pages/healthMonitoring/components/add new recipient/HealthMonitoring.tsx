import { useState } from "react";
import "./healthmonitoring.css";

interface HealthMonitoringProps {
  onSaveSuccess?: () => void;
  onCancel?: () => void;
}

const HealthMonitoring: React.FC<HealthMonitoringProps> = ({ onSaveSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [relationship, setRelationship] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [caregiverNotes, setCaregiverNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const saveRecepient = async () => {
    // Validation
    if (!name.trim() || !dateOfBirth || !relationship.trim()) {
      alert("Please fill in all required fields (Name, Date of Birth, Relationship)");
      return;
    }

    setIsLoading(true);

    const newRecepient = {
      name: name.trim(),
      dateOfBirth: new Date(dateOfBirth),
      relationship: relationship.trim(),
      medicalConditions: medicalConditions.split(',').map(c => c.trim()).filter(c => c),
      medications: [], // Empty array as medications are managed separately
      emergencyContacts: [], // Empty array for now, can be added later
      caregiverNotes: caregiverNotes.trim(),
      isActive: true
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/care-recipients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // include cookies for authentication
          body: JSON.stringify(newRecepient),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save recepient");
      }

      const data = await response.json();
      console.log("Saved recepient:", data);
      alert("Care Recipient added successfully!");
      
      // Clear form
      setName("");
      setDateOfBirth("");
      setRelationship("");
      setMedicalConditions("");
      setCaregiverNotes("");
      
      // Call the success callback to close the modal
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add care recipient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Basic Information */}
      <div className="form-section">
        <h4>Basic Information</h4>
        <input
          type="text"
          placeholder="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Date of Birth *"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Relationship *"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          required
        />
        <textarea
          placeholder="Medical Conditions (separate with commas)"
          value={medicalConditions}
          onChange={(e) => setMedicalConditions(e.target.value)}
          rows={3}
        />
        <textarea
          placeholder="Caregiver Notes"
          value={caregiverNotes}
          onChange={(e) => setCaregiverNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button 
          onClick={saveRecepient} 
          className="save-button"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Care Recipient"}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="cancel-button"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default HealthMonitoring;
