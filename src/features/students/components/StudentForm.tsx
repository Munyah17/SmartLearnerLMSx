import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { StudentRow, UpsertStudentPayload } from '../hooks/useStudents'
import type { Class } from '@/types/models'

interface StudentFormProps {
  student?: StudentRow | null
  classes: Class[]
  onSubmit: (data: UpsertStudentPayload) => Promise<void>
  onCancel: () => void
}

type FormValues = {
  student_number: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  class_id: string
  address: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
}

export function StudentForm({ student, classes, onSubmit, onCancel }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  useEffect(() => {
    if (student) {
      reset({
        student_number: student.student_number,
        first_name: student.first_name,
        last_name: student.last_name,
        date_of_birth: student.date_of_birth ?? '',
        gender: student.gender ?? '',
        class_id: student.class_id ?? '',
        address: student.address ?? '',
        guardian_name: student.guardian_name ?? '',
        guardian_phone: student.guardian_phone ?? '',
        guardian_email: student.guardian_email ?? '',
      })
    } else {
      reset({
        student_number: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        class_id: '',
        address: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
      })
    }
  }, [student, reset])

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      id: student?.id,
      student_number: values.student_number,
      first_name: values.first_name,
      last_name: values.last_name,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender || null,
      class_id: values.class_id || null,
      address: values.address || null,
      guardian_name: values.guardian_name || null,
      guardian_phone: values.guardian_phone || null,
      guardian_email: values.guardian_email || null,
      is_active: student?.is_active ?? true,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
      {/* Identity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Student Number"
          placeholder="e.g. STD-001"
          required
          error={errors.student_number?.message}
          {...register('student_number', { required: 'Required' })}
        />
        <Select
          label="Class"
          {...register('class_id')}
        >
          <option value="">— No class assigned —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="Tendai"
          required
          error={errors.first_name?.message}
          {...register('first_name', { required: 'Required' })}
        />
        <Input
          label="Last Name"
          placeholder="Moyo"
          required
          error={errors.last_name?.message}
          {...register('last_name', { required: 'Required' })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          {...register('date_of_birth')}
        />
        <Select label="Gender" {...register('gender')}>
          <option value="">— Select —</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <Input
        label="Home Address"
        placeholder="123 Harare St, Harare"
        {...register('address')}
      />

      {/* Guardian */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Guardian / Parent
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Guardian Name"
            placeholder="Full name"
            {...register('guardian_name')}
          />
          <Input
            label="Guardian Phone"
            type="tel"
            placeholder="+263 77 000 0000"
            {...register('guardian_phone')}
          />
        </div>
        <div className="mt-4">
          <Input
            label="Guardian Email"
            type="email"
            placeholder="parent@example.com"
            {...register('guardian_email')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {student ? 'Save changes' : 'Add student'}
        </Button>
      </div>
    </form>
  )
}
