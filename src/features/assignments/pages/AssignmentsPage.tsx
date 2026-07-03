import { useEffect, useState } from 'react'
import { Plus, ClipboardList, Pencil, Trash2, GraduationCap } from 'lucide-react'
import {
  useAssignments, useUpsertAssignment, useDeleteAssignment,
  useSubmissions, useSaveSubmissions,
  type AssignmentRow, type UpsertAssignmentPayload,
} from '../hooks/useAssignments'
import { useStudents } from '@/features/students/hooks/useStudents'
import { AssignmentForm } from '../components/AssignmentForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePermissions } from '@/hooks/usePermissions'

export default function AssignmentsPage() {
  const { can } = usePermissions()
  const canManage = can('assignments.manage')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AssignmentRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AssignmentRow | null>(null)
  const [grading, setGrading] = useState<AssignmentRow | null>(null)

  const { data: assignments = [], isLoading, error } = useAssignments()
  const upsert = useUpsertAssignment()
  const del = useDeleteAssignment()

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(a: AssignmentRow) { setEditing(a); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleDelete() {
    if (!confirmDelete) return
    await del.mutateAsync(confirmDelete.id)
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <Button onClick={openAdd} className="shrink-0">
            <Plus className="w-4 h-4" />
            New Assignment
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">Failed to load assignments. Please try again.</p>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading assignments…</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No assignments yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first assignment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Class</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Subject</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Due Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{a.title}</td>
                    <td className="px-4 py-3">
                      {a.class ? <Badge variant="blue">{a.class.name}</Badge> : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{a.subject?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {a.due_date ? new Date(a.due_date).toLocaleDateString('en-ZW', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setGrading(a)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          aria-label="Grade submissions"
                          title="Grade"
                        >
                          <GraduationCap className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => openEdit(a)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              aria-label="Edit assignment"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(a)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Remove assignment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Assignment' : 'New Assignment'} size="lg">
        <AssignmentForm
          assignment={editing}
          onSubmit={async (data: UpsertAssignmentPayload) => { await upsert.mutateAsync(data); closeModal() }}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove Assignment" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-slate-900">{confirmDelete?.title}</span>?
            All submissions will also be removed.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" loading={del.isPending} onClick={handleDelete}>Remove</Button>
          </div>
        </div>
      </Modal>

      {/* Grading modal */}
      <Modal open={!!grading} onClose={() => setGrading(null)} title={grading ? `Grade: ${grading.title}` : ''} size="xl">
        {grading && <GradingPanel assignment={grading} onClose={() => setGrading(null)} />}
      </Modal>
    </div>
  )
}

function GradingPanel({ assignment, onClose }: { assignment: AssignmentRow; onClose: () => void }) {
  const { data: students = [], isLoading } = useStudents({ classId: assignment.class_id, isActive: true })
  const { data: submissions = [] } = useSubmissions(assignment.id)
  const save = useSaveSubmissions()

  const [scores, setScores] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})

  useEffect(() => {
    const s: Record<string, string> = {}
    const f: Record<string, string> = {}
    for (const student of students) {
      const sub = submissions.find((x) => x.student_id === student.id)
      s[student.id] = sub?.score != null ? String(sub.score) : ''
      f[student.id] = sub?.feedback ?? ''
    }
    setScores(s)
    setFeedback(f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment.id, students.length, submissions.length])

  async function handleSave() {
    await save.mutateAsync({
      assignmentId: assignment.id,
      entries: students.map((s) => ({
        student_id: s.id,
        score: scores[s.id] !== '' ? parseFloat(scores[s.id]) : null,
        feedback: feedback[s.id] || null,
      })),
    })
    onClose()
  }

  return (
    <div className="flex flex-col max-h-[70vh]">
      <div className="overflow-y-auto divide-y divide-slate-50 px-6">
        {isLoading ? (
          <div className="py-10 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : students.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No students in this class</p>
        ) : (
          students.map((s) => (
            <div key={s.id} className="flex items-center gap-4 py-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.first_name[0]}{s.last_name[0]}
                </div>
                <p className="font-medium text-slate-900 truncate">{s.first_name} {s.last_name}</p>
              </div>
              <input
                type="number"
                min={0}
                max={assignment.max_score}
                placeholder="Score"
                value={scores[s.id] ?? ''}
                onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                className="w-20 text-sm text-center border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0"
              />
              <span className="text-xs text-slate-400 shrink-0">/ {assignment.max_score}</span>
              <input
                type="text"
                placeholder="Feedback (optional)"
                value={feedback[s.id] ?? ''}
                onChange={(e) => setFeedback((prev) => ({ ...prev, [s.id]: e.target.value }))}
                className="flex-1 min-w-0 text-sm border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))
        )}
      </div>
      <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} loading={save.isPending}>Save Grades</Button>
      </div>
    </div>
  )
}
