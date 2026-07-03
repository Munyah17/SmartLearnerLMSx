/**
 * Digital IDs page — issue, view, and print school ID cards.
 *
 * Accessible to: school_admin (ids.issue), admin_staff (ids.issue),
 *                bursar/finance (ids.issue).
 *
 * Features:
 *  - List all profiles with their ID status
 *  - Issue an ID number to profiles that don't have one yet
 *  - Preview the ID card
 *  - Print the ID card (uses window.print() + @media print CSS)
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreditCard, Search, Printer, CheckCircle2, AlertCircle, RefreshCw,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { IDCard } from '../components/IDCard'
import { formatIdNumber } from '../utils/generateIdNumber'
import {
  ROLE_LABELS, STAFF_TITLE_LABELS, STUDENT_TITLE_LABELS, ROLE_ID_PREFIX,
} from '@/types/roles'
import type { UserRole, StaffTitle, StudentTitle } from '@/types/roles'
import type { Profile, School } from '@/types/models'
import { cn } from '@/utils/cn'

// ─────────────────────────────────────────────────────────────
// Data fetching
// ─────────────────────────────────────────────────────────────
async function fetchProfiles(schoolId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('school_id', schoolId)
    .order('last_name')
  if (error) throw error
  return (data as Profile[]) ?? []
}

async function getNextSeq(schoolId: string, rolePrefix: string): Promise<number> {
  // Read current max and add 1
  const { data: existing } = await supabase
    .from('profiles')
    .select('id_number')
    .eq('school_id', schoolId)
    .like('id_number', `%-${rolePrefix}-%`)
    .not('id_number', 'is', null)

  if (!existing || existing.length === 0) return 1

  const maxSeq = existing.reduce((max: number, row: { id_number: string | null }) => {
    if (!row.id_number) return max
    const parts = row.id_number.split('-')
    const seq = parseInt(parts[parts.length - 1], 10)
    return isNaN(seq) ? max : Math.max(max, seq)
  }, 0)
  return maxSeq + 1
}

async function issueId(
  profileId: string,
  schoolId: string,
  school: School,
  role: UserRole,
): Promise<string> {
  const roleCode = ROLE_ID_PREFIX[role] ?? 'MBR'
  const seq = await getNextSeq(schoolId, roleCode)
  const idNumber = formatIdNumber(
    school.id_prefix ?? 'SCH',
    role,
    school.academic_year ?? String(new Date().getFullYear()),
    seq,
  )

  const { error } = await supabase
    .from('profiles')
    .update({ id_number: idNumber, id_issued_at: new Date().toISOString() })
    .eq('id', profileId)

  if (error) throw error
  return idNumber
}

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
function getRoleDisplay(profile: Profile): string {
  if (profile.role === 'student' && profile.student_title) {
    return STUDENT_TITLE_LABELS[profile.student_title as StudentTitle] ?? 'Student'
  }
  if (profile.staff_title) {
    return STAFF_TITLE_LABELS[profile.staff_title as StaffTitle] ?? profile.staff_title
  }
  return ROLE_LABELS[profile.role as UserRole] ?? profile.role
}

const ROLE_BADGE: Record<UserRole, string> = {
  school_admin: 'bg-blue-100 text-blue-700',
  teacher:      'bg-violet-100 text-violet-700',
  finance:      'bg-amber-100 text-amber-700',
  admin_staff:  'bg-teal-100 text-teal-700',
  support_staff:'bg-cyan-100 text-cyan-700',
  ancillary:    'bg-slate-100 text-slate-600',
  student:      'bg-emerald-100 text-emerald-700',
  parent:       'bg-pink-100 text-pink-700',
}

// ─────────────────────────────────────────────────────────────
// Print helpers — isolate the ID card for printing
// ─────────────────────────────────────────────────────────────
function printIdCard() {
  const card = document.getElementById('id-card-print')
  if (!card) return
  const w = window.open('', '_blank', 'width=400,height=300')
  if (!w) return
  w.document.write(`
    <!DOCTYPE html><html><head>
    <title>ID Card</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { display: flex; align-items: center; justify-content: center;
             min-height: 100vh; background: #f1f5f9; }
      @media print {
        body { background: white; }
        @page { size: 85.6mm 54mm; margin: 0; }
      }
    </style>
    <link rel="stylesheet" href="${window.location.origin}/src/index.css" />
    </head><body>
    ${card.outerHTML}
    <script>window.onload=()=>{ window.print(); window.close(); }<\/script>
    </body></html>
  `)
  w.document.close()
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function IDsPage() {
  const { school } = useAuthStore()
  const { can } = usePermissions()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')
  const [filterIssued, setFilterIssued] = useState<'all' | 'issued' | 'pending'>('all')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles-ids', school?.id],
    queryFn: () => fetchProfiles(school!.id),
    enabled: !!school?.id,
  })

  const issueMutation = useMutation({
    mutationFn: (profile: Profile) =>
      issueId(profile.id, school!.id, school!, profile.role as UserRole),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles-ids'] })
    },
  })

  const filtered = profiles.filter(p => {
    const nameMatch = `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
    const roleMatch = filterRole === 'all' || p.role === filterRole
    const issuedMatch = filterIssued === 'all'
      || (filterIssued === 'issued' ? !!p.id_number : !p.id_number)
    return nameMatch && roleMatch && issuedMatch
  })

  const issued = profiles.filter(p => p.id_number).length
  const pending = profiles.length - issued

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Digital IDs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Issue, view, and print QR-code identity cards for all school members.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {issued} Issued
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {pending} Pending
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left panel: member list ── */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value as UserRole | 'all')}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All roles</option>
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
            <select
              value={filterIssued}
              onChange={e => setFilterIssued(e.target.value as typeof filterIssued)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All statuses</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CreditCard className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm">No members found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Role / Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID Number</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProfile(p)}
                      className={cn(
                        'hover:bg-slate-50 cursor-pointer transition-colors',
                        selectedProfile?.id === p.id && 'bg-primary-50',
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0',
                            p.role === 'student' ? 'bg-emerald-600' : 'bg-slate-600',
                          )}>
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                          <span className="font-medium text-slate-800">
                            {p.first_name} {p.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
                          ROLE_BADGE[p.role as UserRole] ?? 'bg-slate-100 text-slate-600',
                        )}>
                          {getRoleDisplay(p)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.id_number ? (
                          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {p.id_number}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not issued</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!p.id_number && can('ids.issue') && (
                            <button
                              onClick={e => { e.stopPropagation(); issueMutation.mutate(p) }}
                              disabled={issueMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className={cn('w-3 h-3', issueMutation.isPending && 'animate-spin')} />
                              Issue
                            </button>
                          )}
                          {p.id_number && (
                            <button
                              onClick={e => { e.stopPropagation(); setSelectedProfile(p); }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                            >
                              <CreditCard className="w-3 h-3" />
                              Preview
                            </button>
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

        {/* ── Right panel: ID card preview ── */}
        {selectedProfile && school && (
          <div className="lg:w-[360px] shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-700">ID Card Preview</h2>
                {can('ids.print') && selectedProfile.id_number && (
                  <button
                    onClick={printIdCard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                )}
              </div>

              <IDCard profile={selectedProfile} school={school} className="mx-auto" />

              {!selectedProfile.id_number && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-center">
                  <p className="text-xs text-amber-700 font-medium">
                    No ID issued yet. Click "Issue" to generate this member's ID number.
                  </p>
                  {can('ids.issue') && (
                    <button
                      onClick={() => issueMutation.mutate(selectedProfile)}
                      disabled={issueMutation.isPending}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={cn('w-3.5 h-3.5', issueMutation.isPending && 'animate-spin')} />
                      Issue ID Now
                    </button>
                  )}
                </div>
              )}

              {selectedProfile.id_number && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">ID Number</span>
                    <span className="font-mono font-bold text-slate-700">{selectedProfile.id_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Issued</span>
                    <span className="text-slate-600">
                      {selectedProfile.id_issued_at
                        ? new Date(selectedProfile.id_issued_at).toLocaleDateString()
                        : 'Unknown'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    The QR code encodes this member's ID, role, and school. Scanning it with any
                    QR reader returns a verification payload.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
