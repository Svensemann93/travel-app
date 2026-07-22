import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { lazyWithReload } from './lib/lazyWithReload'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorFallback from './components/ErrorFallback'
import PageLoader from './components/PageLoader'
import CategoryFilterProvider from './components/CategoryFilterProvider'
import AchievementToast from './components/AchievementToast'

const LoginPage = lazyWithReload(() => import('./pages/LoginPage'))
const RegisterPage = lazyWithReload(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazyWithReload(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazyWithReload(() => import('./pages/ResetPasswordPage'))
const MapPage = lazyWithReload(() => import('./pages/MapPage'))
const PlacesListPage = lazyWithReload(() => import('./pages/PlacesListPage'))
const WishlistPage = lazyWithReload(() => import('./pages/WishlistPage'))
const TripsListPage = lazyWithReload(() => import('./pages/TripsListPage'))
const TripDetailPage = lazyWithReload(() => import('./pages/TripDetailPage'))
const JournalsListPage = lazyWithReload(() => import('./pages/JournalsListPage'))
const JournalDetailPage = lazyWithReload(() => import('./pages/JournalDetailPage'))
const JournalReadPage = lazyWithReload(() => import('./pages/JournalReadPage'))
const ProfilePage = lazyWithReload(() => import('./pages/ProfilePage'))
const JournalSharePage = lazyWithReload(() => import('./pages/JournalSharePage'))
const PassportPage = lazyWithReload(() => import('./pages/PassportPage'))
const YearReviewPage = lazyWithReload(() => import('./pages/YearReviewPage'))

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
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
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
            <Route
              path="/passport"
              element={
                <ProtectedRoute>
                  <PassportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <YearReviewPage />
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
        <AchievementToast />
      </CategoryFilterProvider>
    </Sentry.ErrorBoundary>
  )
}

export default App
