import { useState } from 'react'
import { CalendarClock, Plus } from 'lucide-react'
import { useClasses } from '@/features/classes/hooks/useClasses'
import { useTimetable, useUpsertSlot, useDeleteSlot, type TimetableSlotRow } from '../hooks/useTimetable'
import { TimetableSlotForm } from '../components/TimetableSlotForm'
import { Modal } from '@/components/ui/Modal'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/utils/cn'

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
]

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]

export default function TimetablePage() {
  const { can } = usePermissions()
  const canManage = can('timetable.manage')

  const { data: classes = [] } = useClasses()
  const [classId, setClassId] = useState('')
  const activeClassId = classId || classes[0]?.id || ''

  const { data: slots = [], isLoading } = useTimetable(activeClassId)
  const upsert = useUpsertSlot()
  const del = useDeleteSlot()

  const [cell, setCell] = useState<{ day: number; period: number } | null>(null)

  function slotFor(day: number, period: number): TimetableSlotRow | undefined {
    return slots.find((s) => s.day_of_week === day && s.period_number === period)
  }

  const activeSlot = cell ? slotFor(cell.day, cell.period) : null

  async function handleDelete() {
    if (!activeSlot) return
    await del.mutateAsync(activeSlot.id)
    setCell(null)
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timetable</h1>
          <p className="text-sm text-slate-500 mt-1">Weekly class schedule</p>
        </div>
        <select
          value={activeClassId}
          onChange={(e) => setClassId(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <CalendarClock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No classes yet</p>
          <p className="text-xs text-slate-400 mt-1">Add a class first to build its timetable</p>
        </div>
      ) : isLoading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading timetable…</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 w-20">Period</th>
                {DAYS.map((d) => (
                  <th key={d.value} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td className="px-3 py-2 text-xs font-medium text-slate-400 border-r border-slate-50">
                    P{period}
                  </td>
                  {DAYS.map((d) => {
                    const slot = slotFor(d.value, period)
                    return (
                      <td key={d.value} className="px-1.5 py-1.5 align-top">
                        <button
                          disabled={!canManage}
                          onClick={() => setCell({ day: d.value, period })}
                          className={cn(
                            'w-full min-h-[64px] rounded-lg p-2 text-left transition-colors border',
                            slot
                              ? 'bg-primary-50 border-primary-100 hover:bg-primary-100'
                              : 'border-dashed border-slate-200 hover:bg-slate-50',
                            !canManage && 'cursor-default',
                          )}
                        >
                          {slot ? (
                            <>
                              <p className="text-xs font-semibold text-primary-900 truncate">{slot.subject?.name}</p>
                              {slot.teacher && (
                                <p className="text-[11px] text-primary-700 truncate">
                                  {slot.teacher.first_name} {slot.teacher.last_name}
                                </p>
                              )}
                              {slot.room && <p className="text-[10px] text-primary-500 truncate">{slot.room}</p>}
                            </>
                          ) : canManage ? (
                            <Plus className="w-3.5 h-3.5 text-slate-300 mx-auto mt-3" />
                          ) : null}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!cell}
        onClose={() => setCell(null)}
        title={activeSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
        size="md"
      >
        {cell && (
          <TimetableSlotForm
            slot={activeSlot}
            classId={activeClassId}
            dayOfWeek={cell.day}
            periodNumber={cell.period}
            onSubmit={async (data) => { await upsert.mutateAsync(data); setCell(null) }}
            onCancel={() => setCell(null)}
            onDelete={activeSlot ? handleDelete : undefined}
            deleting={del.isPending}
          />
        )}
      </Modal>
    </div>
  )
}
