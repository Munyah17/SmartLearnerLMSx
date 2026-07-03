import { useState, useRef, useEffect } from 'react'
import { Bell, Menu, LogOut, User, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/features/auth/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { supabase } from '@/lib/supabase'
import {
  ROLE_LABELS,
  STAFF_TITLE_LABELS,
  STUDENT_TITLE_LABELS,
} from '@/types/roles'
import type { UserRole, StaffTitle, StudentTitle } from '@/types/roles'
import { cn } from '@/utils/cn'

export default function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const { profile, school } = useAuthStore()
  const { hasRole, staffTitle, studentTitle, can } = usePermissions()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = profile
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : 'U'

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'User'

  // Derive the best display label for this user's role/title
  function getRoleLabel(): string {
    if (hasRole('student') && studentTitle) {
      return STUDENT_TITLE_LABELS[studentTitle as StudentTitle] ?? studentTitle.replace(/_/g, ' ')
    }
    if (staffTitle) {
      return STAFF_TITLE_LABELS[staffTitle as StaffTitle] ?? staffTitle.replace(/_/g, ' ')
    }
    if (profile) {
      return ROLE_LABELS[profile.role as UserRole] ?? profile.role
    }
    return ''
  }

  // Badge colour by system role
  function getAvatarColor(): string {
    switch (profile?.role as UserRole) {
      case 'school_admin': return 'bg-blue-600'
      case 'teacher':      return 'bg-violet-600'
      case 'finance':      return 'bg-amber-600'
      case 'admin_staff':  return 'bg-teal-600'
      case 'support_staff':return 'bg-cyan-600'
      case 'ancillary':    return 'bg-slate-500'
      case 'student':      return 'bg-emerald-600'
      case 'parent':       return 'bg-pink-600'
      default:             return 'bg-primary-600'
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      {/* Left: hamburger + school name */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {school?.name ?? 'School Management System'}
          </p>
          <p className="text-xs text-slate-400">
            {school?.academic_year ? `Academic Year ${school.academic_year}` : 'Zimbabwe'}
          </p>
        </div>
      </div>

      {/* Right: notifications + user dropdown */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-500" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative pl-3 border-l border-slate-200" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-50 transition-colors"
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              getAvatarColor(),
            )}>
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-none">{fullName}</p>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{getRoleLabel()}</p>
            </div>
          </button>

          {menuOpen && (
            <div className={cn(
              'absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50',
            )}>
              {/* Profile header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">{fullName}</p>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{getRoleLabel()}</p>
                {profile?.id_number && (
                  <p className="text-xs text-slate-300 font-mono mt-0.5">{profile.id_number}</p>
                )}
              </div>

              {/* Menu items */}
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile') }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </button>

              {can('ids.view_own') && (
                <button
                  onClick={() => { setMenuOpen(false); navigate('/profile') }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  My ID Card
                </button>
              )}

              <hr className="my-1 border-slate-100" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
