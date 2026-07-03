import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TITLE_ROLE_MAP, STAFF_TITLE_LABELS, ROLE_LABELS } from '@/types/roles'
import type { UserRole, StaffTitle } from '@/types/roles'
import type { Profile } from '@/types/models'
import type { CreateStaffPayload, UpdateStaffPayload } from '../hooks/useStaff'

const STAFF_ROLES: UserRole[] = [
  'school_admin', 'teacher', 'finance', 'admin_staff', 'support_staff', 'ancillary',
]

const TITLES_BY_ROLE: Record<UserRole, StaffTitle[]> = STAFF_ROLES.reduce((acc, role) => {
  acc[role] = (Object.keys(TITLE_ROLE_MAP) as StaffTitle[]).filter((t) => TITLE_ROLE_MAP[t] === role)
  return acc
}, {} as Record<UserRole, StaffTitle[]>)

interface StaffFormProps {
  staff?: Profile | null
  onSubmit: (data: CreateStaffPayload | UpdateStaffPayload) => Promise<void>
  onCancel: () => void
}

type FormValues = {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
  staff_title: string
  department: string
  gender: string
  employee_number: string
  qualification: string
  join_date: string
}

export function StaffForm({ staff, onSubmit, onCancel }: StaffFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const selectedRole = watch('role')

  useEffect(() => {
    if (staff) {
      reset({
        email: '',
        password: '',
        first_name: staff.first_name,
        last_name: staff.last_name,
        role: staff.role as UserRole,
        staff_title: staff.staff_title ?? '',
        department: staff.department ?? '',
        gender: staff.gender ?? '',
        employee_number: '',
        qualification: '',
        join_date: '',
      })
    } else {
      reset({
        email: '', password: '', first_name: '', last_name: '',
        role: 'teacher', staff_title: '', department: '', gender: '',
        employee_number: '', qualification: '', join_date: '',
      })
    }
  }, [staff, reset])

  async function handleFormSubmit(values: FormValues) {
    if (staff) {
      await onSubmit({
        id: staff.id,
        first_name: values.first_name,
        last_name: values.last_name,
        staff_title: (values.staff_title || null) as StaffTitle | null,
        department: values.department || null,
        gender: values.gender || null,
      })
    } else {
      await onSubmit({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role,
        staff_title: (values.staff_title || null) as StaffTitle | null,
        department: values.department || null,
        gender: values.gender || null,
        employee_number: values.employee_number || null,
        qualification: values.qualification || null,
        join_date: values.join_date || null,
      })
    }
  }

  const titleOptions = TITLES_BY_ROLE[selectedRole] ?? []

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="Thomas"
          required
          error={errors.first_name?.message}
          {...register('first_name', { required: 'Required' })}
        />
        <Input
          label="Last Name"
          placeholder="Ndlovu"
          required
          error={errors.last_name?.message}
          {...register('last_name', { required: 'Required' })}
        />
      </div>

      {!staff && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="name@school.co.zw"
            required
            error={errors.email?.message}
            {...register('email', { required: 'Required' })}
          />
          <Input
            label="Temporary Password"
            type="text"
            placeholder="At least 6 characters"
            required
            error={errors.password?.message}
            {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Role" disabled={!!staff} required {...register('role', { required: true })}>
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </Select>
        <Select label="Title" {...register('staff_title')}>
          <option value="">— No specific title —</option>
          {titleOptions.map((t) => (
            <option key={t} value={t}>{STAFF_TITLE_LABELS[t]}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Department" placeholder="e.g. Science" {...register('department')} />
        <Select label="Gender" {...register('gender')}>
          <option value="">— Select —</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
      </div>

      {!staff && selectedRole === 'teacher' && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Teacher Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Employee Number" placeholder="e.g. TCH-003" {...register('employee_number')} />
            <Input label="Join Date" type="date" {...register('join_date')} />
          </div>
          <div className="mt-4">
            <Input label="Qualification" placeholder="e.g. BSc Mathematics" {...register('qualification')} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {staff ? 'Save changes' : 'Add staff member'}
        </Button>
      </div>
    </form>
  )
}
