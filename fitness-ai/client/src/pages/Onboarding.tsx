import React, { useState } from 'react';
import { useAuthStore } from '../stores/useStore';
import { authAPI, trackerAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Onboarding.css';

export default function Onboarding() {
  const { setOnboardingCompleted, loadUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    gender: 'male',
    dateOfBirth: '',
    height: 170,
    weight: 70,
    targetWeight: 65,
    fitnessGoal: 'maintenance',
    activityLevel: 'moderate'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }

    setLoading(true);
    try {
      // 1. Update Profile
      await authAPI.updateProfile({
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        height: Number(formData.height),
        weight: Number(formData.weight),
        targetWeight: Number(formData.targetWeight),
        fitnessGoal: formData.fitnessGoal,
        activityLevel: formData.activityLevel
      });

      // 2. Add Initial Weight Log to track progress from scratch
      await trackerAPI.addWeight({
        weight: Number(formData.weight),
        notes: 'Initial Weight',
        date: new Date()
      });

      // Update local store from backend to get virtuals (like age)
      await loadUser();

      toast.success('Profile setup complete!');
      setOnboardingCompleted(true);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to setup profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-background">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=800&q=80" alt="Athlete background" className="bg-image" />
        <div className="bg-gradient-overlay"></div>
      </div>
      
      <div className="onboarding-container">
        <div className="brand-logo mb-6" style={{ color: 'white', justifyContent: 'center' }}>
          <div className="logo-glow" style={{ background: '#a3e635', color: '#000' }}>
            <Activity size={24} />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>Athrix</span>
        </div>

        <div className="onboarding-card">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
          <div className="step-indicator">Step {step} of 3</div>

          <form onSubmit={handleSubmit} className="onboarding-form">
            <AnimatePresence mode="wait" custom={1}>
              {step === 1 && (
                <motion.div key="step1" custom={1} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                  <h2 className="step-title">Personal Info</h2>
                  <p className="step-desc">Let's get to know you better to personalize your experience.</p>
                  
                  <div className="input-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input" required />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" custom={1} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                  <h2 className="step-title">Body Metrics</h2>
                  <p className="step-desc">This helps us calculate your BMI and daily caloric needs.</p>
                  
                  <div className="input-group">
                    <label>Height (cm)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="input" min="50" max="300" required />
                  </div>

                  <div className="input-group">
                    <label>Current Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="input" min="20" max="500" required />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" custom={1} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="step-content">
                  <h2 className="step-title">Your Goals</h2>
                  <p className="step-desc">Set your targets so we can guide you effectively.</p>
                  
                  <div className="input-group">
                    <label>Target Weight (kg)</label>
                    <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="input" min="20" max="500" required />
                  </div>

                  <div className="input-group">
                    <label>Primary Fitness Goal</label>
                    <select name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} className="input">
                      <option value="weight_loss">Weight Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="endurance">Endurance</option>
                      <option value="strength">Strength</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Activity Level</label>
                    <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="input">
                      <option value="sedentary">Sedentary (Little or no exercise)</option>
                      <option value="light">Light (Exercise 1-3 days/week)</option>
                      <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                      <option value="active">Active (Exercise 6-7 days/week)</option>
                      <option value="very_active">Very Active (Hard exercise/sports)</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="onboarding-actions">
              {step > 1 ? (
                <button type="button" onClick={handlePrev} className="btn btn-outline" disabled={loading}>
                  <ArrowLeft size={18} /> Back
                </button>
              ) : (
                <button type="button" onClick={handleLogout} className="btn btn-outline" disabled={loading} style={{ borderColor: 'transparent', color: 'var(--text-secondary)' }}>
                  Log Out
                </button>
              )}
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {step < 3 ? (
                  <>Next <ArrowRight size={18} /></>
                ) : (
                  <>{loading ? 'Saving...' : 'Complete Setup'} <CheckCircle size={18} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
