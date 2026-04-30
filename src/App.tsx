import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import PageSkeleton from './components/PageSkeleton';
import { initializeDataStore } from './services/dataStore';
import { NotificationProvider } from './contexts/NotificationContext';
import { SimpleAuthProvider, useSimpleAuth } from './contexts/SimpleAuthContext';

// Lazy-loaded page components
const Dashboard             = lazy(() => import('./pages/Dashboard'));
const MentorDiscovery       = lazy(() => import('./pages/MentorDiscovery'));
const ResourceLibrary       = lazy(() => import('./pages/ResourceLibrary'));
const Calendar              = lazy(() => import('./pages/CalendarNew'));
const Profile               = lazy(() => import('./pages/Profile'));
const Discussion            = lazy(() => import('./pages/DiscussionNew'));
const SimpleLogin           = lazy(() => import('./pages/SimpleLogin'));
const SimpleRegister        = lazy(() => import('./pages/SimpleRegister'));
const SimpleOnboardingForm  = lazy(() => import('./pages/SimpleOnboardingForm'));
const VerificationPending   = lazy(() => import('./pages/VerificationPending'));
const SimpleVerifyEmail     = lazy(() => import('./pages/SimpleVerifyEmail'));
const ExpertDirectory       = lazy(() => import('./pages/ExpertDirectory'));
const CollaborationHub      = lazy(() => import('./pages/CollaborationHub'));
const MentorMatching        = lazy(() => import('./pages/MentorMatching'));
const Home                  = lazy(() => import('./pages/Home'));
const Preferences           = lazy(() => import('./pages/Preferences'));
const MentorshipActivitiesEnhanced = lazy(() => import('./pages/MentorshipActivitiesEnhanced'));
const MyMentors             = lazy(() => import('./pages/MyMentors'));
const MyMentees             = lazy(() => import('./pages/MyMentees'));
const MentorContent         = lazy(() => import('./pages/MentorContent'));
const AdminLogin            = lazy(() => import('./pages/AdminLogin'));
const AdminContentManager   = lazy(() => import('./pages/AdminContentManager'));
const ArticleView           = lazy(() => import('./pages/ArticleView'));
const ForgotPassword        = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword         = lazy(() => import('./pages/ResetPassword'));

// New Admin Console Components
const AdminLayout           = lazy(() => import('./admin/AdminLayout'));
const AdminOverview         = lazy(() => import('./admin/pages/AdminOverview'));
const AdminUsers            = lazy(() => import('./admin/pages/AdminUsers'));
const AdminMentors          = lazy(() => import('./admin/pages/AdminMentors'));
const AdminExperts          = lazy(() => import('./admin/pages/AdminExperts'));
const AdminContent          = lazy(() => import('./admin/pages/AdminContent'));
const AdminResources        = lazy(() => import('./admin/pages/AdminResources'));
const AdminOpportunities    = lazy(() => import('./admin/pages/AdminOpportunities'));
const AdminCollaboration    = lazy(() => import('./admin/pages/AdminCollaboration'));
const AdminNotifications    = lazy(() => import('./admin/pages/AdminNotifications'));
const AdminAudit            = lazy(() => import('./admin/pages/AdminAudit'));
const Messages              = lazy(() => import('./pages/Messages'));

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSimpleAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Simple admin route guard — verifies the stored JWT has role: admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Decode JWT (no signature verification — server is authoritative)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    const isAdmin = payload.role === 'admin';

    if (isExpired || !isAdmin) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdmin');
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    localStorage.removeItem('adminToken');
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
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
      {/* Show Navigation only when authenticated and not on admin or public routes */}
      {isAuthenticated && !isAdminRoute && !isPublicRoute && <Navigation />}

      <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SimpleLogin />} />
        <Route path="/register" element={<SimpleRegister />} />
        <Route path="/onboarding" element={<SimpleOnboardingForm />} />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/verify-email" element={<SimpleVerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
        <Route path="/mentorship-session/:connectionId" element={<ProtectedRoute><MentorshipActivitiesEnhanced /></ProtectedRoute>} />
        <Route path="/my-mentees" element={<ProtectedRoute><MyMentees /></ProtectedRoute>} />
        <Route path="/mentor-content" element={<ProtectedRoute><MentorContent /></ProtectedRoute>} />
        <Route path="/mentor-view/mentee/:menteeId" element={<ProtectedRoute><MentorshipActivitiesEnhanced /></ProtectedRoute>} />

        <Route path="/experts" element={<ProtectedRoute><ExpertDirectory /></ProtectedRoute>} />
        <Route path="/collaboration" element={<ProtectedRoute><CollaborationHub /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
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
      </Suspense>
    </div>
  );
}

function App() {
  // Initialize data store on app load
  useEffect(() => {
    initializeDataStore();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <SimpleAuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </SimpleAuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

