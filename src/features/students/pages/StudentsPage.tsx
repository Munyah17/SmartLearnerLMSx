import { useState, useDeferredValue } from 'react'
import { Plus, Search, Users, Pencil, Trash2, UserCheck, UserX } from 'lucide-react'
import { useStudents, useUpsertStudent, useDeleteStudent, type UpsertStudentPayload, type StudentRow } from '../hooks/useStudents'
import { useClasses } from '@/features/classes/hooks/useClasses'
import { StudentForm } from '../components/StudentForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StudentRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<StudentRow | null>(null)

  const deferredSearch = useDeferredValue(search)

  const { data: students = [], isLoading, error } = useStudents({
    search: deferredSearch || undefined,
    classId: classFilter || undefined,
    isActive: showInactive ? undefined : true,
  })

  const { data: classes = [] } = useClasses()
  const upsert = useUpsertStudent()
  const del = useDeleteStudent()

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(s: StudentRow) { setEditing(s); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSubmit(data: UpsertStudentPayload) {
    await upsert.mutateAsync(data)
    closeModal()
  }

  async function handleDelete() {
    if (!confirmDelete) return
    await del.mutateAsync(confirmDelete.id)
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${students.length} student${students.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name or number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          Show inactive
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">Failed to load students. Please try again.</p>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading students…</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No students found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || classFilter ? 'Try adjusting your filters' : 'Add your first student to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Number</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Class</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Guardian</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s) => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    onEdit={() => openEdit(s)}
                    onDelete={() => setConfirmDelete(s)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Student' : 'Add Student'}
        size="lg"
      >
        <StudentForm
          student={editing}
          classes={classes}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove Student"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-slate-900">
              {confirmDelete?.first_name} {confirmDelete?.last_name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              onClick={handleDelete}
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function StudentRow({
  student: s,
  onEdit,
  onDelete,
}: {
  student: StudentRow
  onEdit: () => void
  onDelete: () => void
}) {
  const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase()

  return (
    <tr className={cn('hover:bg-slate-50/50 transition-colors', !s.is_active && 'opacity-60')}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-medium text-slate-900">{s.first_name} {s.last_name}</p>
            {s.date_of_birth && (
              <p className="text-xs text-slate-400">
                {new Date(s.date_of_birth).toLocaleDateString('en-ZW', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{s.student_number}</td>
      <td className="px-4 py-3">
        {s.class ? (
          <Badge variant="blue">{s.class.name}</Badge>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {s.guardian_name ? (
          <div>
            <p className="text-slate-700 text-xs">{s.guardian_name}</p>
            {s.guardian_phone && (
              <p className="text-slate-400 text-xs">{s.guardian_phone}</p>
            )}
          </div>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {s.is_active ? (
          <Badge variant="green">
            <UserCheck className="w-3 h-3 mr-1" />Active
          </Badge>
        ) : (
          <Badge variant="slate">
            <UserX className="w-3 h-3 mr-1" />Inactive
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Edit student"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Remove student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
