import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import { initializeDataStore } from './services/dataStore';
import Dashboard from './pages/Dashboard';
import MentorDiscovery from './pages/MentorDiscovery';
import ResourceLibrary from './pages/ResourceLibrary';
import Calendar from './pages/CalendarNew';
import Profile from './pages/Profile';
import Discussion from './pages/DiscussionNew';
import { NotificationProvider } from './contexts/NotificationContext';
import { SimpleAuthProvider, useSimpleAuth } from './contexts/SimpleAuthContext';
import SimpleLogin from './pages/SimpleLogin';
import SimpleRegister from './pages/SimpleRegister';
import SimpleOnboardingForm from './pages/SimpleOnboardingForm';
import VerificationPending from './pages/VerificationPending';
import SimpleVerifyEmail from './pages/SimpleVerifyEmail';
import ExpertDirectory from './pages/ExpertDirectory';
import CollaborationHub from './pages/CollaborationHub';
import MentorMatching from './pages/MentorMatching';
import Home from './pages/Home';
import Preferences from './pages/Preferences';
import MentorshipActivities from './pages/MentorshipActivities';
import MentorshipActivitiesEnhanced from './pages/MentorshipActivitiesEnhanced';
import MyMentors from './pages/MyMentors';
import MyMentees from './pages/MyMentees';
import MentorContent from './pages/MentorContent';
import AdminLogin from './pages/AdminLogin';
import AdminContentManager from './pages/AdminContentManager';
import ArticleView from './pages/ArticleView';

// New Admin Console Components
import AdminLayout from './admin/AdminLayout';
import AdminOverview from './admin/pages/AdminOverview';
import AdminUsers from './admin/pages/AdminUsers';
import AdminMentors from './admin/pages/AdminMentors';
import AdminExperts from './admin/pages/AdminExperts';
import AdminContent from './admin/pages/AdminContent';
import AdminResources from './admin/pages/AdminResources';
import AdminOpportunities from './admin/pages/AdminOpportunities';
import AdminCollaboration from './admin/pages/AdminCollaboration';
import AdminNotifications from './admin/pages/AdminNotifications';
import AdminAudit from './admin/pages/AdminAudit';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSimpleAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Simple admin route guard using localStorage token from the admin login screen
function AdminRoute({ children }: { children: React.ReactNode }) {
  const hasAdminToken = typeof window !== 'undefined' && !!localStorage.getItem('adminToken');

  if (!hasAdminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

// App Content Component
function AppContent() {
  const { isAuthenticated } = useSimpleAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPublicRoute = ['/login', '/register', '/onboarding', '/verification-pending', '/verify-email'].includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Navigation only when authenticated and not on admin or public routes */}
      {isAuthenticated && !isAdminRoute && !isPublicRoute && <Navigation />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SimpleLogin />} />
        <Route path="/register" element={<SimpleRegister />} />
        <Route path="/onboarding" element={<SimpleOnboardingForm />} />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/verify-email" element={<SimpleVerifyEmail />} />

        {/* Admin Public Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/mentors" element={<ProtectedRoute><MentorDiscovery /></ProtectedRoute>} />
        <Route path="/mentor-matching" element={<ProtectedRoute><MentorMatching /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><ResourceLibrary /></ProtectedRoute>} />
        <Route path="/discussion" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/mentorship-activities" element={<ProtectedRoute><MyMentors /></ProtectedRoute>} />
        <Route path="/mentorship-activities/:mentorId" element={<ProtectedRoute><MentorshipActivitiesEnhanced /></ProtectedRoute>} />
        <Route path="/my-mentees" element={<ProtectedRoute><MyMentees /></ProtectedRoute>} />
        <Route path="/mentor-content" element={<ProtectedRoute><MentorContent /></ProtectedRoute>} />
        <Route path="/mentor-view/mentee/:menteeId" element={<ProtectedRoute><MentorshipActivitiesEnhanced /></ProtectedRoute>} />
        <Route path="/mentorship-activities-legacy" element={<ProtectedRoute><MentorshipActivities /></ProtectedRoute>} />
        <Route path="/experts" element={<ProtectedRoute><ExpertDirectory /></ProtectedRoute>} />
        <Route path="/collaboration" element={<ProtectedRoute><CollaborationHub /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />

        {/* Admin Protected Routes - New Comprehensive Console */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="mentors" element={<AdminMentors />} />
          <Route path="experts" element={<AdminExperts />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="opportunities" element={<AdminOpportunities />} />
          <Route path="collaboration" element={<AdminCollaboration />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>

        {/* Legacy Admin Routes (for backward compatibility) */}
        <Route path="/admin/dashboard" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/admin/content-legacy" element={<AdminRoute><AdminContentManager /></AdminRoute>} />
        
        {/* Article View (accessible to all authenticated users) */}
        <Route path="/article/:id" element={<ProtectedRoute><ArticleView /></ProtectedRoute>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

function App() {
  // Initialize data store on app load
  useEffect(() => {
    initializeDataStore();
  }, []);

  return (
    <Router>
      <SimpleAuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </SimpleAuthProvider>
    </Router>
  );
}

export default App;

