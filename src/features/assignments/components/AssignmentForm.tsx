import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useClasses } from '@/features/classes/hooks/useClasses'
import { useSubjects } from '@/features/subjects/hooks/useSubjects'
import type { AssignmentRow, UpsertAssignmentPayload } from '../hooks/useAssignments'

interface AssignmentFormProps {
  assignment?: AssignmentRow | null
  onSubmit: (data: UpsertAssignmentPayload) => Promise<void>
  onCancel: () => void
}

type FormValues = {
  class_id: string
  subject_id: string
  title: string
  description: string
  due_date: string
  max_score: string
}

export function AssignmentForm({ assignment, onSubmit, onCancel }: AssignmentFormProps) {
  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>()

  useEffect(() => {
    if (assignment) {
      reset({
        class_id: assignment.class_id,
        subject_id: assignment.subject_id,
        title: assignment.title,
        description: assignment.description ?? '',
        due_date: assignment.due_date ?? '',
        max_score: String(assignment.max_score ?? 100),
      })
    } else {
      reset({ class_id: '', subject_id: '', title: '', description: '', due_date: '', max_score: '100' })
    }
  }, [assignment, reset])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      id: assignment?.id,
      class_id: values.class_id,
      subject_id: values.subject_id,
      title: values.title,
      description: values.description || null,
      due_date: values.due_date || null,
      max_score: values.max_score ? parseFloat(values.max_score) : 100,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
      <Input
        label="Title"
        placeholder="e.g. Algebra Worksheet 3"
        required
        error={errors.title?.message}
        {...register('title', { required: 'Required' })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Class" required error={errors.class_id?.message} {...register('class_id', { required: 'Required' })}>
          <option value="">— Select class —</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Subject" required error={errors.subject_id?.message} {...register('subject_id', { required: 'Required' })}>
          <option value="">— Select subject —</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Due Date" type="date" {...register('due_date')} />
        <Input label="Max Score" type="number" {...register('max_score')} />
      </div>

      <Input label="Description" placeholder="Optional instructions" {...register('description')} />

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {assignment ? 'Save changes' : 'Create assignment'}
        </Button>
      </div>
    </form>
  )
}
