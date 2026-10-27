import React, { useState } from 'react';
import { useAuthStore } from '../stores/useStore';
import { User, Award, Calendar, Activity, Flame, Target, TrendingUp, Zap, Edit2, X, Save } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, loadUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || 'male',
    height: user?.height || 170,
    weight: user?.weight || 70,
    activityLevel: user?.activityLevel || 'moderate',
    fitnessGoal: user?.fitnessGoal || 'maintenance',
  });
  const [saving, setSaving] = useState(false);

  const weight = user?.weight || 72;
  const heightCm = user?.height || 175;
  const heightM = heightCm / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);
  const bmiCategory = Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal' : Number(bmi) < 30 ? 'Overweight' : 'Obese';
  const bmiColor = Number(bmi) < 18.5 ? '#f59e0b' : Number(bmi) < 25 ? '#10b981' : Number(bmi) < 30 ? '#f59e0b' : '#ef4444';

  const stats = [
    { icon: Activity, label: 'Total Workouts', value: user?.totalWorkouts || 0, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { icon: Flame, label: 'Total Calories', value: `${user?.totalCaloriesBurned || 0} kcal`, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { icon: Zap, label: 'Current Streak', value: `${user?.streak || 0} days`, color: '#84cc16', bg: 'rgba(132, 204, 22, 0.1)' },
    { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().getFullYear(), color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  ];

  const totalWorkouts = user?.totalWorkouts || 0;
  const streak = user?.streak || 0;
  const achievements = [
    { name: 'First Workout', desc: 'Complete your first workout', unlocked: totalWorkouts >= 1, icon: '🏋️' },
    { name: '10 Workouts', desc: 'Complete 10 total workouts', unlocked: totalWorkouts >= 10, icon: '💪' },
    { name: 'Week Warrior', desc: '7-day streak', unlocked: streak >= 7, icon: '🔥' },
    { name: 'Consistency King', desc: '30-day streak', unlocked: streak >= 30, icon: '👑' },
    { name: 'Century Club', desc: 'Complete 100 total workouts', unlocked: totalWorkouts >= 100, icon: '🏆' },
    { name: 'Iron Will', desc: '60-day streak', unlocked: streak >= 60, icon: '🦾' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(formData);
      await loadUser();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your fitness identity</p>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <Edit2 size={18} /> Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Edit Profile</h2>
            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label">First Name</label>
              <input className="form-input" type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input className="form-input" type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select className="form-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Height (cm)</label>
              <input className="form-input" type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
            </div>
            <div>
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
            </div>
            <div>
              <label className="form-label">Activity Level</label>
              <select className="form-input" value={formData.activityLevel} onChange={e => setFormData({...formData, activityLevel: e.target.value})}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <div>
              <label className="form-label">Fitness Goal</label>
              <select className="form-input" value={formData.fitnessGoal} onChange={e => setFormData({...formData, fitnessGoal: e.target.value})}>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="endurance">Endurance</option>
                <option value="strength">Strength</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
        {/* Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            fontSize: '1.5rem', fontWeight: 900
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
            {user?.firstName || 'User'} {user?.lastName || ''}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{user?.email}</p>
          <span className="badge badge-primary" style={{ marginBottom: 24, display: 'inline-block' }}>{user?.role || 'Member'}</span>

          {/* BMI Card */}
          <div style={{
            padding: 20, background: 'var(--bg-tertiary)', borderRadius: 16,
            marginBottom: 16, border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Body Mass Index</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: bmiColor }}>{bmi}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: bmiColor, marginBottom: 8 }}>{bmiCategory}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              <span>{weight} kg</span>
              <span>{heightCm} cm</span>
              <span>{user?.age || 25} yrs</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{user?.fitnessGoal?.replace('_', ' ') || 'General Fitness'}</span>
            <span className="badge badge-warm" style={{ textTransform: 'capitalize' }}>{user?.activityLevel?.replace('_', ' ') || 'Moderate'}</span>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {stats.map((stat, idx) => (
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

          {/* Achievements */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} style={{ color: '#f59e0b' }} /> Achievements
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {achievements.map((ach, idx) => (
                <div key={idx} style={{
                  padding: 16, textAlign: 'center', borderRadius: 16,
                  background: ach.unlocked ? 'rgba(132, 204, 22, 0.08)' : 'var(--bg-tertiary)',
                  border: `1px solid ${ach.unlocked ? 'rgba(132, 204, 22, 0.2)' : 'var(--border-color)'}`,
                  opacity: ach.unlocked ? 1 : 0.4,
                  transition: 'var(--transition)'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{ach.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{ach.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{ach.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
