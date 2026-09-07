import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { SplashScreen } from '../pages/SplashScreen';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TasksPage } from '../pages/TasksPage';
import { NotesPage } from '../pages/NotesPage';
import { CalendarPage } from '../pages/CalendarPage';
import { RemindersPage } from '../pages/RemindersPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { DailyTrackerPage } from '../pages/DailyTrackerPage';
import { FitnessPage } from '../pages/FitnessPage';
import { GoalsPage } from '../pages/GoalsPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { SettingsPage } from '../pages/SettingsPage';

// Component to ensure Splash Screen is shown on initial application launch
const InitialSplashCheck = ({ children }) => {
  const splashShown = sessionStorage.getItem('onespace_splash_shown');
  if (!splashShown) {
    return <Navigate to="/splash" replace />;
  }
  return children;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Splash Screen Route */}
        <Route path="/splash" element={<SplashScreen />} />

        {/* Public Auth Routes (checked for initial splash) */}
        <Route
          element={
            <InitialSplashCheck>
              <AuthLayout />
            </InitialSplashCheck>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route
          element={
            <InitialSplashCheck>
              <ProtectedRoute />
            </InitialSplashCheck>
          }
        >
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/daily-tracker" element={<DailyTrackerPage />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
