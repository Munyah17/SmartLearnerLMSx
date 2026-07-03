import { useMemo } from 'react'
import { useAuthStore } from '@/features/auth/authStore'
import { getPermissions } from '@/types/permissions'
import type { Permission } from '@/types/permissions'
import type { UserRole } from '@/types/roles'
import { EXECUTIVE_TITLES, DEPUTY_TITLES } from '@/types/roles'

export function usePermissions() {
  const { profile } = useAuthStore()

  const permissions = useMemo(() => {
    if (!profile) return new Set<Permission>()
    return getPermissions(
      profile.role as UserRole,
      (profile as any).staff_title ?? null,
    )
  }, [profile])

  function can(permission: Permission): boolean {
    return permissions.has(permission)
  }

  function canAny(...perms: Permission[]): boolean {
    return perms.some(p => permissions.has(p))
  }

  function canAll(...perms: Permission[]): boolean {
    return perms.every(p => permissions.has(p))
  }

  function hasRole(role: UserRole | UserRole[]): boolean {
    if (!profile) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(profile.role as UserRole)
  }

  const staffTitle = (profile as any)?.staff_title as string | undefined
  const studentTitle = (profile as any)?.student_title as string | undefined

  const isExecutive = hasRole('school_admin') &&
    !!staffTitle && EXECUTIVE_TITLES.includes(staffTitle as any)

  const isDeputy = hasRole('school_admin') &&
    !!staffTitle && DEPUTY_TITLES.includes(staffTitle as any)

  // What label to show in the UI for this user's role/title
  function getDisplayTitle(): string {
    if (hasRole('student') && studentTitle) return studentTitle.replace(/_/g, ' ')
    if (staffTitle) return staffTitle.replace(/_/g, ' ')
    return profile?.role?.replace(/_/g, ' ') ?? ''
  }

  return {
    can,
    canAny,
    canAll,
    hasRole,
    permissions,
    profile,
    staffTitle,
    studentTitle,
    isExecutive,
    isDeputy,
    getDisplayTitle,
  }
}
