import { useState, useEffect } from "react";
import "./healthmonitoring.css";
import { CareRecipient } from "../../../../types";

const HealthMonitoring = () => {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [relationship, setRelationship] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [caregiverNotes, setCaregiverNotes] = useState("");
  
  const [recepients, setRecepients] = useState<CareRecipient[]>([]);

  const saveRecepient = async () => {
    // Validation
    if (!name.trim() || !dateOfBirth || !relationship.trim()) {
      alert("Please fill in all required fields (Name, Date of Birth, Relationship)");
      return;
    }

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

      await getRecepients();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add care recipient");
    }
  };

  const getRecepients = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/care-recipients`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch care recipients");
      }
      const data = await response.json();
      setRecepients(data);
    } catch (error) {
      console.error("Error fetching recepients:", error);
      alert("Could not load care recipients");
    }
  };

  useEffect(() => {
    getRecepients();
  }, []);

  return (
    <div className="container">
      <h3>Add Care Recipient</h3>
      
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

      <button onClick={saveRecepient} className="save-button">
        Add Care Recipient
      </button>

      {/* Display existing recipients */}
      <div className="recipients-list">
        <h4>Existing Care Recipients</h4>
        {recepients.length === 0 ? (
          <p>No care recipients added yet.</p>
        ) : (
          <ul>
            {recepients.map((r, i) => (
              <li key={r._id || i}>
                <strong>{r.name}</strong> - {r.relationship}
                <div>Date of Birth: {new Date(r.dateOfBirth).toLocaleDateString()}</div>
                {r.medicalConditions.length > 0 && (
                  <div>Medical Conditions: {r.medicalConditions.join(', ')}</div>
                )}
                {r.caregiverNotes && (
                  <div>Notes: {r.caregiverNotes}</div>
                )}
                <div style={{fontSize: '12px', color: '#6b7280', marginTop: '8px'}}>
                  <em>Medications and Emergency Contacts can be managed separately</em>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HealthMonitoring;
