import type { LucideIcon } from 'lucide-react'
import {
  Users, GraduationCap, CalendarCheck, DollarSign,
  BookOpen, Trophy, CreditCard, TrendingUp,
  AlertCircle, CheckCircle2, Clock, FileText,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { STAFF_TITLE_LABELS, STUDENT_TITLE_LABELS } from '@/types/roles'
import type { StaffTitle, StudentTitle } from '@/types/roles'

// ─────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  color: string
  textColor: string
  trend?: string
}

function StatCard({ title, value, subtitle, icon: Icon, color, textColor, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start justify-between hover:shadow-sm transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        {trend && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
    </div>
  )
}

function EmptyPanel({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon className="w-10 h-10 text-slate-200 mb-3" />
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="text-xs text-slate-300 mt-1">{subtitle}</p>
    </div>
  )
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-0.5">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mb-5">{subtitle}</p>}
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Role-specific dashboards
// ─────────────────────────────────────────────────────────────

function AdminDashboard() {
  const stats: StatCardProps[] = [
    { title: 'Total Students', value: '—', subtitle: 'Enrolled this term',  icon: Users,         color: 'bg-blue-50',    textColor: 'text-blue-600' },
    { title: 'Total Staff',    value: '—', subtitle: 'Active staff members',icon: GraduationCap, color: 'bg-violet-50',  textColor: 'text-violet-600' },
    { title: 'Attendance Rate',value: '—', subtitle: 'Average this week',   icon: CalendarCheck, color: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'Fees Collected', value: '—', subtitle: 'This term (USD)',      icon: DollarSign,    color: 'bg-amber-50',   textColor: 'text-amber-600' },
  ]
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Recent Activity" subtitle="Latest events in your school">
          <EmptyPanel icon={CalendarCheck} title="No recent activity" subtitle="Activity will appear here once data is added" />
        </Panel>
        <Panel title="Announcements" subtitle="School-wide notices">
          <EmptyPanel icon={Users} title="No announcements" subtitle="Post announcements from the Announcements module" />
        </Panel>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg"><BookOpen className="w-4 h-4 text-blue-600" /></div>
            <span className="text-sm font-semibold text-slate-700">Classes</span>
          </div>
          <p className="text-xs text-slate-500">No classes yet. Create your first class to start organising students.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg"><DollarSign className="w-4 h-4 text-amber-600" /></div>
            <span className="text-sm font-semibold text-slate-700">Outstanding Fees</span>
          </div>
          <p className="text-xs text-slate-500">Fee tracking will appear here once students are enrolled and fees are raised.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-violet-50 rounded-lg"><CreditCard className="w-4 h-4 text-violet-600" /></div>
            <span className="text-sm font-semibold text-slate-700">Digital IDs</span>
          </div>
          <p className="text-xs text-slate-500">Issue QR-code ID cards to staff and students from the Digital IDs module.</p>
        </div>
      </div>
    </div>
  )
}

function TeacherDashboard() {
  const quickLinks = [
    { icon: CalendarCheck, label: 'Take Attendance', href: '/attendance', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { icon: BarChart3Stub, label: 'Enter Grades',    href: '/grades',     color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { icon: FileText,      label: 'Assignments',      href: '/assignments',color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
    { icon: Trophy,        label: 'Activities',       href: '/activities', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  ]
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="My Classes"       value="—" subtitle="Assigned this term"  icon={BookOpen}      color="bg-blue-50"    textColor="text-blue-600" />
        <StatCard title="Students"         value="—" subtitle="Across all classes"   icon={Users}         color="bg-violet-50"  textColor="text-violet-600" />
        <StatCard title="Pending Grades"   value="—" subtitle="Awaiting entry"       icon={AlertCircle}   color="bg-amber-50"   textColor="text-amber-600" />
        <StatCard title="Today Attendance" value="—" subtitle="Taken / Not taken"    icon={CalendarCheck} color="bg-emerald-50" textColor="text-emerald-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Quick Actions" subtitle="Common tasks">
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ icon: Icon, label, href, color }) => (
              <a key={href} href={href}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${color}`}>
                <Icon className="w-4 h-4" />
                {label}
              </a>
            ))}
          </div>
        </Panel>
        <Panel title="Announcements" subtitle="School-wide notices">
          <EmptyPanel icon={Users} title="No announcements" subtitle="School announcements will appear here" />
        </Panel>
      </div>
    </div>
  )
}

function FinanceDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Total Fees Due"   value="—" subtitle="This term (USD)"   icon={DollarSign}    color="bg-amber-50"   textColor="text-amber-600" />
        <StatCard title="Fees Collected"   value="—" subtitle="Paid this term"    icon={CheckCircle2}  color="bg-emerald-50" textColor="text-emerald-600" />
        <StatCard title="Outstanding"      value="—" subtitle="Awaiting payment"  icon={AlertCircle}   color="bg-red-50"     textColor="text-red-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Recent Payments" subtitle="Latest fee transactions">
          <EmptyPanel icon={DollarSign} title="No payments recorded" subtitle="Payments will appear once fees are raised and collected" />
        </Panel>
        <Panel title="Outstanding Accounts" subtitle="Students with unpaid fees">
          <EmptyPanel icon={AlertCircle} title="No outstanding accounts" subtitle="All students are up to date" />
        </Panel>
      </div>
    </div>
  )
}

function StudentDashboard() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Attendance"      value="—" subtitle="This term"        icon={CalendarCheck} color="bg-emerald-50" textColor="text-emerald-600" />
        <StatCard title="Average Grade"   value="—" subtitle="This term"        icon={TrendingUp}    color="bg-blue-50"    textColor="text-blue-600" />
        <StatCard title="Assignments Due" value="—" subtitle="Pending"          icon={Clock}         color="bg-amber-50"   textColor="text-amber-600" />
        <StatCard title="Fees Balance"    value="—" subtitle="Outstanding"      icon={DollarSign}    color="bg-violet-50"  textColor="text-violet-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Today's Timetable" subtitle="Your schedule for today">
          <EmptyPanel icon={BookOpen} title="No timetable yet" subtitle="Your timetable will appear once it's published" />
        </Panel>
        <Panel title="Recent Grades" subtitle="Your latest results">
          <EmptyPanel icon={TrendingUp} title="No grades yet" subtitle="Grades will appear once your teacher enters them" />
        </Panel>
      </div>
      <Panel title="Announcements" subtitle="From school administration">
        <EmptyPanel icon={Users} title="No announcements" subtitle="School announcements will appear here" />
      </Panel>
    </div>
  )
}

function ParentDashboard() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Children Enrolled" value="—" subtitle="At this school"   icon={Users}         color="bg-blue-50"    textColor="text-blue-600" />
        <StatCard title="Fees Outstanding"  value="—" subtitle="Total due (USD)"  icon={DollarSign}    color="bg-amber-50"   textColor="text-amber-600" />
        <StatCard title="Attendance Today"  value="—" subtitle="Present / Absent" icon={CalendarCheck} color="bg-emerald-50" textColor="text-emerald-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Children's Progress" subtitle="Academic overview">
          <EmptyPanel icon={TrendingUp} title="No data yet" subtitle="Progress will appear once grades are entered" />
        </Panel>
        <Panel title="Announcements" subtitle="From the school">
          <EmptyPanel icon={Users} title="No announcements" subtitle="School notices will appear here" />
        </Panel>
      </div>
    </div>
  )
}

function AncillaryDashboard() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Panel title="Announcements" subtitle="Important school notices">
        <EmptyPanel icon={Users} title="No announcements" subtitle="School announcements will appear here" />
      </Panel>
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Your Digital ID</p>
        <p className="text-xs text-slate-400 mt-1">
          Visit the profile page to view or print your school ID card.
        </p>
        <a href="/profile" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline">
          View My Profile →
        </a>
      </div>
    </div>
  )
}

// Stub import to avoid circular issue with lucide
const BarChart3Stub = TrendingUp

// ─────────────────────────────────────────────────────────────
// Main — pick the right dashboard by role
// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { profile, school } = useAuthStore()
  const { hasRole, staffTitle, studentTitle } = usePermissions()

  const titleLabel = hasRole('student') && studentTitle
    ? STUDENT_TITLE_LABELS[studentTitle as StudentTitle] ?? studentTitle
    : staffTitle
      ? STAFF_TITLE_LABELS[staffTitle as StaffTitle] ?? staffTitle.replace(/_/g, ' ')
      : null

  const greeting = profile
    ? `Welcome back, ${profile.first_name}${titleLabel ? ` (${titleLabel})` : ''}`
    : 'Welcome'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {greeting} · {school?.name ?? 'School Management System'}
        </p>
      </div>

      {/* Role-specific content */}
      {hasRole(['school_admin', 'admin_staff']) && <AdminDashboard />}
      {hasRole('teacher') && <TeacherDashboard />}
      {hasRole('finance') && <FinanceDashboard />}
      {hasRole('student') && <StudentDashboard />}
      {hasRole('parent') && <ParentDashboard />}
      {hasRole(['ancillary', 'support_staff']) && <AncillaryDashboard />}
    </div>
  )
}
