import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/features/auth/authStore'

const DashboardPage  = lazy(() => import('@/pages/DashboardPage'))
const LoginPage      = lazy(() => import('@/features/auth/pages/LoginPage'))
const StudentsPage   = lazy(() => import('@/features/students/pages/StudentsPage'))
const ClassesPage    = lazy(() => import('@/features/classes/pages/ClassesPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )
}

function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    </div>
  )
}

function ProtectedRoute() {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function GuestRoute() {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <FullPageLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <p className="text-lg font-semibold text-slate-700">{name}</p>
      <p className="text-sm text-slate-400 mt-1">This section is under construction</p>
    </div>
  )
}

export default function Router() {
  return (
    <Routes>
      {/* Public / guest-only */}
      <Route element={<GuestRoute />}>
        <Route
          path="/login"
          element={
            <Suspense fallback={<FullPageLoader />}>
              <LoginPage />
            </Suspense>
          }
        />
      </Route>

      {/* Protected app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />

          <Route
            path="/students"
            element={
              <Suspense fallback={<PageLoader />}>
                <StudentsPage />
              </Suspense>
            }
          />

          <Route
            path="/classes"
            element={
              <Suspense fallback={<PageLoader />}>
                <ClassesPage />
              </Suspense>
            }
          />

          <Route path="/teachers"    element={<ComingSoon name="Teachers" />} />
          <Route path="/teachers/:id" element={<ComingSoon name="Teacher Detail" />} />
          <Route path="/attendance"  element={<ComingSoon name="Attendance" />} />
          <Route path="/assignments" element={<ComingSoon name="Assignments" />} />
          <Route path="/grades"      element={<ComingSoon name="Grades" />} />
          <Route path="/fees"        element={<ComingSoon name="Fees" />} />
          <Route path="/settings"    element={<ComingSoon name="Settings" />} />
          <Route path="/profile"     element={<ComingSoon name="Profile" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
