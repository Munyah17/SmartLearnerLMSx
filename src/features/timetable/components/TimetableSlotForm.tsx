import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useStaff } from '@/features/staff/hooks/useStaff'
import { useSubjects } from '@/features/subjects/hooks/useSubjects'
import type { UpsertSlotPayload } from '../hooks/useTimetable'
import type { TimetableSlotRow } from '../hooks/useTimetable'

interface TimetableSlotFormProps {
  slot?: TimetableSlotRow | null
  classId: string
  dayOfWeek: number
  periodNumber: number
  onSubmit: (data: UpsertSlotPayload) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
  deleting?: boolean
}

type FormValues = {
  subject_id: string
  teacher_id: string
  start_time: string
  end_time: string
  room: string
}

export function TimetableSlotForm({
  slot, classId, dayOfWeek, periodNumber, onSubmit, onCancel, onDelete, deleting,
}: TimetableSlotFormProps) {
  const { data: subjects = [] } = useSubjects()
  const { data: teachers = [] } = useStaff({ role: 'teacher' })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      subject_id: slot?.subject_id ?? '',
      teacher_id: slot?.teacher_id ?? '',
      start_time: slot?.start_time ?? '',
      end_time: slot?.end_time ?? '',
      room: slot?.room ?? '',
    },
  })

  async function onFormSubmit(values: FormValues) {
    await onSubmit({
      id: slot?.id,
      class_id: classId,
      subject_id: values.subject_id,
      teacher_id: values.teacher_id || null,
      day_of_week: dayOfWeek,
      period_number: periodNumber,
      start_time: values.start_time || null,
      end_time: values.end_time || null,
      room: values.room || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
      <Select
        label="Subject"
        required
        error={errors.subject_id?.message}
        {...register('subject_id', { required: 'Required' })}
      >
        <option value="">— Select subject —</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </Select>

      <Select label="Teacher" {...register('teacher_id')}>
        <option value="">— No teacher assigned —</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Time" type="time" {...register('start_time')} />
        <Input label="End Time" type="time" {...register('end_time')} />
      </div>

      <Input label="Room" placeholder="e.g. Lab 2" {...register('room')} />

      <div className="flex justify-between gap-3 pt-2 border-t border-slate-100">
        <div>
          {slot && onDelete && (
            <Button type="button" variant="danger" loading={deleting} onClick={onDelete}>
              Remove
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {slot ? 'Save changes' : 'Add to timetable'}
          </Button>
        </div>
      </div>
    </form>
  )
}
