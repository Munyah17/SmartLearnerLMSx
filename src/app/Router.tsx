import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )
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
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        }
      />

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

        <Route path="/students"    element={<ComingSoon name="Students" />} />
        <Route path="/students/:id" element={<ComingSoon name="Student Detail" />} />
        <Route path="/teachers"    element={<ComingSoon name="Teachers" />} />
        <Route path="/teachers/:id" element={<ComingSoon name="Teacher Detail" />} />
        <Route path="/classes"     element={<ComingSoon name="Classes" />} />
        <Route path="/attendance"  element={<ComingSoon name="Attendance" />} />
        <Route path="/assignments" element={<ComingSoon name="Assignments" />} />
        <Route path="/grades"      element={<ComingSoon name="Grades" />} />
        <Route path="/fees"        element={<ComingSoon name="Fees" />} />
        <Route path="/settings"    element={<ComingSoon name="Settings" />} />
        <Route path="/profile"     element={<ComingSoon name="Profile" />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
