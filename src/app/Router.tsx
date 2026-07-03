import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/features/auth/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import type { Permission } from '@/types/permissions'

// ─────────────────────────────────────────────────────────────
// Lazy-loaded pages
// ─────────────────────────────────────────────────────────────
const DashboardPage  = lazy(() => import('@/pages/DashboardPage'))
const LoginPage      = lazy(() => import('@/features/auth/pages/LoginPage'))
const StudentsPage   = lazy(() => import('@/features/students/pages/StudentsPage'))
const ClassesPage    = lazy(() => import('@/features/classes/pages/ClassesPage'))
const IDsPage        = lazy(() => import('@/features/ids/pages/IDsPage'))

// ─────────────────────────────────────────────────────────────
// Loaders
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Route guards
// ─────────────────────────────────────────────────────────────
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

// Renders children only if the user has the given permission;
// otherwise shows a "No access" screen.
function PermissionRoute({ permission }: { permission: Permission }) {
  const { can } = usePermissions()
  if (!can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <p className="text-lg font-semibold text-slate-700">Access Restricted</p>
        <p className="text-sm text-slate-400 mt-1">
          You don't have permission to view this page.
        </p>
      </div>
    )
  }
  return <Outlet />
}

// ─────────────────────────────────────────────────────────────
// "Coming Soon" placeholder
// ─────────────────────────────────────────────────────────────
function ComingSoon({ name, icon = '🚧' }: { name: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-lg font-semibold text-slate-700">{name}</p>
      <p className="text-sm text-slate-400 mt-1">This module is under construction</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────
export default function Router() {
  return (
    <Routes>
      {/* ── Public (guest only) ── */}
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

      {/* ── Protected app shell ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard — everyone */}
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />

          {/* ── Students ── */}
          <Route element={<PermissionRoute permission="students.view_all" />}>
            <Route
              path="/students"
              element={
                <Suspense fallback={<PageLoader />}>
                  <StudentsPage />
                </Suspense>
              }
            />
          </Route>

          {/* ── Staff ── */}
          <Route element={<PermissionRoute permission="staff.view" />}>
            <Route path="/staff" element={<ComingSoon name="Staff Management" icon="👩‍🏫" />} />
            <Route path="/staff/:id" element={<ComingSoon name="Staff Profile" icon="👤" />} />
          </Route>

          {/* ── Classes ── */}
          <Route element={<PermissionRoute permission="classes.view" />}>
            <Route
              path="/classes"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClassesPage />
                </Suspense>
              }
            />
          </Route>

          {/* ── Subjects ── */}
          <Route element={<PermissionRoute permission="subjects.view" />}>
            <Route path="/subjects" element={<ComingSoon name="Subjects" icon="📚" />} />
          </Route>

          {/* ── Timetable ── */}
          <Route element={<PermissionRoute permission="timetable.view" />}>
            <Route path="/timetable" element={<ComingSoon name="Timetable" icon="🗓️" />} />
          </Route>

          {/* ── Attendance ── */}
          <Route element={<PermissionRoute permission="attendance.manage" />}>
            <Route path="/attendance" element={<ComingSoon name="Attendance" icon="✅" />} />
          </Route>

          {/* ── Grades ── */}
          <Route element={<PermissionRoute permission="grades.manage" />}>
            <Route path="/grades" element={<ComingSoon name="Grades & Results" icon="📊" />} />
          </Route>

          {/* ── Assignments ── */}
          <Route element={<PermissionRoute permission="assignments.manage" />}>
            <Route path="/assignments" element={<ComingSoon name="Assignments" icon="📝" />} />
          </Route>

          {/* ── Fees ── */}
          <Route element={<PermissionRoute permission="fees.view_all" />}>
            <Route path="/fees" element={<ComingSoon name="Fees & Payments" icon="💵" />} />
          </Route>

          {/* ── Activities ── */}
          <Route element={<PermissionRoute permission="activities.view" />}>
            <Route path="/activities" element={<ComingSoon name="Activities & Sports" icon="🏆" />} />
          </Route>

          {/* ── Library ── */}
          <Route element={<PermissionRoute permission="library.view" />}>
            <Route path="/library" element={<ComingSoon name="Library" icon="📖" />} />
          </Route>

          {/* ── Health ── */}
          <Route element={<PermissionRoute permission="health.view_all" />}>
            <Route path="/health" element={<ComingSoon name="Health Records" icon="🏥" />} />
          </Route>

          {/* ── Transport ── */}
          <Route element={<PermissionRoute permission="transport.view" />}>
            <Route path="/transport" element={<ComingSoon name="Transport" icon="🚌" />} />
          </Route>

          {/* ── Reports ── */}
          <Route element={<PermissionRoute permission="reports.financial" />}>
            <Route path="/reports" element={<ComingSoon name="Financial Reports" icon="📈" />} />
          </Route>
          <Route element={<PermissionRoute permission="reports.academic" />}>
            <Route path="/reports/academic" element={<ComingSoon name="Academic Reports" icon="📊" />} />
          </Route>
          <Route element={<PermissionRoute permission="reports.attendance" />}>
            <Route path="/reports/attendance" element={<ComingSoon name="Attendance Reports" icon="📋" />} />
          </Route>

          {/* ── Digital IDs ── */}
          <Route element={<PermissionRoute permission="ids.issue" />}>
            <Route
              path="/digital-ids"
              element={
                <Suspense fallback={<PageLoader />}>
                  <IDsPage />
                </Suspense>
              }
            />
          </Route>

          {/* ── Settings ── */}
          <Route element={<PermissionRoute permission="school.view_settings" />}>
            <Route path="/settings" element={<ComingSoon name="School Settings" icon="⚙️" />} />
          </Route>

          {/* ── Announcements (everyone) ── */}
          <Route path="/announcements" element={<ComingSoon name="Announcements" icon="📢" />} />

          {/* ── Student self-service ── */}
          <Route path="/my-grades"      element={<ComingSoon name="My Grades" icon="📊" />} />
          <Route path="/my-attendance"  element={<ComingSoon name="My Attendance" icon="✅" />} />
          <Route path="/my-assignments" element={<ComingSoon name="My Assignments" icon="📝" />} />
          <Route path="/my-fees"        element={<ComingSoon name="My Fees" icon="💵" />} />

          {/* ── Parent self-service ── */}
          <Route path="/my-children"              element={<ComingSoon name="My Children" icon="👨‍👩‍👧" />} />
          <Route path="/my-children/grades"       element={<ComingSoon name="Children's Grades" icon="📊" />} />
          <Route path="/my-children/attendance"   element={<ComingSoon name="Children's Attendance" icon="✅" />} />
          <Route path="/my-children/fees"         element={<ComingSoon name="Children's Fees" icon="💵" />} />

          {/* ── Profile (everyone) ── */}
          <Route path="/profile" element={<ComingSoon name="My Profile" icon="👤" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
