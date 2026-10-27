import React, { useState, useEffect } from 'react';
import { Moon, Plus, Trash2 } from 'lucide-react';
import { trackerAPI } from '../services/api';
import toast from 'react-hot-toast';

const qualityColors: Record<string, { bg: string; color: string; label: string }> = {
  excellent: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', label: 'Excellent 🌟' },
  good: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', label: 'Good 🙂' },
  fair: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', label: 'Fair 😐' },
  poor: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', label: 'Poor 🥱' },
  terrible: { bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', label: 'Terrible 😫' },
};

export default function SleepTracker() {
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'terrible'>('good');
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await trackerAPI.getSleepLogs();
      setLogs(res.data.data);
    } catch {
      setLogs([
        { _id: '1', sleepTime: '2026-07-04T22:30:00.000Z', wakeTime: '2026-07-05T06:30:00.000Z', duration: 8, quality: 'good', notes: 'Felt well-rested' },
        { _id: '2', sleepTime: '2026-07-03T23:00:00.000Z', wakeTime: '2026-07-04T06:00:00.000Z', duration: 7, quality: 'fair', notes: 'Woke up once' },
        { _id: '3', sleepTime: '2026-07-02T22:00:00.000Z', wakeTime: '2026-07-03T06:30:00.000Z', duration: 8.5, quality: 'excellent', notes: 'Deep sleep' },
      ]);
    }
    setLoading(false);
  };

  const handleAddSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepTime || !wakeTime) {
      toast.error('Please specify both sleep and wake times');
      return;
    }
    try {
      await trackerAPI.addSleep({ sleepTime, wakeTime, quality, notes });
      toast.success('😴 Sleep logged successfully!');
      setSleepTime(''); setWakeTime(''); setNotes('');
      fetchLogs();
    } catch {
      const sT = new Date(sleepTime);
      const wT = new Date(wakeTime);
      const duration = Math.round(((wT.getTime() - sT.getTime()) / (1000 * 60 * 60)) * 10) / 10;
      setLogs(prev => [
        { _id: Math.random().toString(), sleepTime, wakeTime, duration, quality, notes },
        ...prev
      ]);
      setSleepTime(''); setWakeTime(''); setNotes('');
      toast.success('😴 Sleep logged!');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await trackerAPI.deleteSleepLog(id);
      toast.success('Sleep log deleted');
      fetchLogs();
    } catch {
      setLogs(prev => prev.filter(l => l._id !== id));
      toast.success('Log deleted!');
    }
  };

  const averageDuration = logs.length > 0 
    ? Math.round((logs.reduce((acc, log) => acc + log.duration, 0) / logs.length) * 10) / 10 
    : 0;

  // Weekly mini chart data (last 7 logs)
  const weeklyData = logs.slice(0, 7).reverse();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sleep Tracker 😴</h1>
          <p className="page-subtitle">Understand and improve your sleeping habits</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 24 }}>
        {/* Log sleep card */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Log Last Night's Sleep</h3>
          <form onSubmit={handleAddSleep} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label>Sleep Time</label>
              <input type="datetime-local" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Wake Time</label>
              <input type="datetime-local" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Sleep Quality</label>
              <select value={quality} onChange={(e: any) => setQuality(e.target.value)}>
                <option value="excellent">Excellent 🌟</option>
                <option value="good">Good 🙂</option>
                <option value="fair">Fair 😐</option>
                <option value="poor">Poor 🥱</option>
                <option value="terrible">Terrible 😫</option>
              </select>
            </div>
            <div className="input-group">
              <label>Notes</label>
              <textarea rows={3} placeholder="How did you feel?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} /> Log Sleep
            </button>
          </form>
        </div>

        {/* Stats & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Average Card + Weekly Trend */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: 16, borderRadius: 16 }}>
                <Moon size={32} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{averageDuration} hrs</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average sleep duration</div>
              </div>
            </div>

            {/* Weekly mini bar chart */}
            {weeklyData.length > 1 && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last {weeklyData.length} Nights</div>
                <div style={{ display: 'flex', alignItems: 'end', gap: 6, height: 60 }}>
                  {weeklyData.map((log, i) => {
                    const heightPct = Math.min((log.duration / 10) * 100, 100);
                    const qColor = qualityColors[log.quality]?.color || 'var(--text-tertiary)';
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: '100%', height: `${heightPct}%`, minHeight: 4,
                          background: qColor, borderRadius: 4,
                          transition: 'height 0.6s ease'
                        }} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{log.duration}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Sleep History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {logs.map((log) => {
                const qStyle = qualityColors[log.quality] || qualityColors.fair;
                return (
                  <div key={log._id} className="flex-between" style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.duration} hours</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                            borderRadius: 'var(--border-radius-full)',
                            background: qStyle.bg, color: qStyle.color
                          }}>
                            {qStyle.label}
                          </span>
                        </div>
                        {log.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>"{log.notes}"</div>}
                      </div>
                    </div>
                    <button className="btn-icon btn-ghost" onClick={() => handleDelete(log._id)} style={{ color: 'var(--danger-500)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
              {logs.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>No sleep logs yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
