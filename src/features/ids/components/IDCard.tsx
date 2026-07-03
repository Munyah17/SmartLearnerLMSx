/**
 * Printable school ID card.
 *
 * Physical credit-card size: 85.6 mm × 54 mm (ISO/IEC 7810 ID-1).
 * At 96 dpi screen: ≈ 323 × 204 px.
 * Print media query uses mm units for exact sizing.
 *
 * Usage:
 *   <IDCard profile={...} school={...} />
 *   window.print()  — CSS hides everything else and prints only #id-card-print
 */
import { QRCodeSVG } from 'qrcode.react'
import { buildQrPayload } from '../utils/generateIdNumber'
import type { Profile, School } from '@/types/models'
import type { UserRole } from '@/types/roles'
import {
  STAFF_TITLE_LABELS,
  STUDENT_TITLE_LABELS,
  ROLE_LABELS,
} from '@/types/roles'
import type { StaffTitle, StudentTitle } from '@/types/roles'
import { cn } from '@/utils/cn'

interface IDCardProps {
  profile: Profile
  school: School
  className?: string
}

function getRoleDisplay(profile: Profile): string {
  if (profile.role === 'student' && profile.student_title) {
    return STUDENT_TITLE_LABELS[profile.student_title as StudentTitle] ?? 'Student'
  }
  if (profile.staff_title) {
    return STAFF_TITLE_LABELS[profile.staff_title as StaffTitle] ?? profile.staff_title
  }
  return ROLE_LABELS[profile.role as UserRole] ?? profile.role
}

function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'school_admin': return 'bg-blue-700'
    case 'teacher':      return 'bg-violet-700'
    case 'finance':      return 'bg-amber-700'
    case 'admin_staff':  return 'bg-teal-700'
    case 'support_staff':return 'bg-cyan-700'
    case 'ancillary':    return 'bg-slate-600'
    case 'student':      return 'bg-emerald-700'
    case 'parent':       return 'bg-pink-700'
    default:             return 'bg-slate-700'
  }
}

export function IDCard({ profile, school, className }: IDCardProps) {
  const idNo = profile.id_number ?? 'ID NOT ISSUED'
  const fullName = `${profile.first_name} ${profile.last_name}`
  const roleDisplay = getRoleDisplay(profile)
  const headerColor = getRoleColor(profile.role as UserRole)
  const academicYear = school.academic_year ?? new Date().getFullYear().toString()

  const qrValue = buildQrPayload({
    id: profile.id,
    idNo,
    name: fullName,
    role: profile.role as UserRole,
    school: school.name,
    schoolId: school.id,
    year: academicYear,
  })

  return (
    <div
      id="id-card-print"
      className={cn(
        'id-card relative bg-white shadow-xl overflow-hidden select-none',
        'w-[323px] h-[204px] rounded-xl border border-slate-200',
        className,
      )}
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* ── Top colour band with school name ── */}
      <div className={cn('flex items-center px-4 py-2 gap-2', headerColor)}>
        {school.logo_url ? (
          <img src={school.logo_url} alt="logo" className="w-7 h-7 rounded object-contain bg-white p-0.5" />
        ) : (
          <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center text-white font-bold text-xs">
            {school.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white text-[11px] font-bold leading-tight truncate">{school.name}</p>
          {school.school_motto && (
            <p className="text-white/70 text-[8px] truncate italic">{school.school_motto}</p>
          )}
        </div>
        <span className="ml-auto text-white/60 text-[8px] font-mono shrink-0">
          {academicYear}
        </span>
      </div>

      {/* ── Card body ── */}
      <div className="flex gap-3 px-4 py-3">
        {/* Photo placeholder */}
        <div className="shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={fullName}
              className="w-[68px] h-[88px] object-cover rounded-lg border border-slate-200"
            />
          ) : (
            <div className={cn(
              'w-[68px] h-[88px] rounded-lg flex items-center justify-center border border-slate-200',
              'bg-slate-100',
            )}>
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold',
                headerColor,
              )}>
                {profile.first_name[0]}{profile.last_name[0]}
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-slate-900 text-[13px] font-bold leading-tight truncate">{fullName}</p>
            <p className={cn('text-[10px] font-semibold mt-0.5 capitalize', `text-slate-600`)}>
              {roleDisplay}
            </p>
            {profile.department && (
              <p className="text-slate-500 text-[9px] mt-0.5 truncate">{profile.department}</p>
            )}
          </div>

          <div className="space-y-0.5 mt-2">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[8px] uppercase tracking-wide w-10 shrink-0">ID No</span>
              <span className="text-slate-800 text-[9px] font-mono font-bold">{idNo}</span>
            </div>
            {profile.gender && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[8px] uppercase tracking-wide w-10 shrink-0">Gender</span>
                <span className="text-slate-600 text-[9px] capitalize">{profile.gender}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="shrink-0 flex flex-col items-center justify-end gap-1">
          <QRCodeSVG
            value={qrValue}
            size={64}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
          <span className="text-[7px] text-slate-400 text-center leading-tight">Scan to verify</span>
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[8px] text-slate-400 truncate">{school.email ?? ''}</p>
        <p className="text-[8px] text-slate-400">Valid: {academicYear}</p>
      </div>
    </div>
  )
}
