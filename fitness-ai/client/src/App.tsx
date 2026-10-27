import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useThemeStore, useAuthStore } from './stores/useStore';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import AICoach from './pages/AICoach';
import Progress from './pages/Progress';
import WaterTracker from './pages/WaterTracker';
import SleepTracker from './pages/SleepTracker';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import VerifyEmail from './pages/VerifyEmail';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingCompleted, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.isEmailVerified) return <Navigate to="/verify-email" replace />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

// Onboarding Route wrapper
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingCompleted, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.isEmailVerified) return <Navigate to="/verify-email" replace />;
  if (onboardingCompleted) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Verify Email Route wrapper
function VerifyEmailRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, onboardingCompleted } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.isEmailVerified) {
    return onboardingCompleted ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

// Admin Route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Guest Route wrapper (redirects to dashboard if logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingCompleted } = useAuthStore();
  if (isAuthenticated) {
    return onboardingCompleted ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function App() {
  const { theme } = useThemeStore();
  const { onboardingCompleted, isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync user state from backend on app load
  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, loadUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/verify-email" element={<VerifyEmailRoute><VerifyEmail /></VerifyEmailRoute>} />
          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

          {/* Protected Routes with Dashboard Layout */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><DashboardLayout><Workout /></DashboardLayout></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><DashboardLayout><Nutrition /></DashboardLayout></ProtectedRoute>} />
          <Route path="/ai-coach" element={<ProtectedRoute><DashboardLayout><AICoach /></DashboardLayout></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><DashboardLayout><Progress /></DashboardLayout></ProtectedRoute>} />
          <Route path="/water" element={<ProtectedRoute><DashboardLayout><WaterTracker /></DashboardLayout></ProtectedRoute>} />
          <Route path="/sleep" element={<ProtectedRoute><DashboardLayout><SleepTracker /></DashboardLayout></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><DashboardLayout><Goals /></DashboardLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><DashboardLayout><AdminPanel /></DashboardLayout></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
