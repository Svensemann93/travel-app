import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorFallback from './components/ErrorFallback'
import PageLoader from './components/PageLoader'
import CategoryFilterProvider from './components/CategoryFilterProvider'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const PlacesListPage = lazy(() => import('./pages/PlacesListPage'))
const TripsListPage = lazy(() => import('./pages/TripsListPage'))
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'))
const JournalsListPage = lazy(() => import('./pages/JournalsListPage'))
const JournalDetailPage = lazy(() => import('./pages/JournalDetailPage'))
const JournalReadPage = lazy(() => import('./pages/JournalReadPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const JournalSharePage = lazy(() => import('./pages/JournalSharePage'))

function App() {
  return (
    <Sentry.ErrorBoundary fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}>
      <CategoryFilterProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/places"
              element={
                <ProtectedRoute>
                  <PlacesListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <TripsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:tripId"
              element={
                <ProtectedRoute>
                  <TripDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <JournalsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/:journalId"
              element={
                <ProtectedRoute>
                  <JournalDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/:journalId/lesen"
              element={
                <ProtectedRoute>
                  <JournalReadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/share/:token" element={<JournalSharePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </Suspense>
      </CategoryFilterProvider>
    </Sentry.ErrorBoundary>
  )
}

export default App
