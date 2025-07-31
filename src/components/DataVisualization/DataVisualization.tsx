// Advanced Data Visualization Components for Health Analytics
// Uses Chart.js for interactive charts and analytics

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './DataVisualization.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Interface for health metrics data
interface HealthMetric {
  date: string;
  value: number;
  type: 'blood_pressure_systolic' | 'blood_pressure_diastolic' | 'heart_rate' | 'weight' | 'temperature' | 'glucose';
  careRecipientId: string;
  notes?: string;
}

interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  changePercentage: number;
  period: string;
}

// Props interfaces
interface VitalSignsTrendProps {
  careRecipientId: string;
  metrics: HealthMetric[];
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: string) => void;
}

interface HealthOverviewProps {
  careRecipients: Array<{
    id: string;
    name: string;
    healthScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
}

interface MedicationComplianceProps {
  data: Array<{
    medication: string;
    prescribed: number;
    taken: number;
    missed: number;
  }>;
}

// Vital Signs Trend Chart Component
export const VitalSignsTrend: React.FC<VitalSignsTrendProps> = ({
  careRecipientId,
  metrics,
  timeRange,
  onTimeRangeChange
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['blood_pressure_systolic', 'heart_rate']);
  const [trends, setTrends] = useState<HealthTrend[]>([]);

  // Process metrics data for chart
  const processMetricsData = () => {
    const filteredMetrics = metrics.filter(metric => 
      metric.careRecipientId === careRecipientId &&
      selectedMetrics.includes(metric.type)
    );

    // Group by metric type
    const groupedMetrics = filteredMetrics.reduce((acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = [];
      }
      acc[metric.type].push(metric);
      return acc;
    }, {} as Record<string, HealthMetric[]>);

    // Create datasets
    const datasets = Object.entries(groupedMetrics).map(([type, data], index) => {
      const colors = [
        { border: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' },
        { border: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' },
        { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' },
        { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' },
        { border: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }
      ];

      return {
        label: formatMetricLabel(type),
        data: data.map(item => ({
          x: item.date,
          y: item.value
        })),
        borderColor: colors[index % colors.length].border,
        backgroundColor: colors[index % colors.length].background,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    return {
      datasets
    };
  };

  const formatMetricLabel = (type: string): string => {
    const labels = {
      'blood_pressure_systolic': 'Blood Pressure (Systolic)',
      'blood_pressure_diastolic': 'Blood Pressure (Diastolic)',
      'heart_rate': 'Heart Rate (BPM)',
      'weight': 'Weight (lbs)',
      'temperature': 'Temperature (°F)',
      'glucose': 'Blood Glucose (mg/dL)'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Calculate health trends
  useEffect(() => {
    const calculateTrends = () => {
      const newTrends: HealthTrend[] = [];
      
      selectedMetrics.forEach(metricType => {
        const metricData = metrics
          .filter(m => m.careRecipientId === careRecipientId && m.type === metricType)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (metricData.length >= 2) {
          const recent = metricData.slice(-7); // Last 7 readings
          const previous = metricData.slice(-14, -7); // Previous 7 readings

          if (recent.length > 0 && previous.length > 0) {
            const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
            const previousAvg = previous.reduce((sum, m) => sum + m.value, 0) / previous.length;
            
            const changePercentage = ((recentAvg - previousAvg) / previousAvg) * 100;
            
            let trend: 'improving' | 'stable' | 'declining' = 'stable';
            if (Math.abs(changePercentage) > 5) {
              // For metrics where lower is better (blood pressure, weight)
              const lowerIsBetter = ['blood_pressure_systolic', 'blood_pressure_diastolic', 'weight'].includes(metricType);
              trend = lowerIsBetter 
                ? (changePercentage < 0 ? 'improving' : 'declining')
                : (changePercentage > 0 ? 'improving' : 'declining');
            }

            newTrends.push({
              metric: formatMetricLabel(metricType),
              trend,
              changePercentage: Math.abs(changePercentage),
              period: '7 days'
            });
          }
        }
      });

      setTrends(newTrends);
    };

    calculateTrends();
  }, [metrics, careRecipientId, selectedMetrics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vital Signs Trends',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            return new Date(context[0].parsed.x).toLocaleDateString();
          },
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: (timeRange === '7d' ? 'day' : timeRange === '30d' ? 'day' : 'week') as 'day' | 'week'
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  return (
    <div className="vital-signs-trend">
      <div className="chart-controls">
        <div className="metric-selector">
          <h4>Select Metrics:</h4>
          {['blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate', 'weight', 'temperature', 'glucose'].map(metric => (
            <label key={metric} className="metric-checkbox">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metric)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMetrics([...selectedMetrics, metric]);
                  } else {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                  }
                }}
              />
              {formatMetricLabel(metric)}
            </label>
          ))}
        </div>

        <div className="time-range-selector">
          <h4>Time Range:</h4>
          {['7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => onTimeRangeChange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        {selectedMetrics.length > 0 ? (
          <Line data={processMetricsData()} options={chartOptions} />
        ) : (
          <div className="no-data">
            <p>Select at least one metric to view trends</p>
          </div>
        )}
      </div>

      {trends.length > 0 && (
        <div className="health-trends">
          <h4>Health Trends Analysis</h4>
          <div className="trends-grid">
            {trends.map((trend, index) => (
              <div key={index} className={`trend-card ${trend.trend}`}>
                <div className="trend-metric">{trend.metric}</div>
                <div className="trend-indicator">
                  <span className={`trend-icon ${trend.trend}`}>
                    {trend.trend === 'improving' ? '↗️' : trend.trend === 'declining' ? '↘️' : '→'}
                  </span>
                  <span className="trend-percentage">
                    {trend.changePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="trend-period">over {trend.period}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Health Overview Dashboard Component
export const HealthOverview: React.FC<HealthOverviewProps> = ({ careRecipients }) => {
  const healthScoreData = {
    labels: careRecipients.map(cr => cr.name),
    datasets: [
      {
        label: 'Health Score',
        data: careRecipients.map(cr => cr.healthScore),
        backgroundColor: careRecipients.map(cr => {
          if (cr.healthScore >= 80) return 'rgba(16, 185, 129, 0.8)';
          if (cr.healthScore >= 60) return 'rgba(245, 158, 11, 0.8)';
          return 'rgba(239, 68, 68, 0.8)';
        }),
        borderColor: careRecipients.map(cr => {
          if (cr.healthScore >= 80) return '#10b981';
          if (cr.healthScore >= 60) return '#f59e0b';
          return '#ef4444';
        }),
        borderWidth: 2
      }
    ]
  };

  const riskDistribution = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [
          careRecipients.filter(cr => cr.riskLevel === 'low').length,
          careRecipients.filter(cr => cr.riskLevel === 'medium').length,
          careRecipients.filter(cr => cr.riskLevel === 'high').length
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  return (
    <div className="health-overview">
      <div className="overview-grid">
        <div className="chart-section">
          <h3>Health Scores</h3>
          <div className="chart-container small">
            <Bar data={healthScoreData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-section">
          <h3>Risk Distribution</h3>
          <div className="chart-container small">
            <Doughnut data={riskDistribution} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="summary-cards">
        {careRecipients.map(recipient => (
          <div key={recipient.id} className={`summary-card ${recipient.riskLevel}-risk`}>
            <h4>{recipient.name}</h4>
            <div className="health-score">
              <span className="score">{recipient.healthScore}</span>
              <span className="score-label">Health Score</span>
            </div>
            <div className={`risk-badge ${recipient.riskLevel}`}>
              {recipient.riskLevel.toUpperCase()} RISK
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Medication Compliance Chart Component
export const MedicationCompliance: React.FC<MedicationComplianceProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.medication),
    datasets: [
      {
        label: 'Taken',
        data: data.map(item => item.taken),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 1
      },
      {
        label: 'Missed',
        data: data.map(item => item.missed),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Medication Compliance (Last 30 Days)',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const dataIndex = context.dataIndex;
            const total = data[dataIndex].prescribed;
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `${percentage}% of prescribed`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Medications'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Doses'
        }
      }
    }
  };

  const complianceRate = data.length > 0 
    ? (data.reduce((sum, item) => sum + item.taken, 0) / data.reduce((sum, item) => sum + item.prescribed, 0)) * 100
    : 0;

  return (
    <div className="medication-compliance">
      <div className="compliance-header">
        <h3>Medication Compliance</h3>
        <div className={`compliance-rate ${complianceRate >= 90 ? 'excellent' : complianceRate >= 80 ? 'good' : complianceRate >= 70 ? 'fair' : 'poor'}`}>
          Overall: {complianceRate.toFixed(1)}%
        </div>
      </div>

      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="compliance-details">
        {data.map((item, index) => {
          const compliance = (item.taken / item.prescribed) * 100;
          return (
            <div key={index} className="medication-row">
              <div className="medication-name">{item.medication}</div>
              <div className="medication-stats">
                <span className="taken">{item.taken}/{item.prescribed}</span>
                <span className={`compliance-percentage ${compliance >= 90 ? 'excellent' : compliance >= 80 ? 'good' : compliance >= 70 ? 'fair' : 'poor'}`}>
                  {compliance.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default {
  VitalSignsTrend,
  HealthOverview,
  MedicationCompliance
};
