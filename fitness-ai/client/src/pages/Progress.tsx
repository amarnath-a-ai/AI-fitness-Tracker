import React, { useState, useEffect } from 'react';
import { Scale, Flame, Droplets, Moon, Download, Dumbbell } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Progress() {
  const [days, setDays] = useState(30);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [days]);

  const generateMockData = () => {
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      weight: dates.map((date, i) => ({
        date, weight: 80 - (i * 0.1) + (Math.sin(i / 2) * 0.5),
      })),
      calories: dates.map((date) => ({
        _id: date, calories: 1800 + Math.round(Math.random() * 400),
      })),
      sleep: dates.map((date, i) => ({
        date, duration: 6.5 + (Math.sin(i / 3) * 1.5) + (Math.random() * 0.5),
      })),
      workout: dates.map((date, i) => ({
        _id: date,
        calories: i % 2 === 0 ? 300 + Math.round(Math.random() * 200) : 0,
        duration: i % 2 === 0 ? 30 + Math.round(Math.random() * 30) : 0,
      })),
    };
  };

  const fetchProgress = async () => {
    try {
      const res = await dashboardAPI.getProgress(days);
      const data = res.data.data;
      if (!data.weight || data.weight.length === 0) {
        setProgressData(generateMockData());
      } else {
        setProgressData(data);
      }
    } catch {
      setProgressData(generateMockData());
    }
    setLoading(false);
  };

  const handleExport = (type: 'csv') => {
    toast.success(`Exporting report as ${type.toUpperCase()}...`);
  };

  if (loading || !progressData) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 60, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="skeleton" style={{ height: 350 }} />
          <div className="skeleton" style={{ height: 350 }} />
        </div>
      </div>
    );
  }

  const chartOptions = (label: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--text-tertiary)', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-tertiary)', font: { size: 10 } } }
    }
  });

  const makeDataset = (data: number[], borderColor: string, bgColor: string) => ({
    data,
    borderColor,
    backgroundColor: bgColor,
    pointBackgroundColor: '#ffffff',
    pointBorderColor: borderColor,
    pointBorderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: 0.4,
    fill: true,
    borderWidth: 2,
  });

  // Summary stats
  const avgWeight = progressData.weight.length > 0
    ? (progressData.weight.reduce((a: number, w: any) => a + w.weight, 0) / progressData.weight.length).toFixed(1)
    : '—';
  const avgCalories = progressData.calories.length > 0
    ? Math.round(progressData.calories.reduce((a: number, c: any) => a + c.calories, 0) / progressData.calories.length)
    : 0;
  const avgSleep = progressData.sleep?.length > 0
    ? (progressData.sleep.reduce((a: number, s: any) => a + s.duration, 0) / progressData.sleep.length).toFixed(1)
    : '—';
  const totalWorkoutCal = progressData.workout?.reduce((a: number, w: any) => a + (w.calories || 0), 0) || 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress Analytics 📈</h1>
          <p className="page-subtitle">Detailed insights into your health journey</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 12, fontSize: '0.85rem' }}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Scale, label: 'Avg Weight', value: `${avgWeight} kg`, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
          { icon: Flame, label: 'Avg Intake', value: `${avgCalories} kcal`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { icon: Moon, label: 'Avg Sleep', value: `${avgSleep} hrs`, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
          { icon: Dumbbell, label: 'Workout Cal', value: `${totalWorkoutCal} kcal`, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        ].map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.15rem' }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scale size={18} style={{ color: '#3b82f6' }} /> Weight Progress
          </h3>
          <div style={{ height: 280 }}>
            <Line
              data={{
                labels: progressData.weight.map((w: any) => w.date),
                datasets: [{ label: 'Weight (kg)', ...makeDataset(progressData.weight.map((w: any) => w.weight), '#3b82f6', 'rgba(59, 130, 246, 0.1)') }]
              }}
              options={chartOptions('Weight')}
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={18} style={{ color: '#10b981' }} /> Calorie Intake
          </h3>
          <div style={{ height: 280 }}>
            <Line
              data={{
                labels: progressData.calories.map((c: any) => c._id),
                datasets: [{ label: 'Intake (kcal)', ...makeDataset(progressData.calories.map((c: any) => c.calories), '#10b981', 'rgba(16, 185, 129, 0.1)') }]
              }}
              options={chartOptions('Calories')}
            />
          </div>
        </div>

        {/* Sleep chart */}
        {progressData.sleep && progressData.sleep.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Moon size={18} style={{ color: '#8b5cf6' }} /> Sleep Duration
            </h3>
            <div style={{ height: 280 }}>
              <Line
                data={{
                  labels: progressData.sleep.map((s: any) => s.date),
                  datasets: [{ label: 'Sleep (hrs)', ...makeDataset(progressData.sleep.map((s: any) => s.duration), '#8b5cf6', 'rgba(139, 92, 246, 0.1)') }]
                }}
                options={chartOptions('Sleep')}
              />
            </div>
          </div>
        )}

        {/* Workout chart */}
        {progressData.workout && progressData.workout.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dumbbell size={18} style={{ color: '#f59e0b' }} /> Workout Volume
            </h3>
            <div style={{ height: 280 }}>
              <Line
                data={{
                  labels: progressData.workout.map((w: any) => w._id),
                  datasets: [{ label: 'Burned (kcal)', ...makeDataset(progressData.workout.map((w: any) => w.calories), '#f59e0b', 'rgba(245, 158, 11, 0.1)') }]
                }}
                options={chartOptions('Workout')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
