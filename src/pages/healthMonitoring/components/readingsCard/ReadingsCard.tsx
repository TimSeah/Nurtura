import React from "react";
import { Plus, Heart, Activity, Thermometer, Scale, Droplets } from "lucide-react";
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
          <button
            className="btn btn-primary"
            onClick={onAddReading}
          >
            <Plus className="btn-icon" />
            Add Reading
          </button>
        </div>
      </div>
      <div className="readings-grid">
        {vitalReadings.length === 0 ? (
          <div className="no-readings">
            <p>No vital readings recorded yet.</p>
            <p>Click "Add Reading" to start tracking vital signs.</p>
          </div>
        ) : (
          vitalReadings.map((reading) => {
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
    </div>
  );
};

export default ReadingsCard;
