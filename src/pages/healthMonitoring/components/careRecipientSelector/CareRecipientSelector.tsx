import React from "react";
import { Plus } from "lucide-react";
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
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Select Care Recipient</h2>
        <div className="card-actions">
          {!isAddingRecipient && (
            <button 
              className="btn btn-primary"
              onClick={onAddRecipient}
            >
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
            <button
              className="btn btn-secondary"
              onClick={onRetry}
            >
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
            <button
              key={recipient._id}
              className={`recipient-card ${
                selectedRecipient === recipient._id ? "selected" : ""
              }`}
              onClick={() => recipient._id && onRecipientChange(recipient._id)}
            >
              <div className="recipient-info">
                <h3>{recipient.name}</h3>
                <p>
                  DOB: {new Date(recipient.dateOfBirth).toLocaleDateString()}
                </p>
                <p>Relationship: {recipient.relationship}</p>
                <div className="medical-conditions">
                  <span className="conditions-label">Medical Conditions:</span>
                  {recipient.medicalConditions && recipient.medicalConditions.length > 0 ? (
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
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default CareRecipientSelector;
