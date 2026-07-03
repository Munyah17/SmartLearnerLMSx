import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Building2, UserCheck, UserX } from 'lucide-react'
import { useStaffMember, useToggleStaffActive } from '../hooks/useStaff'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePermissions } from '@/hooks/usePermissions'
import { ROLE_LABELS, STAFF_TITLE_LABELS } from '@/types/roles'
import type { UserRole, StaffTitle } from '@/types/roles'

export default function StaffProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { can } = usePermissions()
  const { data: staff, isLoading, error } = useStaffMember(id)
  const toggleActive = useToggleStaffActive()

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading profile…</p>
      </div>
    )
  }

  if (error || !staff) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">Staff member not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/staff')}>
          Back to Staff
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/staff')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Staff
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shrink-0">
              {staff.first_name[0]}{staff.last_name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{staff.first_name} {staff.last_name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {staff.staff_title
                  ? STAFF_TITLE_LABELS[staff.staff_title as StaffTitle] ?? staff.staff_title
                  : ROLE_LABELS[staff.role as UserRole]}
              </p>
            </div>
          </div>
          {staff.is_active ? (
            <Badge variant="green"><UserCheck className="w-3 h-3 mr-1" />Active</Badge>
          ) : (
            <Badge variant="slate"><UserX className="w-3 h-3 mr-1" />Inactive</Badge>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Role</p>
            <p className="text-sm text-slate-700">{ROLE_LABELS[staff.role as UserRole]}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Department
            </p>
            <p className="text-sm text-slate-700">{staff.department ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> ID Number
            </p>
            <p className="text-sm text-slate-700 font-mono">{staff.id_number ?? 'Not issued'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Gender</p>
            <p className="text-sm text-slate-700 capitalize">{staff.gender ?? '—'}</p>
          </div>
        </div>

        {can('staff.manage') && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
            <Button
              variant={staff.is_active ? 'danger' : 'primary'}
              loading={toggleActive.isPending}
              onClick={() => toggleActive.mutate({ id: staff.id, isActive: !staff.is_active })}
            >
              {staff.is_active ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
