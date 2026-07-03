import { useEffect, useState } from 'react'
import { CalendarCheck, Check, X, Clock, FileWarning } from 'lucide-react'
import { useClasses } from '@/features/classes/hooks/useClasses'
import { useStudents } from '@/features/students/hooks/useStudents'
import { useAttendance, useSaveAttendance } from '../hooks/useAttendance'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type { AttendanceStatus } from '@/types/models'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: typeof Check; active: string }> = {
  present: { label: 'Present', icon: Check,       active: 'bg-emerald-600 text-white' },
  absent:  { label: 'Absent',  icon: X,           active: 'bg-red-600 text-white' },
  late:    { label: 'Late',    icon: Clock,        active: 'bg-amber-500 text-white' },
  excused: { label: 'Excused', icon: FileWarning,  active: 'bg-slate-500 text-white' },
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function AttendancePage() {
  const { data: classes = [] } = useClasses()
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(todayIso())
  const activeClassId = classId || classes[0]?.id || ''

  const { data: students = [], isLoading: studentsLoading } = useStudents({ classId: activeClassId, isActive: true })
  const { data: existing = [], isLoading: attendanceLoading } = useAttendance(activeClassId, date)
  const isLoading = studentsLoading || attendanceLoading
  const save = useSaveAttendance()

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})

  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {}
    for (const s of students) {
      const record = existing.find((e) => e.student_id === s.id)
      initial[s.id] = record?.status ?? 'present'
    }
    setStatuses(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClassId, date, students.length, existing.length])

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }))
  }

  async function handleSave() {
    await save.mutateAsync({
      classId: activeClassId,
      date,
      entries: students.map((s) => ({ student_id: s.id, status: statuses[s.id] ?? 'present' })),
    })
  }

  const presentCount = students.filter((s) => statuses[s.id] === 'present').length

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">
            {students.length > 0 ? `${presentCount} / ${students.length} present` : 'Mark daily attendance'}
          </p>
        </div>
        <Button onClick={handleSave} loading={save.isPending} disabled={!activeClassId || students.length === 0}>
          Save Attendance
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={activeClassId}
          onChange={(e) => setClassId(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          max={todayIso()}
          onChange={(e) => setDate(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {classes.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No classes yet</p>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading roster…</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No students in this class</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {students.map((s) => {
              const current = statuses[s.id] ?? 'present'
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.student_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((status) => {
                      const cfg = STATUS_CONFIG[status]
                      const Icon = cfg.icon
                      const isActive = current === status
                      return (
                        <button
                          key={status}
                          onClick={() => setStatus(s.id, status)}
                          title={cfg.label}
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                            isActive ? cfg.active : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
