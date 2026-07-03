import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileText,
  BarChart3,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Library,
  HeartPulse,
  Bus,
  CreditCard,
  BookMarked,
  Clock,
  UserCircle,
  BarChart2,
  Bell,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/utils/cn'
import type { Permission } from '@/types/permissions'
import type { UserRole } from '@/types/roles'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
  permission?: Permission
  roles?: UserRole[]   // if set, only shown for these roles (alternative to permission)
}

interface NavSection {
  label: string
  items: NavItem[]
  permission?: Permission    // whole section is gated
  roles?: UserRole[]
}

const NAV: NavSection[] = [
  {
    label: '',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'PEOPLE',
    items: [
      { to: '/students',  icon: Users,         label: 'Students',  permission: 'students.view_all' },
      { to: '/staff',     icon: GraduationCap, label: 'Staff',     permission: 'staff.view' },
    ],
  },
  {
    label: 'ACADEMIC',
    items: [
      { to: '/classes',    icon: BookOpen,    label: 'Classes',    permission: 'classes.view' },
      { to: '/subjects',   icon: BookMarked,  label: 'Subjects',   permission: 'subjects.view' },
      { to: '/timetable',  icon: Clock,       label: 'Timetable',  permission: 'timetable.view' },
    ],
  },
  {
    label: 'TEACHING',
    items: [
      { to: '/attendance',  icon: CalendarCheck, label: 'Attendance',  permission: 'attendance.manage' },
      { to: '/grades',      icon: BarChart3,     label: 'Grades',      permission: 'grades.manage' },
      { to: '/assignments', icon: FileText,      label: 'Assignments', permission: 'assignments.manage' },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { to: '/fees',    icon: DollarSign, label: 'Fees',    permission: 'fees.view_all' },
      { to: '/reports', icon: BarChart2,  label: 'Reports', permission: 'reports.financial' },
    ],
  },
  {
    label: 'ACTIVITIES',
    items: [
      { to: '/activities', icon: Trophy, label: 'Activities & Sports', permission: 'activities.view' },
    ],
  },
  {
    label: 'FACILITIES',
    items: [
      { to: '/library',   icon: Library,     label: 'Library',   permission: 'library.view' },
      { to: '/health',    icon: HeartPulse,  label: 'Health',    permission: 'health.view_all' },
      { to: '/transport', icon: Bus,         label: 'Transport', permission: 'transport.view' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/digital-ids', icon: CreditCard, label: 'Digital IDs', permission: 'ids.issue' },
      { to: '/settings',    icon: Settings,   label: 'Settings',    permission: 'school.view_settings' },
    ],
  },
  // ── Student-facing sections ──
  {
    label: 'MY ACADEMICS',
    roles: ['student'],
    items: [
      { to: '/my-grades',      icon: BarChart3,    label: 'My Grades',      roles: ['student'] },
      { to: '/my-attendance',  icon: CalendarCheck,label: 'My Attendance',  roles: ['student'] },
      { to: '/my-assignments', icon: FileText,      label: 'My Assignments', roles: ['student'] },
      { to: '/timetable',      icon: Clock,         label: 'Timetable',      roles: ['student'] },
      { to: '/my-fees',        icon: DollarSign,    label: 'My Fees',        roles: ['student'] },
      { to: '/activities',     icon: Trophy,        label: 'Activities',     roles: ['student'] },
    ],
  },
  // ── Parent-facing sections ──
  {
    label: 'MY CHILDREN',
    roles: ['parent'],
    items: [
      { to: '/my-children',    icon: Users,         label: 'Children',        roles: ['parent'] },
      { to: '/my-children/grades',     icon: BarChart3,    label: 'Grades',    roles: ['parent'] },
      { to: '/my-children/attendance', icon: CalendarCheck,label: 'Attendance',roles: ['parent'] },
      { to: '/my-children/fees',       icon: DollarSign,   label: 'Fees',      roles: ['parent'] },
    ],
  },
  // ── Reports (academic, not financial) ──
  {
    label: 'REPORTS',
    items: [
      { to: '/reports/academic',    icon: BarChart3, label: 'Academic Reports',    permission: 'reports.academic' },
      { to: '/reports/attendance',  icon: BarChart2, label: 'Attendance Reports',  permission: 'reports.attendance' },
    ],
  },
  // ── Shared profile & announcements ──
  {
    label: '',
    items: [
      { to: '/announcements', icon: Bell,       label: 'Announcements', permission: 'announcements.view' },
      { to: '/profile',       icon: UserCircle, label: 'My Profile' },
    ],
  },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { can, hasRole } = usePermissions()

  function itemVisible(item: NavItem): boolean {
    if (item.roles) return item.roles.some(r => hasRole(r))
    if (item.permission) return can(item.permission)
    return true
  }

  function sectionVisible(section: NavSection): boolean {
    if (section.roles && !section.roles.some(r => hasRole(r))) return false
    return section.items.some(item => itemVisible(item))
  }

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full bg-slate-900 text-white flex flex-col transition-all duration-300 z-40',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-slate-700 shrink-0">
        {sidebarOpen && (
          <span className="font-bold text-base text-white flex-1 truncate">
            SmartLearner<span className="text-primary-400">LMS</span>
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors ml-auto shrink-0"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen
            ? <ChevronLeft className="w-5 h-5" />
            : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
        {NAV.map((section, si) => {
          if (!sectionVisible(section)) return null
          const visibleItems = section.items.filter(itemVisible)
          return (
            <div key={si} className="mb-1">
              {sidebarOpen && section.label && (
                <p className="px-5 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                  {section.label}
                </p>
              )}
              {!sidebarOpen && section.label && si > 0 && (
                <div className="mx-3 my-2 border-t border-slate-700/60" />
              )}
              <ul className="space-y-0.5 px-2">
                {visibleItems.map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/dashboard'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                        )
                      }
                      title={!sidebarOpen ? label : undefined}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {sidebarOpen && <span className="truncate">{label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-slate-700 shrink-0">
          <p className="text-xs text-slate-500">v0.3.0 — Phase 3</p>
        </div>
      )}
    </aside>
  )
}
