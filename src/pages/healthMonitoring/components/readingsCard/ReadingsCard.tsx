import React, { useState, useMemo } from "react";
import { Plus, Heart, Activity, Thermometer, Scale, Droplets, ChevronLeft, ChevronRight } from "lucide-react";
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
}

const ReadingsCard: React.FC<ReadingsCardProps> = ({
  selectedRecipient,
  vitalReadings,
  onAddReading,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
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
                <div key={reading._id} className="reading-card">
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
    </div>
  );
};

export default ReadingsCard;
