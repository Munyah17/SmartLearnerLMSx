import { useState } from 'react'
import { Plus, BookMarked, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useSubjects, useUpsertSubject, useDeleteSubject, type UpsertSubjectPayload } from '../hooks/useSubjects'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePermissions } from '@/hooks/usePermissions'
import type { Subject } from '@/types/models'

export default function SubjectsPage() {
  const { can } = usePermissions()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Subject | null>(null)

  const { data: subjects = [], isLoading, error } = useSubjects()
  const upsert = useUpsertSubject()
  const del = useDeleteSubject()

  const canManage = can('subjects.manage')

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(s: Subject) { setEditing(s); setModalOpen(true) }
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
          <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <Button onClick={openAdd} className="shrink-0">
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        )}
      </div>

      {/* Grid */}
      {error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-600">Failed to load subjects. Please try again.</p>
        </div>
      ) : isLoading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading subjects…</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <BookMarked className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No subjects yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first subject to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <BookMarked className="w-5 h-5 text-teal-600" />
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="font-semibold text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{s.code}</p>
              {s.description && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Subject' : 'Add Subject'}
        size="sm"
      >
        <SubjectForm
          subject={editing}
          onSubmit={async (data) => { await upsert.mutateAsync(data); closeModal() }}
          onCancel={closeModal}
          loading={upsert.isPending}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove Subject"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-slate-900">{confirmDelete?.name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={del.isPending} onClick={handleDelete}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

interface SubjectFormValues {
  name: string
  code: string
  description: string
}

function SubjectForm({
  subject,
  onSubmit,
  onCancel,
  loading,
}: {
  subject: Subject | null
  onSubmit: (d: UpsertSubjectPayload) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<SubjectFormValues>({
    defaultValues: {
      name: subject?.name ?? '',
      code: subject?.code ?? '',
      description: subject?.description ?? '',
    },
  })

  async function onFormSubmit(values: SubjectFormValues) {
    await onSubmit({
      id: subject?.id,
      name: values.name,
      code: values.code.toUpperCase(),
      description: values.description || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
      <Input
        label="Subject Name"
        placeholder="e.g. Mathematics"
        required
        error={errors.name?.message}
        {...register('name', { required: 'Required' })}
      />
      <Input
        label="Subject Code"
        placeholder="e.g. MATH"
        required
        error={errors.code?.message}
        {...register('code', { required: 'Required' })}
      />
      <Input
        label="Description"
        placeholder="Optional short description"
        {...register('description')}
      />
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {subject ? 'Save changes' : 'Add subject'}
        </Button>
      </div>
    </form>
  )
}
