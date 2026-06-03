import { Bell, Menu } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

export default function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

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
          <p className="text-sm font-semibold text-slate-800">School Management System</p>
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

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">Admin</p>
            <p className="text-xs text-slate-400 mt-0.5">School Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
