import { useState, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, UsersRound, Pencil, UserCheck, UserX } from 'lucide-react'
import {
  useStaff, useCreateStaff, useUpdateStaff, useToggleStaffActive,
  type CreateStaffPayload, type UpdateStaffPayload,
} from '../hooks/useStaff'
import { StaffForm } from '../components/StaffForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePermissions } from '@/hooks/usePermissions'
import { ROLE_LABELS, STAFF_TITLE_LABELS } from '@/types/roles'
import type { UserRole, StaffTitle } from '@/types/roles'
import type { Profile } from '@/types/models'
import { cn } from '@/utils/cn'

const STAFF_ROLES: UserRole[] = [
  'school_admin', 'teacher', 'finance', 'admin_staff', 'support_staff', 'ancillary',
]

const ROLE_BADGE: Record<UserRole, 'blue' | 'purple' | 'yellow' | 'green' | 'slate'> = {
  school_admin: 'blue',
  teacher: 'purple',
  finance: 'yellow',
  admin_staff: 'green',
  support_staff: 'slate',
  ancillary: 'slate',
  student: 'slate',
  parent: 'slate',
}

export default function StaffPage() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [showInactive, setShowInactive] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)

  const deferredSearch = useDeferredValue(search)

  const { data: staff = [], isLoading, error } = useStaff({
    search: deferredSearch || undefined,
    role: roleFilter || undefined,
    isActive: showInactive ? undefined : true,
  })

  const create = useCreateStaff()
  const update = useUpdateStaff()
  const toggleActive = useToggleStaffActive()

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(p: Profile) { setEditing(p); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSubmit(data: CreateStaffPayload | UpdateStaffPayload) {
    if ('id' in data) {
      await update.mutateAsync(data)
    } else {
      await create.mutateAsync(data)
    }
    closeModal()
  }

  const canManage = can('staff.manage')

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? 'Loading…' : `${staff.length} staff member${staff.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <Button onClick={openAdd} className="shrink-0">
            <Plus className="w-4 h-4" />
            Add Staff
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
          className="text-sm border border-slate-300 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All roles</option>
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
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
            <p className="text-sm text-red-600">Failed to load staff. Please try again.</p>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading staff…</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="py-16 text-center">
            <UsersRound className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No staff found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || roleFilter ? 'Try adjusting your filters' : 'Add your first staff member to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Department</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staff.map((p) => (
                  <tr
                    key={p.id}
                    className={cn('hover:bg-slate-50/50 transition-colors cursor-pointer', !p.is_active && 'opacity-60')}
                    onClick={() => navigate(`/staff/${p.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {p.first_name[0]}{p.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{p.first_name} {p.last_name}</p>
                          {p.staff_title && (
                            <p className="text-xs text-slate-400 capitalize">
                              {STAFF_TITLE_LABELS[p.staff_title as StaffTitle] ?? p.staff_title}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_BADGE[p.role as UserRole]}>{ROLE_LABELS[p.role as UserRole]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.department ?? '—'}</td>
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <Badge variant="green"><UserCheck className="w-3 h-3 mr-1" />Active</Badge>
                      ) : (
                        <Badge variant="slate"><UserX className="w-3 h-3 mr-1" />Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        {canManage && (
                          <>
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              aria-label="Edit staff"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleActive.mutate({ id: p.id, isActive: !p.is_active })}
                              disabled={toggleActive.isPending}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                p.is_active
                                  ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50',
                              )}
                              aria-label={p.is_active ? 'Deactivate staff' : 'Reactivate staff'}
                            >
                              {p.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Staff Member' : 'Add Staff Member'}
        size="lg"
      >
        <StaffForm staff={editing} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </div>
  )
}
