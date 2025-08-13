import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CareRecipient } from "../../../../types";
import "./CareRecipientSelector.css";

interface CareRecipientSelectorProps {
  careRecipients: CareRecipient[];
  selectedRecipient: string;
  loading: boolean;
  error: string | null;
  isAddingRecipient?: boolean;
  onRecipientChange: (recipientId: string) => void;
  onAddRecipient: () => void;
  onRetry: () => void;
  onRecipientUpdated?: () => void;
}

const CareRecipientSelector: React.FC<CareRecipientSelectorProps> = ({
  careRecipients,
  selectedRecipient,
  loading,
  error,
  isAddingRecipient = false,
  onRecipientChange,
  onAddRecipient,
  onRetry,
  onRecipientUpdated,
}) => {
  const [selectedCareRecipient, setSelectedCareRecipient] =
    useState<CareRecipient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDateOfBirth, setEditDateOfBirth] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [editMedicalConditions, setEditMedicalConditions] = useState<string[]>(
    []
  );
  const [editCaregiverNotes, setEditCaregiverNotes] = useState("");

  // Initialize edit form when a care recipient is selected
  useEffect(() => {
    if (selectedCareRecipient) {
      setEditName(selectedCareRecipient.name);
      setEditDateOfBirth(
        new Date(selectedCareRecipient.dateOfBirth).toISOString().slice(0, 10)
      );
      setEditRelationship(selectedCareRecipient.relationship);
      setEditMedicalConditions(selectedCareRecipient.medicalConditions || []);
      setEditCaregiverNotes(selectedCareRecipient.caregiverNotes || "");
      setIsEditing(false);
    }
  }, [selectedCareRecipient]);

  // Handle care recipient update
  const handleEditCareRecipient = async () => {
    if (!selectedCareRecipient) return;

    try {
      const response = await fetch(
        `/api/care-recipients/${selectedCareRecipient._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName,
            dateOfBirth: new Date(editDateOfBirth),
            relationship: editRelationship,
            medicalConditions: editMedicalConditions,
            caregiverNotes: editCaregiverNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update care recipient");
      }

      // Notify parent component to refresh data
      if (onRecipientUpdated) {
        onRecipientUpdated();
      }

      setSelectedCareRecipient(null);
      setIsEditing(false);
      alert("Care recipient updated successfully!");
    } catch (error) {
      console.error("Error updating care recipient:", error);
      alert("Error updating care recipient. Please try again.");
    }
  };

  // Handle care recipient deletion
  const handleDeleteCareRecipient = async () => {
    if (!selectedCareRecipient) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this care recipient? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/care-recipients/${selectedCareRecipient._id}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete care recipient");
      }

      // Notify parent component to refresh data
      if (onRecipientUpdated) {
        onRecipientUpdated();
      }

      setSelectedCareRecipient(null);
      alert("Care recipient deleted successfully!");
    } catch (error) {
      console.error("Error deleting care recipient:", error);
      alert("Error deleting care recipient. Please try again.");
    }
  };

  const handleMedicalConditionChange = (index: number, value: string) => {
    const updated = [...editMedicalConditions];
    updated[index] = value;
    setEditMedicalConditions(updated);
  };

  const addMedicalCondition = () => {
    setEditMedicalConditions([...editMedicalConditions, ""]);
  };

  const removeMedicalCondition = (index: number) => {
    setEditMedicalConditions(
      editMedicalConditions.filter((_, i) => i !== index)
    );
  };
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Select Care Recipient</h2>
        <div className="card-actions">
          {!isAddingRecipient && (
            <button className="btn btn-primary" onClick={onAddRecipient}>
              <Plus className="btn-icon" />
              Add Care Recipient
            </button>
          )}
        </div>
      </div>

      <div className="recipient-selector">
        {loading ? (
          <div className="loading-message">
            <p>Loading care recipients...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>Error loading care recipients: {error}</p>
            <button className="btn btn-secondary" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : careRecipients.length === 0 ? (
          <div className="loading-message">
            <p>
              No care recipients found. Please add some care recipients first.
            </p>
          </div>
        ) : (
          careRecipients.map((recipient) => (
            <div key={recipient._id} className="recipient-card-container">
              <button
                className={`recipient-card ${
                  selectedRecipient === recipient._id ? "selected" : ""
                }`}
                data-testid="care-recipient-card"
                onClick={() =>
                  recipient._id && onRecipientChange(recipient._id)
                }
              >
                {/* Action buttons - only show when selected */}
                {selectedRecipient === recipient._id && (
                  <div className="recipient-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCareRecipient(recipient);
                        setIsEditing(true);
                      }}
                      title="Edit recipient"
                    >
                      <Edit className="action-icon" />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          !window.confirm(
                            "Are you sure you want to delete this care recipient? This action cannot be undone."
                          )
                        ) {
                          return;
                        }

                        try {
                          const response = await fetch(
                            `/api/care-recipients/${recipient._id}`,
                            { method: "DELETE", credentials: "include" }
                          );

                          if (!response.ok) {
                            throw new Error("Failed to delete care recipient");
                          }

                          if (onRecipientUpdated) {
                            onRecipientUpdated();
                          }

                          alert("Care recipient deleted successfully!");
                        } catch (error) {
                          console.error(
                            "Error deleting care recipient:",
                            error
                          );
                          alert(
                            "Error deleting care recipient. Please try again."
                          );
                        }
                      }}
                      title="Delete recipient"
                    >
                      <Trash2 className="action-icon" />
                    </button>
                  </div>
                )}

                <div className="recipient-info">
                  <h3>{recipient.name}</h3>
                  <p>
                    DOB: {new Date(recipient.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p>Relationship: {recipient.relationship}</p>
                  <div className="medical-conditions">
                    <span className="conditions-label">
                      Medical Conditions:
                    </span>
                    {recipient.medicalConditions &&
                    recipient.medicalConditions.length > 0 ? (
                      <div className="conditions-list">
                        {recipient.medicalConditions.map((condition, index) => (
                          <span key={index} className="condition-tag">
                            {condition}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="no-conditions">None reported</span>
                    )}
                  </div>
                  {recipient.caregiverNotes && (
                    <div className="caregiver-notes">
                      <span className="notes-label">Notes:</span>
                      <p className="notes-text">{recipient.caregiverNotes}</p>
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Care Recipient Detail Modal */}
      {selectedCareRecipient && (
        <div
          className="recipient-modal-overlay"
          onClick={() => setSelectedCareRecipient(null)}
        >
          <div className="recipient-modal" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <div className="edit-recipient-form">
                <h3>Edit Care Recipient</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={editDateOfBirth}
                      onChange={(e) => setEditDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input
                      type="text"
                      value={editRelationship}
                      onChange={(e) => setEditRelationship(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Medical Conditions</label>
                  {editMedicalConditions.map((condition, index) => (
                    <div key={index} className="condition-input-row">
                      <input
                        type="text"
                        value={condition}
                        onChange={(e) =>
                          handleMedicalConditionChange(index, e.target.value)
                        }
                        placeholder="Medical condition"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedicalCondition(index)}
                        className="remove-condition-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMedicalCondition}
                    className="add-condition-btn"
                  >
                    Add Medical Condition
                  </button>
                </div>
                <div className="form-group">
                  <label>Caregiver Notes</label>
                  <textarea
                    value={editCaregiverNotes}
                    onChange={(e) => setEditCaregiverNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    onClick={handleEditCareRecipient}
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="recipient-detail-header">
                  <h3>{selectedCareRecipient.name}</h3>
                </div>
                <div className="recipient-detail-content">
                  <div className="recipient-detail-info">
                    <p>
                      <strong>Date of Birth:</strong>{" "}
                      {new Date(
                        selectedCareRecipient.dateOfBirth
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Relationship:</strong>{" "}
                      {selectedCareRecipient.relationship}
                    </p>
                    <div className="recipient-detail-conditions">
                      <strong>Medical Conditions:</strong>
                      {selectedCareRecipient.medicalConditions &&
                      selectedCareRecipient.medicalConditions.length > 0 ? (
                        <div className="conditions-list">
                          {selectedCareRecipient.medicalConditions.map(
                            (condition, index) => (
                              <span key={index} className="condition-tag">
                                {condition}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="no-conditions">None reported</span>
                      )}
                    </div>
                  </div>
                  {selectedCareRecipient.caregiverNotes && (
                    <div className="recipient-detail-notes">
                      <strong>Caregiver Notes:</strong>{" "}
                      {selectedCareRecipient.caregiverNotes}
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary"
                  >
                    <Edit className="btn-icon" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteCareRecipient}
                    className="btn btn-danger"
                  >
                    <Trash2 className="btn-icon" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedCareRecipient(null)}
                    className="btn btn-secondary"
                  >
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

export default CareRecipientSelector;
