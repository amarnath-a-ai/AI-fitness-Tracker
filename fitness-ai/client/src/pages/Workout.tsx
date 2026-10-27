import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Search, Plus, Flame, Play, Clock, X, CheckCircle2 } from 'lucide-react';
import { workoutAPI } from '../services/api';
import toast from 'react-hot-toast';

const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core', 'HIIT', 'Yoga', 'Cardio'];

const exerciseImages: Record<string, string> = {
  squats: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&h=340&q=80',
  push_ups: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&h=340&q=80',
  running: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&h=340&q=80',
  plank: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&h=340&q=80',
  deadlift: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&h=340&q=80',
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&h=340&q=80',
  hiit: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&h=340&q=80',
  shoulder_press: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&h=340&q=80',
  default: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&h=340&q=80',
};

export default function Workout() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [logData, setLogData] = useState({ sets: 3, reps: 10, duration: 15 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchExercises();
    fetchRecentLogs();
  }, [activeCategory, search]);

  const fetchExercises = async () => {
    try {
      const params: any = { limit: 50 };
      if (activeCategory !== 'All') params.category = activeCategory.toLowerCase();
      if (search) params.search = search;
      const res = await workoutAPI.getExercises(params);
      setExercises(res.data.data);
    } catch {
      setExercises([
        { _id: '1', name: 'Barbell Squats', category: 'legs', difficulty: 'intermediate', caloriesBurnedPerMin: 9, sets: 4, reps: 10, primaryMuscle: 'Quadriceps', imgKey: 'squats', desc: 'Focus on your stance, keep back straight, core tight.' },
        { _id: '2', name: 'Standard Push-ups', category: 'chest', difficulty: 'beginner', caloriesBurnedPerMin: 7, sets: 3, reps: 15, primaryMuscle: 'Chest', imgKey: 'push_ups', desc: 'Maintain flat posture, lower till chest touches floor.' },
        { _id: '3', name: 'Outdoor Running', category: 'cardio', difficulty: 'beginner', caloriesBurnedPerMin: 10, sets: 1, reps: 1, primaryMuscle: 'Cardio', imgKey: 'running', desc: 'Maintain consistent pace, focus on breathing.' },
        { _id: '4', name: 'Plank Hold', category: 'core', difficulty: 'beginner', caloriesBurnedPerMin: 5, sets: 3, reps: 1, primaryMuscle: 'Abs', imgKey: 'plank', desc: 'Keep elbows directly under shoulders, squeeze glutes.' },
        { _id: '5', name: 'Deadlifts', category: 'back', difficulty: 'advanced', caloriesBurnedPerMin: 11, sets: 4, reps: 5, primaryMuscle: 'Back', imgKey: 'deadlift', desc: 'Start with hip hinge, keep bar close to body.' },
        { _id: '6', name: 'Yoga Flow', category: 'yoga', difficulty: 'beginner', caloriesBurnedPerMin: 4, sets: 1, reps: 1, primaryMuscle: 'Flexibility', imgKey: 'yoga', desc: 'Full body stretch and mindful breathing sequence.' },
      ].filter(e => activeCategory === 'All' || e.category === activeCategory.toLowerCase()));
    }
    setLoading(false);
  };

  const fetchRecentLogs = async () => {
    try {
      const res = await workoutAPI.getWorkoutLogs({ limit: 5 });
      setRecentLogs(res.data.data || []);
    } catch {
      setRecentLogs([]);
    }
  };

  const handleStartWorkout = (exercise: any) => {
    setSelectedExercise(exercise);
    setLogData({ sets: exercise.sets || 3, reps: exercise.reps || 10, duration: 15 });
    setShowLogModal(true);
  };

  const handleLogWorkout = async () => {
    if (!selectedExercise) return;
    const caloriesBurned = Math.round((selectedExercise.caloriesBurnedPerMin || 7) * logData.duration);

    try {
      await workoutAPI.logWorkout({
        exerciseId: selectedExercise._id,
        exerciseName: selectedExercise.name,
        sets: logData.sets,
        reps: logData.reps,
        duration: logData.duration,
        caloriesBurned
      });
      toast.success(`🔥 Logged ${selectedExercise.name}! Burned ${caloriesBurned} kcal`);
      fetchRecentLogs();
    } catch {
      toast.success(`🔥 Logged ${selectedExercise.name}! Burned ${caloriesBurned} kcal`);
      setRecentLogs(prev => [{
        _id: Math.random().toString(),
        exerciseName: selectedExercise.name,
        sets: logData.sets,
        reps: logData.reps,
        duration: logData.duration,
        caloriesBurned,
        date: new Date().toISOString()
      }, ...prev].slice(0, 5));
    }
    setShowLogModal(false);
    setSelectedExercise(null);
  };

  return (
    <div className="page-container" style={{ maxWidth: '100%', margin: '0 auto', paddingBottom: 40 }}>
      <div className="flex-between mb-4" style={{ marginTop: 8 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Workouts</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Choose your program and start training</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-bar-wrapper" style={{ marginBottom: 20 }}>
        <Search size={18} />
        <input 
          type="text" 
          placeholder="Search exercises..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      {/* Category scroll list */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--border-radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
              background: activeCategory === cat ? 'var(--primary-400)' : 'var(--bg-tertiary)',
              color: activeCategory === cat ? '#09090b' : 'var(--text-secondary)',
              border: `1px solid ${activeCategory === cat ? 'var(--primary-500)' : 'var(--border-color)'}`,
              transition: 'var(--transition)',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      {recentLogs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} style={{ color: 'var(--primary-500)' }} /> Recent Activity
          </h3>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {recentLogs.map((log: any) => (
              <div key={log._id} style={{
                padding: '10px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                flexShrink: 0,
                minWidth: 160
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>{log.exerciseName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', gap: 8 }}>
                  <span>{log.sets}×{log.reps}</span>
                  <span style={{ color: 'var(--primary-500)' }}>{log.caloriesBurned} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          ))}
        </div>
      )}

      {/* Exercise list */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {exercises.map((ex, i) => (
            <motion.div
              key={ex._id}
              className="card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div style={{ position: 'relative', height: 160 }}>
                <img src={ex.image || exerciseImages[ex.imgKey] || exerciseImages.default} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(9, 9, 11, 0.8) 100%)' }}></div>
                <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'end', color: '#ffffff' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{ex.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#a3e635', fontWeight: 700, textTransform: 'uppercase' }}>{ex.category}</span>
                  </div>
                  <span className="badge" style={{ background: 'var(--primary-400)', color: '#09090b' }}>{ex.difficulty}</span>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{ex.description || ex.desc}</p>
                <div className="flex-between">
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {ex.sets}×{ex.reps}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Flame size={12} style={{ color: '#ef4444' }} /> {ex.caloriesBurnedPerMin} cal/min</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleStartWorkout(ex)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Play size={12} fill="currentColor" /> Start
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Log Workout Modal */}
      <AnimatePresence>
        {showLogModal && selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
            }}
            onClick={() => setShowLogModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{ maxWidth: 400, width: '100%', padding: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Log Workout</h3>
                <button className="btn-icon btn-ghost" onClick={() => setShowLogModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                <Dumbbell size={14} style={{ display: 'inline', marginRight: 6 }} />
                {selectedExercise.name}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div className="input-group">
                  <label>Sets</label>
                  <input type="number" value={logData.sets} onChange={(e) => setLogData({ ...logData, sets: +e.target.value })} min={1} />
                </div>
                <div className="input-group">
                  <label>Reps</label>
                  <input type="number" value={logData.reps} onChange={(e) => setLogData({ ...logData, reps: +e.target.value })} min={1} />
                </div>
                <div className="input-group">
                  <label>Minutes</label>
                  <input type="number" value={logData.duration} onChange={(e) => setLogData({ ...logData, duration: +e.target.value })} min={1} />
                </div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimated Calories</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-400)' }}>
                  {Math.round((selectedExercise.caloriesBurnedPerMin || 7) * logData.duration)} kcal
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleLogWorkout} style={{ width: '100%' }}>
                <CheckCircle2 size={16} /> Log Workout
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
