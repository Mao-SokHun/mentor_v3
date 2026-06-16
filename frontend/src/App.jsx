import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks'
import { LanguageProvider } from '@/i18n'
import { MentorQuickViewProvider } from '@/contexts/MentorQuickViewContext'
import { PlatformContentProvider } from '@/contexts/PlatformContentContext'
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import CreateAccount from './pages/auth/CreateAccount'
import CompleteProfile from './pages/onboarding/CompleteProfile'
import CompleteMentorProfile from './pages/onboarding/CompleteMentorProfile'
import ChooseCommunity from './pages/onboarding/ChooseCommunity'
import MentorSubscription from './pages/mentor/MentorSubscription'
import Home from './pages/student/Home'
import Schedule from './pages/student/Schedule'
import SchedulePostDetail from './pages/student/SchedulePostDetail'
import Community from './pages/student/Community'
import Profile from './pages/student/Profile'
import StudentEditProfile from './pages/student/StudentEditProfile'
import Notifications from './pages/student/Notifications'
import BookSession from './pages/student/BookSession'
import SessionReview from './pages/student/SessionReview'
import StudentBookings from './pages/student/StudentBookings'
import MentorHome from './pages/mentor/MentorHome'
import ProfileSetting from './pages/mentor/ProfileSetting'
import Analytics from './pages/mentor/Analytics'
import EditProfile from './pages/mentor/EditProfile'
import MentorPublicProfile from './pages/mentor/MentorPublicProfile'
import MentorMyProfile from './pages/mentor/MentorMyProfile'
import MentorBilling from './pages/mentor/MentorBilling'
import PaymentSuccess from './pages/mentor/PaymentSuccess'
import PaymentCancel from './pages/mentor/PaymentCancel'
import MentorCreatePost from './pages/mentor/MentorCreatePost'
import MentorEditPost from './pages/mentor/MentorEditPost'
import CreateCommunity from './pages/community/CreateCommunity'
import CommunityCreatePost from './pages/community/CommunityCreatePost'
import CommunityDetail from './pages/community/CommunityDetail'
import CommunityPostDetail from './pages/community/CommunityPostDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import MentorManagement from './pages/admin/MentorManagement'
import SessionManagement from './pages/admin/SessionManagement'
import PlatformCatalog from './pages/admin/PlatformCatalog'
import ContentManagement from './pages/admin/ContentManagement'
import SystemReports from './pages/admin/SystemReports'
import RoleManagement from './pages/admin/RoleManagement'
import AdminSettings from './pages/admin/AdminSettings'
import HelpCenter from './pages/admin/HelpCenter'
import TermsOfService from './pages/admin/TermsOfService'
import PrivacyPolicy from './pages/admin/PrivacyPolicy'
import ContactSupport from './pages/admin/ContactSupport'
import Billing from './pages/admin/Billing'
import { LegalWrapper } from '@/components'
import {
  Landing,
  NotFound,
  Messages,
  SearchResults,
  Leaderboard,
  MentorDetail,
  Contact,
  Help,
  Privacy,
  Terms,
} from './pages'
import TermsInApp from './pages/legal/TermsInApp'
import PrivacyInApp from './pages/legal/PrivacyInApp'

const AdminOrPublicHelp = ({ AdminPage }) => {
  const { user } = useAuth()
  if (user?.role === 'admin') {
    return (
      <ProtectedRoute role="admin">
        <AdminLayout><AdminPage /></AdminLayout>
      </ProtectedRoute>
    )
  }
  return <Navigate to="/help" replace />
}

const AdminOrPublicContact = ({ AdminPage }) => {
  const { user } = useAuth()
  if (user?.role === 'admin') {
    return (
      <ProtectedRoute role="admin">
        <AdminLayout><AdminPage /></AdminLayout>
      </ProtectedRoute>
    )
  }
  return <Navigate to="/contact" replace />
}

/** Root: redirect logged-in users to their home page, guests see Landing */
const RootRedirect = () => {
  const { user } = useAuth()
  if (!user) return <Landing />
  if (user.role === 'mentor') return <Navigate to="/mentor/home" replace />
  if (user.role === 'admin')   return <Navigate to="/admin" replace />
  return <Navigate to="/home" replace />
}

/** /profile — student page; mentors go to their own profile route */
const ProfileRoute = () => {
  const { user } = useAuth()
  if (user?.role === 'mentor') return <Navigate to="/mentor/my-profile" replace />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return (
    <ProtectedRoute role="student">
      <MainLayout><Profile /></MainLayout>
    </ProtectedRoute>
  )
}

const AppRoutes = () => (
  <Routes>
    {/* Root */}
    <Route path="/" element={<RootRedirect />} />

    {/* Public auth */}
    <Route path="/login"          element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/admin/login"    element={<Navigate to="/login" replace />} />
    <Route path="/create-account" element={<CreateAccount />} />
    <Route path="/mentor/landing" element={<Navigate to="/create-account?role=mentor" replace />} />
    <Route path="/mentor/subscription" element={
      <ProtectedRoute role="mentor">
        <MainLayout><MentorSubscription /></MainLayout>
      </ProtectedRoute>
    } />

    {/* Onboarding */}
    <Route path="/onboarding/complete-profile" element={<CompleteProfile />} />
    <Route path="/onboarding/complete-mentor-profile" element={<CompleteMentorProfile />} />
    <Route path="/onboarding/choose-community" element={<ChooseCommunity />} />

    {/* ───── SHARED browse (student + mentor) — see constants/student/studentRoutes.js ───── */}
    <Route path="/home" element={
      <ProtectedRoute role={null}>
        <MainLayout><Home /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/schedule" element={
      <ProtectedRoute role={null}>
        <MainLayout><Schedule /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/schedule/post/:postId" element={
      <ProtectedRoute role={null}>
        <MainLayout><SchedulePostDetail /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/search" element={
      <ProtectedRoute role={null}>
        <MainLayout><SearchResults /></MainLayout>
      </ProtectedRoute>
    } />

    {/* ───── STUDENT-only — see STUDENT_ROUTES in studentRoutes.js ───── */}
    <Route path="/profile" element={<ProfileRoute />} />
    <Route path="/student/edit-profile" element={
      <ProtectedRoute role="student">
        <MainLayout><StudentEditProfile /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/student/bookings" element={
      <ProtectedRoute role="student">
        <MainLayout><StudentBookings /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/book/:mentorId" element={
      <ProtectedRoute role="student">
        <BookSession />
      </ProtectedRoute>
    } />
    <Route path="/session/:sessionId/review" element={
      <ProtectedRoute role="student">
        <SessionReview />
      </ProtectedRoute>
    } />

    {/* ───── TEACHER routes (MainLayout sidebar) ───── */}
    <Route path="/mentor/home" element={
      <ProtectedRoute role="mentor">
        <MainLayout><MentorHome /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/analytics" element={
      <ProtectedRoute role="mentor">
        <MainLayout><Analytics /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/settings" element={
      <ProtectedRoute role="mentor">
        <MainLayout><ProfileSetting /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/edit-profile" element={
      <ProtectedRoute role="mentor">
        <MainLayout><EditProfile /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/my-profile" element={
      <ProtectedRoute role="mentor">
        <MainLayout><MentorMyProfile /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/billing" element={
      <ProtectedRoute role="mentor">
        <MainLayout><MentorBilling /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/payment/success" element={
      <ProtectedRoute role="mentor">
        <MainLayout><PaymentSuccess /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/payment/cancel" element={
      <ProtectedRoute role="mentor">
        <MainLayout><PaymentCancel /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/create-post" element={
      <ProtectedRoute role="mentor">
        <MainLayout><MentorCreatePost /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/schedule" element={<Navigate to="/mentor/home" replace />} />
    <Route path="/mentor/edit-post/:postId" element={
      <ProtectedRoute role="mentor">
        <MainLayout><MentorEditPost /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/profile/:id" element={
      <ProtectedRoute role="mentor">
        <MainLayout><MentorPublicProfile /></MainLayout>
      </ProtectedRoute>
    } />

    {/* ───── SHARED routes (student + teacher) ───── */}
    <Route path="/community" element={
      <ProtectedRoute role={null}>
        <MainLayout><Community /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/community/create" element={
      <ProtectedRoute role={null}>
        <MainLayout><CreateCommunity /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/community/create-post" element={
      <ProtectedRoute role={null}>
        <MainLayout><CommunityCreatePost /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/community/post/:postId" element={
      <ProtectedRoute role={null}>
        <MainLayout><CommunityPostDetail /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/community/:id" element={
      <ProtectedRoute role={null}>
        <MainLayout><CommunityDetail /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/messages" element={
      <ProtectedRoute role={null}>
        <MainLayout><Messages /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/notifications" element={
      <ProtectedRoute role={null}>
        <MainLayout><Notifications /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/leaderboard" element={
      <ProtectedRoute role={null}>
        <MainLayout><Leaderboard /></MainLayout>
      </ProtectedRoute>
    } />
    <Route path="/mentor/:id" element={
      <ProtectedRoute role={null}>
        <MainLayout><MentorDetail /></MainLayout>
      </ProtectedRoute>
    } />

    {/* ───── ADMIN routes (AdminLayout) ───── */}
    <Route path="/admin" element={
      <ProtectedRoute role="admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/users" element={
      <ProtectedRoute role="admin">
        <AdminLayout><UserManagement /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/mentors" element={
      <ProtectedRoute role="admin">
        <AdminLayout><MentorManagement /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/sessions" element={
      <ProtectedRoute role="admin">
        <AdminLayout><SessionManagement /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/content" element={
      <ProtectedRoute role="admin">
        <AdminLayout><ContentManagement /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/catalog" element={
      <ProtectedRoute role="admin">
        <AdminLayout><PlatformCatalog /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/reports" element={
      <ProtectedRoute role="admin">
        <AdminLayout><SystemReports /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/roles" element={
      <ProtectedRoute role="admin">
        <AdminLayout><RoleManagement /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/settings" element={
      <ProtectedRoute role="admin">
        <AdminLayout><AdminSettings /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/help" element={<AdminOrPublicHelp AdminPage={HelpCenter} />} />
    <Route path="/admin/terms" element={
      <ProtectedRoute role="admin">
        <AdminLayout><TermsOfService /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/privacy" element={
      <ProtectedRoute role="admin">
        <AdminLayout><PrivacyPolicy /></AdminLayout>
      </ProtectedRoute>
    } />
    <Route path="/admin/contact" element={<AdminOrPublicContact AdminPage={ContactSupport} />} />
    <Route path="/admin/billing" element={
      <ProtectedRoute role="admin">
        <AdminLayout><Billing /></AdminLayout>
      </ProtectedRoute>
    } />

    {/* Legal — guest: landing navbar; student/teacher: MainLayout navbar */}
    <Route
      path="/privacy"
      element={<LegalWrapper inApp={PrivacyInApp} public={Privacy} />}
    />
    <Route
      path="/terms"
      element={<LegalWrapper inApp={TermsInApp} public={Terms} />}
    />
    {/* Help & contact — always public pages (no login); in-app users get “Back to app” bar */}
    <Route path="/help" element={<Help />} />
    <Route path="/contact" element={<Contact />} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
)

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <PlatformContentProvider>
            <MentorQuickViewProvider>
              <AppRoutes />
            </MentorQuickViewProvider>
          </PlatformContentProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
