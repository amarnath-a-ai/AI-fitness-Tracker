import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Dumbbell, Droplets, Moon, Scale, TrendingUp, Target,
  Zap, Heart, Award, Apple, Activity, Search, Play, CheckCircle2, ChevronRight, X, Clock, User
} from 'lucide-react';
import { useAuthStore } from '../stores/useStore';
import { dashboardAPI, trackerAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';

interface WorkoutPlanItem {
  id: string;
  name: string;
  desc: string;
  progress: number;
  level: string;
  icon: React.ComponentType<any>;
}

interface PopularWorkout {
  id: string;
  name: string;
  calories: number;
  duration: number;
  image: string;
  desc: string;
  rounds: { name: string; duration: string }[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Dashboard() {
  const { user, selectedWorkout, setSelectedWorkout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyWater, setDailyWater] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const popularWorkouts: PopularWorkout[] = [
    {
      id: 'lower-body',
      name: 'Lower Body Training',
      calories: 500,
      duration: 50,
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&h=400&q=80',
      desc: 'The lower abdomen and hips are the most difficult areas of the body to reduce. Even so, you can reduce weight without tools through targeted compound movements.',
      rounds: [
        { name: 'Jumping Jacks', duration: '00:30' },
        { name: 'Squats', duration: '12 Reps' },
        { name: 'Backward Lunge', duration: '10 Reps' },
        { name: 'Glute Bridges', duration: '15 Reps' }
      ]
    },
    {
      id: 'hand-stand',
      name: 'Handstand Training',
      calories: 600,
      duration: 40,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&h=400&q=80',
      desc: 'Master the handstand split, build shoulder stability, core strength, and spatial awareness.',
      rounds: [
        { name: 'Wrist Warm-ups', duration: '02:00' },
        { name: 'Pike Hold', duration: '00:45' },
        { name: 'Wall Walk-ups', duration: '5 Reps' },
        { name: 'Kick-ups', duration: '10 Reps' }
      ]
    },
    {
      id: 'core-abs',
      name: 'Core & Abs Workout',
      calories: 320,
      duration: 20,
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&h=400&q=80',
      desc: 'A quick, high-intensity core shredder targeting the rectus abdominis, obliques, and transverse abdominis.',
      rounds: [
        { name: 'Plank Hold', duration: '01:00' },
        { name: 'Russian Twists', duration: '20 Reps' },
        { name: 'Bicycle Crunches', duration: '24 Reps' }
      ]
    }
  ];

  const todayPlans: WorkoutPlanItem[] = [
    { id: '1', name: 'Push Up', desc: '100 Push up a day', progress: 45, level: 'Intermediate', icon: Dumbbell },
    { id: '2', name: 'Sit Up', desc: '20 Sit up a day', progress: 75, level: 'Beginner', icon: Activity },
    { id: '3', name: 'Knee Push Up', desc: '50 Knee push up daily', progress: 20, level: 'Beginner', icon: Heart }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardAPI.getDashboard();
      const data = res.data?.data;
      if (data) {
        setCaloriesBurned(data.caloriesBurned || data.totalCaloriesBurned || 0);
        setTotalWorkouts(data.totalWorkouts || 0);
        setStreak(data.streak || 0);
      }
    } catch {
      // Demo fallback
      setCaloriesBurned(530);
      setTotalWorkouts(user?.totalWorkouts || 12);
      setStreak(user?.streak || 7);
    }

    // Fetch water data
    try {
      const waterRes = await trackerAPI.getDailyWater();
      const total = waterRes.data?.data?.total || 0;
      setDailyWater(Math.round(total / 250)); // Convert ml to glasses
    } catch {
      setDailyWater(5);
    }

    setLoading(false);
  };

  const handleStartWorkout = () => {
    const burned = selectedWorkout?.calories || 95;
    setCaloriesBurned(prev => prev + burned);
    toast.success(`🔥 Workout completed! You burned ${burned} kcal!`);
    setSelectedWorkout(null);
  };

  const handleAddWater = async () => {
    try {
      await trackerAPI.addWater({ amount: 250, unit: 'ml' });
      setDailyWater(prev => Math.min(prev + 1, 12));
      toast.success('💧 Logged 250ml water!');
    } catch {
      setDailyWater(prev => Math.min(prev + 1, 12));
      toast.success('💧 Logged 250ml water!');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-mobile-view">
        <div className="skeleton" style={{ height: 80, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 160, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="dashboard-mobile-view">
      {/* Search & Header */}
      <div className="dashboard-header-block">
        <div className="header-greeting-row">
          <div>
            <span className="greeting-label">{getGreeting()}</span>
            <h2 className="user-profile-name">{user?.firstName || 'User'} {user?.lastName || ''}</h2>
          </div>
          <div className="user-avatar-circle" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <User size={20} />
          </div>
        </div>

        <div className="search-bar-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search workouts, meals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="dashboard-quick-stats">
        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Flame size={18} />
          </div>
          <div>
            <div className="quick-stat-value">{caloriesBurned}</div>
            <div className="quick-stat-label">kcal burned</div>
          </div>
        </div>
        <div className="quick-stat-card" onClick={handleAddWater} style={{ cursor: 'pointer' }}>
          <div className="quick-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <Droplets size={18} />
          </div>
          <div>
            <div className="quick-stat-value">{dailyWater}/8</div>
            <div className="quick-stat-label">glasses</div>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: 'rgba(132, 204, 22, 0.1)', color: '#84cc16' }}>
            <Zap size={18} />
          </div>
          <div>
            <div className="quick-stat-value">{streak}</div>
            <div className="quick-stat-label">day streak</div>
          </div>
        </div>
      </div>

      {/* Popular Workouts */}
      <div className="section-container">
        <div className="flex-between section-title-row">
          <h3>Popular Workouts</h3>
          <span className="view-all-link" onClick={() => navigate('/workout')}>See All</span>
        </div>
        <div className="horizontal-workouts-scroll">
          {popularWorkouts
            .filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((workout) => (
              <div
                key={workout.id}
                className="popular-workout-card"
                onClick={() => setSelectedWorkout(workout)}
              >
                <img src={workout.image} alt={workout.name} className="workout-card-bg" />
                <div className="workout-card-overlay"></div>
                <div className="workout-card-badge-row">
                  <span className="badge badge-dark">{workout.calories} Kcal</span>
                  <span className="badge badge-dark">{workout.duration} Min</span>
                </div>
                <div className="workout-card-bottom">
                  <h4>{workout.name}</h4>
                  <div className="play-button-circle">
                    <Play size={16} fill="currentColor" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Today Plan */}
      <div className="section-container">
        <div className="flex-between section-title-row">
          <h3>Today Plan</h3>
          <span className="view-all-link" onClick={() => navigate('/goals')}>Edit</span>
        </div>
        <div className="today-plans-vertical-list">
          {todayPlans.map((plan) => (
            <div key={plan.id} className="today-plan-card">
              <div className="plan-icon-wrapper" style={{ color: 'var(--primary-500)' }}>
                <plan.icon size={22} />
              </div>
              <div className="plan-info">
                <div className="flex-between">
                  <h4>{plan.name}</h4>
                  <span className="plan-level-tag">{plan.level}</span>
                </div>
                <p className="plan-desc">{plan.desc}</p>
                <div className="plan-progress-container">
                  <div className="plan-progress-bar">
                    <div className="plan-progress-fill" style={{ width: `${plan.progress}%` }}></div>
                  </div>
                  <span className="plan-progress-percent">{plan.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout Detail Screen overlay */}
      <AnimatePresence>
        {selectedWorkout && (
          <motion.div
            className="workout-detail-overlay-panel"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="detail-panel-header">
              <button className="close-panel-btn" onClick={() => setSelectedWorkout(null)}>
                <X size={20} />
              </button>
              <span>Workout Detail</span>
            </div>

            <div className="detail-panel-body">
              <div className="detail-hero-wrapper">
                <img src={selectedWorkout.image} alt={selectedWorkout.name} className="detail-hero-image" />
                <div className="detail-badges-row">
                  <div className="detail-badge-pill">
                    <Clock size={16} />
                    <span>{selectedWorkout.duration} min</span>
                  </div>
                  <div className="detail-badge-pill">
                    <Flame size={16} />
                    <span>{selectedWorkout.calories} kcal</span>
                  </div>
                </div>
              </div>

              <h2 className="detail-workout-title">{selectedWorkout.name}</h2>
              <p className="detail-workout-desc">{selectedWorkout.desc}</p>

              <div className="rounds-section">
                <div className="flex-between rounds-header">
                  <h3>Rounds</h3>
                  <span className="rounds-count">1/{selectedWorkout.rounds.length}</span>
                </div>
                <div className="rounds-list">
                  {selectedWorkout.rounds.map((round: any, index: number) => (
                    <div key={index} className="round-item-card">
                      <div className="round-avatar">{index + 1}</div>
                      <div className="round-info">
                        <h4>{round.name}</h4>
                        <span>{round.duration}</span>
                      </div>
                      <button className="round-play-btn">
                        <Play size={14} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="detail-panel-footer">
              <button className="btn btn-primary btn-lg action-lets-workout" onClick={handleStartWorkout}>
                Let's Workout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
