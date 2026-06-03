import type { LucideIcon } from 'lucide-react'
import {
  Users,
  GraduationCap,
  CalendarCheck,
  DollarSign,
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  color: string
  textColor: string
}

function StatCard({ title, value, subtitle, icon: Icon, color, textColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start justify-between hover:shadow-sm transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
    </div>
  )
}

const STATS: StatCardProps[] = [
  {
    title: 'Total Students',
    value: '—',
    subtitle: 'Enrolled this term',
    icon: Users,
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    title: 'Total Teachers',
    value: '—',
    subtitle: 'Active staff members',
    icon: GraduationCap,
    color: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    title: 'Attendance Rate',
    value: '—',
    subtitle: 'Average this week',
    icon: CalendarCheck,
    color: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    title: 'Fees Collected',
    value: '—',
    subtitle: 'This term (USD)',
    icon: DollarSign,
    color: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your school's performance and activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Lower panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Recent Activity</h2>
          <p className="text-xs text-slate-400 mb-6">Latest events in your school</p>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarCheck className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-400">No recent activity</p>
            <p className="text-xs text-slate-300 mt-1">
              Activity will appear here once data is added
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Announcements</h2>
          <p className="text-xs text-slate-400 mb-6">Important notices for staff and students</p>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Users className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-400">No announcements</p>
            <p className="text-xs text-slate-300 mt-1">
              School-wide announcements will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
