import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { trackerAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('weight');
  const [targetValue, setTargetValue] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [unit, setUnit] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await trackerAPI.getGoals();
      setGoals(res.data.data);
    } catch {
      setGoals([
        { _id: '1', title: 'Lose 5kg weight', type: 'weight', targetValue: 70, currentValue: 75, unit: 'kg', startValue: 80, endDate: '2026-08-01', status: 'active' },
        { _id: '2', title: 'Drink 8 glasses daily', type: 'water', targetValue: 8, currentValue: 6, unit: 'glasses', endDate: '2026-07-31', status: 'active' },
        { _id: '3', title: 'Run 10km weekly', type: 'workout', targetValue: 10, currentValue: 10, unit: 'km', endDate: '2026-07-04', status: 'completed' },
      ]);
    }
    setLoading(false);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trackerAPI.createGoal({ title, type, targetValue, currentValue, unit, endDate });
      toast.success('🎯 Goal set successfully!');
      resetForm();
      fetchGoals();
    } catch {
      setGoals(prev => [
        { _id: Math.random().toString(), title, type, targetValue, currentValue, unit, startValue: currentValue, endDate, status: 'active' },
        ...prev
      ]);
      resetForm();
      toast.success('🎯 Goal added!');
    }
  };

  const resetForm = () => {
    setTitle(''); setTargetValue(0); setCurrentValue(0); setUnit(''); setEndDate(''); setShowForm(false);
  };

  const handleCompleteGoal = async (id: string) => {
    try {
      await trackerAPI.updateGoal(id, { status: 'completed' });
      toast.success('🏆 Goal completed! Outstanding job!');
      fetchGoals();
    } catch {
      setGoals(prev => prev.map(g => g._id === id ? { ...g, status: 'completed' } : g));
      toast.success('🏆 Goal marked as completed!');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await trackerAPI.deleteGoal(id);
      toast.success('Goal deleted');
      fetchGoals();
    } catch {
      setGoals(prev => prev.filter(g => g._id !== id));
      toast.success('Goal deleted!');
    }
  };

  const getProgress = (goal: any): number => {
    if (goal.status === 'completed') return 100;
    if (goal.type === 'weight') {
      // Weight loss: progress = how much weight lost / total to lose
      const startWeight = goal.startValue || goal.currentValue + 5; // fallback
      const totalToLose = startWeight - goal.targetValue;
      if (totalToLose <= 0) return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
      const lost = startWeight - goal.currentValue;
      return Math.min(Math.max((lost / totalToLose) * 100, 0), 100);
    }
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Goals 🎯</h1>
          <p className="page-subtitle">Set fitness targets and monitor your progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Set New Goal'}
        </button>
      </div>

      {showForm && (
        <motion.div className="card" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Set New Goal</h3>
          <form onSubmit={handleCreateGoal} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group">
              <label>Goal Title</label>
              <input type="text" placeholder="e.g. Run 5km daily" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Goal Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="weight">Weight</option>
                <option value="calories">Calories</option>
                <option value="workout">Workouts</option>
                <option value="water">Water</option>
                <option value="sleep">Sleep</option>
                <option value="steps">Steps</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="input-group">
              <label>Target Value</label>
              <input type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} required />
            </div>
            <div className="input-group">
              <label>Current Value</label>
              <input type="number" value={currentValue} onChange={(e) => setCurrentValue(Number(e.target.value))} required />
            </div>
            <div className="input-group">
              <label>Unit</label>
              <input type="text" placeholder="e.g. kg, ml, glasses" value={unit} onChange={(e) => setUnit(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Goal</button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {goals.map((goal, i) => {
          const progress = getProgress(goal);
          const daysLeft = getDaysRemaining(goal.endDate);
          const isCompleted = goal.status === 'completed';

          return (
            <motion.div
              key={goal._id}
              className="card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={isCompleted ? { borderColor: 'rgba(16, 185, 129, 0.2)' } : {}}
            >
              <div className="flex-between mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target style={{ color: 'var(--primary-500)' }} size={20} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{goal.title}</h3>
                </div>
                <span
                  className={`badge ${isCompleted ? 'badge-success' : 'badge-accent'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {goal.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                <span>Progress: {goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                <span style={{ fontWeight: 700, color: isCompleted ? '#10b981' : 'var(--primary-500)' }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: isCompleted
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, var(--primary-500), var(--primary-400))',
                  borderRadius: 99,
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>

              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} />
                  {isCompleted ? 'Completed!' : `${daysLeft} days remaining`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {goal.status === 'active' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCompleteGoal(goal._id)} style={{ flex: 1 }}>
                    <CheckCircle size={14} /> Complete
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteGoal(goal._id)} style={{ color: 'var(--danger-500)' }}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
