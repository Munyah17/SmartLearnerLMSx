import { useState } from 'react'
import { Plus, BookOpen, Pencil, Trash2, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useClasses, useUpsertClass, useDeleteClass, type UpsertClassPayload } from '../hooks/useClasses'
import { useStudents } from '@/features/students/hooks/useStudents'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Class } from '@/types/models'

export default function ClassesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Class | null>(null)

  const { data: classes = [], isLoading, error } = useClasses()
  const { data: students = [] } = useStudents()
  const upsert = useUpsertClass()
  const del = useDeleteClass()

  function studentCount(classId: string) {
    return students.filter((s) => s.class_id === classId && s.is_active).length
  }

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(c: Class) { setEditing(c); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

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
          <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="w-4 h-4" />
          Add Class
        </Button>
      </div>

      {/* Grid */}
      {error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-600">Failed to load classes. Please try again.</p>
        </div>
      ) : isLoading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading classes…</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No classes yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first class to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map((c) => {
            const count = studentCount(c.id)
            const pct = c.capacity ? Math.round((count / c.capacity) * 100) : null

            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Grade {c.grade_level}</p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{count} student{count !== 1 ? 's' : ''}</span>
                  {c.capacity && (
                    <span className="text-slate-300">/ {c.capacity} capacity</span>
                  )}
                </div>

                {pct !== null && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-400 transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Class' : 'Add Class'}
        size="sm"
      >
        <ClassForm
          cls={editing}
          onSubmit={async (data) => { await upsert.mutateAsync(data); closeModal() }}
          onCancel={closeModal}
          loading={upsert.isPending}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove Class"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-slate-900">{confirmDelete?.name}</span>?
            Students in this class will become unassigned.
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

interface ClassFormValues {
  name: string
  grade_level: string
  capacity: string
}

function ClassForm({
  cls,
  onSubmit,
  onCancel,
  loading,
}: {
  cls: Class | null
  onSubmit: (d: UpsertClassPayload) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClassFormValues>({
    defaultValues: {
      name: cls?.name ?? '',
      grade_level: cls?.grade_level ?? '',
      capacity: cls?.capacity?.toString() ?? '',
    },
  })

  async function onFormSubmit(values: ClassFormValues) {
    await onSubmit({
      id: cls?.id,
      name: values.name,
      grade_level: values.grade_level,
      capacity: values.capacity ? parseInt(values.capacity, 10) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
      <Input
        label="Class Name"
        placeholder="e.g. Form 1A"
        required
        error={errors.name?.message}
        {...register('name', { required: 'Required' })}
      />
      <Input
        label="Grade Level"
        placeholder="e.g. Form 1"
        required
        error={errors.grade_level?.message}
        {...register('grade_level', { required: 'Required' })}
      />
      <Input
        label="Capacity"
        type="number"
        placeholder="e.g. 35"
        hint="Leave blank if unlimited"
        {...register('capacity')}
      />
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {cls ? 'Save changes' : 'Add class'}
        </Button>
      </div>
    </form>
  )
}
