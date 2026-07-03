import type { UserRole } from '@/types/roles'
import { ROLE_ID_PREFIX } from '@/types/roles'

/**
 * Format: {SCHOOL_PREFIX}-{YEAR}-{ROLE_CODE}-{5-digit-seq}
 * e.g.    SLS-2026-STD-00001
 */
export function formatIdNumber(
  schoolPrefix: string,
  role: UserRole,
  academicYear: string,
  seq: number,
): string {
  const roleCode = ROLE_ID_PREFIX[role] ?? 'MBR'
  const paddedSeq = String(seq).padStart(5, '0')
  return `${schoolPrefix.toUpperCase()}-${academicYear}-${roleCode}-${paddedSeq}`
}

/**
 * Parse an ID number back into its components.
 * Returns null if the format is unrecognised.
 */
export function parseIdNumber(idNumber: string) {
  const parts = idNumber.split('-')
  if (parts.length !== 4) return null
  const [schoolPrefix, year, roleCode, seqStr] = parts
  return { schoolPrefix, year, roleCode, seq: parseInt(seqStr, 10) }
}

/**
 * QR code payload — what gets encoded into the QR code on the ID card.
 * Keep it small; scanners decode it and look up the record.
 */
export interface IdQrPayload {
  id: string        // profiles.id (UUID)
  idNo: string      // the formatted ID number
  name: string      // full name
  role: UserRole
  school: string    // school name
  schoolId: string
  year: string
}

export function buildQrPayload(payload: IdQrPayload): string {
  return JSON.stringify(payload)
}
