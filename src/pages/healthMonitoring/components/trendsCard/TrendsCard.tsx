import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Heart,
  Thermometer,
  Scale,
  Droplets,
  ChevronDown,
} from "lucide-react";
import "./TrendsCard.css";

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

interface TrendsCardProps {
  vitalReadings: VitalSignsData[];
}

const TrendsCard: React.FC<TrendsCardProps> = ({ vitalReadings }) => {
  // Get available vital types from the readings first
  const availableVitalTypes = useMemo(() => {
    const types = Array.from(new Set(vitalReadings.map(reading => reading.vitalType)));
    return types.sort();
  }, [vitalReadings]);

  // Initialize selectedVitalType with the first available type or default to blood_pressure
  const [selectedVitalType, setSelectedVitalType] = useState<VitalSignsData["vitalType"]>(() => {
    return availableVitalTypes.length > 0 ? availableVitalTypes[0] : "blood_pressure";
  });

  // Update selectedVitalType when availableVitalTypes changes and current selection is not available
  React.useEffect(() => {
    if (availableVitalTypes.length > 0 && !availableVitalTypes.includes(selectedVitalType)) {
      setSelectedVitalType(availableVitalTypes[0]);
    }
  }, [availableVitalTypes, selectedVitalType]);

  // Generate chart data from actual readings
  const getChartData = (vitalType: VitalSignsData["vitalType"]) => {
    const relevantReadings = vitalReadings
      .filter((reading) => reading.vitalType === vitalType)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );

    // Group readings by date
    const readingsByDate = new Map<string, VitalSignsData[]>();
    
    relevantReadings.forEach((reading) => {
      const date = new Date(reading.dateTime);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      if (!readingsByDate.has(dateStr)) {
        readingsByDate.set(dateStr, []);
      }
      readingsByDate.get(dateStr)!.push(reading);
    });

    // Get last 7 days of data (not last 7 readings)
    const sortedDates = Array.from(readingsByDate.keys()).slice(-7);
    
    const mappedData = sortedDates.map((dateStr) => {
      const dayReadings = readingsByDate.get(dateStr)!;
      // Use the latest reading of the day
      const latestReading = dayReadings[dayReadings.length - 1];

      if (vitalType === "blood_pressure") {
        const [systolic, diastolic] = latestReading.value
          .split("/")
          .map((v) => parseInt(v.trim()));
        return {
          date: dateStr,
          systolic: systolic || 0,
          diastolic: diastolic || 0,
          time: new Date(latestReading.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          totalReadings: dayReadings.length
        };
      } else {
        const numericValue = parseFloat(latestReading.value) || 0;
        return { 
          date: dateStr, 
          value: numericValue,
          time: new Date(latestReading.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          totalReadings: dayReadings.length,
          // For heart rate, also add a 'rate' property for backward compatibility
          ...(vitalType === "heart_rate" && { rate: numericValue })
        };
      }
    });

    return mappedData;
  };

  const chartData = useMemo(() => getChartData(selectedVitalType), [selectedVitalType, vitalReadings]);

  const getVitalTypeLabel = (type: VitalSignsData["vitalType"]) => {
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

  const getVitalTypeIcon = (type: VitalSignsData["vitalType"]) => {
    switch (type) {
      case "blood_pressure":
        return <TrendingUp className="title-icon" />;
      case "heart_rate":
        return <Heart className="title-icon" />;
      case "temperature":
        return <Thermometer className="title-icon" />;
      case "weight":
        return <Scale className="title-icon" />;
      case "blood_sugar":
        return <Droplets className="title-icon" />;
      case "oxygen_saturation":
        return <Activity className="title-icon" />;
      default:
        return <Activity className="title-icon" />;
    }
  };

  const getVitalTypeColor = (type: VitalSignsData["vitalType"]) => {
    switch (type) {
      case "blood_pressure":
        return { primary: "#dc2626", secondary: "#0f766e" };
      case "heart_rate":
        return { primary: "#7c3aed", secondary: "#7c3aed" };
      case "temperature":
        return { primary: "#ea580c", secondary: "#ea580c" };
      case "weight":
        return { primary: "#059669", secondary: "#059669" };
      case "blood_sugar":
        return { primary: "#dc2626", secondary: "#dc2626" };
      case "oxygen_saturation":
        return { primary: "#2563eb", secondary: "#2563eb" };
      default:
        return { primary: "#6b7280", secondary: "#6b7280" };
    }
  };

  // Custom tooltip component that follows mouse and shows proper data
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Get the full data object
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Date: ${label}`}</p>
          {data.time && (
            <p className="tooltip-time">{`Time: ${data.time}`}</p>
          )}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="tooltip-entry" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
              {selectedVitalType === "blood_pressure" ? "" : getVitalUnit(selectedVitalType)}
            </p>
          ))}
          {data.totalReadings > 1 && (
            <p className="tooltip-readings">{`${data.totalReadings} readings this day`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const getVitalUnit = (type: VitalSignsData["vitalType"]) => {
    switch (type) {
      case "heart_rate":
        return " bpm";
      case "temperature":
        return "°F";
      case "weight":
        return " lbs";
      case "blood_sugar":
        return " mg/dL";
      case "oxygen_saturation":
        return "%";
      default:
        return "";
    }
  };

  const renderChart = () => {
    const colors = getVitalTypeColor(selectedVitalType);

    // Add defensive check
    if (!chartData || chartData.length === 0) {
      return (
        <div className="empty-state">
          <p>No data available for chart rendering.</p>
        </div>
      );
    }

    if (selectedVitalType === "blood_pressure") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke={colors.primary}
              strokeWidth={2}
              name="Systolic"
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke={colors.secondary}
              strokeWidth={2}
              name="Diastolic"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (selectedVitalType === "heart_rate") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" fill={colors.primary} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      // Line chart for other vital types
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.primary}
              strokeWidth={2}
              name={getVitalTypeLabel(selectedVitalType)}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };

  // If no readings available, show a message
  if (vitalReadings.length === 0) {
    return (
      <div className="card trends-card">
        <div className="card-header">
          <h2 className="card-title">
            <TrendingUp className="title-icon" />
            Health Trends
          </h2>
        </div>
        <div className="empty-state">
          <p>No vital readings available to display trends.</p>
          <p>Add some readings to see trend charts here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card trends-card">
      <div className="card-header">
        <h2 className="card-title">
          {getVitalTypeIcon(selectedVitalType)}
          {getVitalTypeLabel(selectedVitalType)} Trend
        </h2>
        <div className="vital-selector">
          <select
            value={selectedVitalType}
            onChange={(e) => setSelectedVitalType(e.target.value as VitalSignsData["vitalType"])}
            className="vital-type-select"
          >
            {availableVitalTypes.map((type) => (
              <option key={type} value={type}>
                {getVitalTypeLabel(type)}
              </option>
            ))}
          </select>
          <ChevronDown className="select-icon" />
        </div>
      </div>
      <div className="chart-container">
        {availableVitalTypes.length === 0 ? (
          <div className="empty-state">
            <p>No vital readings available to display trends.</p>
            <p>Add some readings to see trend charts here.</p>
          </div>
        ) : chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="empty-state">
            <p>No {getVitalTypeLabel(selectedVitalType).toLowerCase()} readings available.</p>
            <p>Add some readings to see the trend chart.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsCard;
