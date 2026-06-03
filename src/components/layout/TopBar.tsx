import { useState, useRef, useEffect } from 'react'
import { Bell, Menu, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/features/auth/authStore'
import { supabase } from '@/lib/supabase'
import { ROLE_LABELS } from '@/types/roles'
import { cn } from '@/utils/cn'

export default function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const { profile, school } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = profile
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : 'U'

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'User'
  const roleLabel = profile ? ROLE_LABELS[profile.role] : ''

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
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {school?.name ?? 'School Management System'}
          </p>
          <p className="text-xs text-slate-400">Zimbabwe</p>
        </div>
      </div>

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
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-none">{fullName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{roleLabel}</p>
            </div>
          </button>

          {menuOpen && (
            <div className={cn(
              'absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50',
            )}>
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile') }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
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
