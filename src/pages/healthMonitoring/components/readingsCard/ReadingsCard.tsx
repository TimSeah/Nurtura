import React, { useState, useMemo } from "react";
import { Plus, Heart, Activity, Thermometer, Scale, Droplets, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { CareRecipient } from "../../../../types";
import "./ReadingsCard.css";

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

interface ReadingsCardProps {
  selectedRecipient: CareRecipient | null;
  vitalReadings: VitalSignsData[];
  onAddReading: () => void;
  onReadingUpdated?: () => void;
}

const ReadingsCard: React.FC<ReadingsCardProps> = ({
  selectedRecipient,
  vitalReadings,
  onAddReading,
  onReadingUpdated,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedReading, setSelectedReading] = useState<VitalSignsData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editDateTime, setEditDateTime] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const itemsPerPage = 4; // 2 rows × 2 columns = 4 items per page

  // Filter readings based on selected filter
  const filteredReadings = useMemo(() => {
    if (selectedFilter === "all") {
      return vitalReadings;
    }
    return vitalReadings.filter(reading => reading.vitalType === selectedFilter);
  }, [vitalReadings, selectedFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReadings = filteredReadings.slice(startIndex, endIndex);

  // Reset page when filter changes
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(0);
  };

  // Initialize edit form when a reading is selected
  React.useEffect(() => {
    if (selectedReading) {
      setEditValue(selectedReading.value);
      setEditUnit(selectedReading.unit);
      // Format datetime for datetime-local input
      const date = new Date(selectedReading.dateTime);
      const formattedDateTime = date.toISOString().slice(0, 16);
      setEditDateTime(formattedDateTime);
      setEditNotes(selectedReading.notes || "");
      setIsEditing(false);
    }
  }, [selectedReading]);

  // Handle reading update
  const handleEditReading = async () => {
    if (!selectedReading) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/vital-signs/${selectedReading._id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            value: editValue, 
            unit: editUnit, 
            dateTime: editDateTime, 
            notes: editNotes 
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update reading");
      }

      // Notify parent component to refresh data
      if (onReadingUpdated) {
        onReadingUpdated();
      }

      setSelectedReading(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating reading:", error);
      alert('Error updating reading. Please try again.');
    }
  };

  // Handle reading deletion
  const handleDeleteReading = async () => {
    if (!selectedReading) return;

    if (!window.confirm('Are you sure you want to delete this reading?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/vital-signs/${selectedReading._id}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error("Failed to delete reading");
      }

      // Notify parent component to refresh data
      if (onReadingUpdated) {
        onReadingUpdated();
      }

      setSelectedReading(null);
    } catch (error) {
      console.error("Error deleting reading:", error);
      alert('Error deleting reading. Please try again.');
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const getVitalIcon = (type: VitalSignsData["vitalType"]) => {
    switch (type) {
      case "blood_pressure":
        return Heart;
      case "heart_rate":
        return Activity;
      case "temperature":
        return Thermometer;
      case "weight":
        return Scale;
      case "blood_sugar":
        return Droplets;
      case "oxygen_saturation":
        return Activity;
      default:
        return Heart;
    }
  };

  const getVitalDisplayName = (type: VitalSignsData["vitalType"]) => {
    switch (type) {
      case "blood_pressure":
        return "Blood Pressure";
      case "heart_rate":
        return "Heart Rate";
      case "temperature":
        return "Temperature";
      case "weight":
        return "Weight";
      case "blood_sugar":
        return "Blood Sugar";
      case "oxygen_saturation":
        return "Oxygen Saturation";
      default:
        return type;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  if (!selectedRecipient) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          Recent Readings - {selectedRecipient.name}
        </h2>
        <div className="card-actions">
          <div className="filter-container">
            {/* <Filter className="filter-icon" /> */}
            <select 
              value={selectedFilter} 
              onChange={(e) => handleFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="blood_pressure">Blood Pressure</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="temperature">Temperature</option>
              <option value="weight">Weight</option>
              <option value="blood_sugar">Blood Sugar</option>
              <option value="oxygen_saturation">Oxygen Saturation</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={onAddReading}
          >
            <Plus className="btn-icon" />
            Add Reading
          </button>
        </div>
      </div>
      
      <div className="readings-content">
        <div className="readings-grid">
          {filteredReadings.length === 0 ? (
            <div className="no-readings">
              <p>No vital readings found.</p>
              {selectedFilter === "all" ? (
                <p>Click "Add Reading" to start tracking vital signs.</p>
              ) : (
                <p>No readings found for the selected filter. Try a different filter or add a new reading.</p>
              )}
            </div>
          ) : currentReadings.length === 0 ? (
            <div className="no-readings">
              <p>No readings on this page.</p>
              <p>Use the navigation buttons to view other pages.</p>
            </div>
          ) : (
            currentReadings.map((reading) => {
              const Icon = getVitalIcon(reading.vitalType);
              const { date, time } = formatDateTime(reading.dateTime);
              return (
                <div 
                  key={reading._id} 
                  className="reading-card"
                  onClick={() => setSelectedReading(reading)}
                >
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
            })
          )}
        </div>
        
        {/* Pagination Controls */}
        {filteredReadings.length > itemsPerPage && (
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="pagination-icon" />
              Previous
            </button>
            
            <div className="pagination-info">
              <span className="page-numbers">
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className="results-count">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredReadings.length)} of {filteredReadings.length} readings
              </span>
            </div>
            
            <button 
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
            >
              Next
              <ChevronRight className="pagination-icon" />
            </button>
          </div>
        )}
      </div>

      {/* Reading Detail Modal */}
      {selectedReading && (
        <div className="reading-modal-overlay" onClick={() => setSelectedReading(null)}>
          <div className="reading-modal" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <div className="edit-reading-form">
                <h3>Edit Reading</h3>
                <div className="form-group">
                  <label>Vital Type</label>
                  <input
                    type="text"
                    value={getVitalDisplayName(selectedReading.vitalType)}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editDateTime}
                    onChange={(e) => setEditDateTime(e.target.value)}
                  />
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
                  <button onClick={handleEditReading} className="btn btn-primary">
                    Save Changes
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="reading-detail-header">
                  <h3>{getVitalDisplayName(selectedReading.vitalType)}</h3>
                  <div className="reading-detail-time">
                    {formatDateTime(selectedReading.dateTime).date} at {formatDateTime(selectedReading.dateTime).time}
                  </div>
                </div>
                <div className="reading-detail-content">
                  <div className="reading-detail-value">
                    <strong>{selectedReading.value} {selectedReading.unit}</strong>
                  </div>
                  {selectedReading.notes && (
                    <div className="reading-detail-notes">
                      <strong>Notes:</strong> {selectedReading.notes}
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                    <Edit className="btn-icon" />
                    Edit
                  </button>
                  <button onClick={handleDeleteReading} className="btn btn-danger">
                    <Trash2 className="btn-icon" />
                    Delete
                  </button>
                  <button onClick={() => setSelectedReading(null)} className="btn btn-secondary">
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

export default ReadingsCard;
