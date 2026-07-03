import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import type { Profile } from '@/types/models'
import type { UserRole, StaffTitle } from '@/types/roles'

const STAFF_ROLES: UserRole[] = [
  'school_admin', 'teacher', 'finance', 'admin_staff', 'support_staff', 'ancillary',
]

export interface StaffFilters {
  search?: string
  role?: UserRole | ''
  isActive?: boolean
}

async function fetchStaff(schoolId: string, filters: StaffFilters): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('school_id', schoolId)
    .in('role', STAFF_ROLES)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (filters.search) {
    const term = `%${filters.search}%`
    query = query.or(`first_name.ilike.${term},last_name.ilike.${term}`)
  }
  if (filters.role) query = query.eq('role', filters.role)
  if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive)

  const { data, error } = await query
  if (error) throw error
  return (data as Profile[]) ?? []
}

export function useStaff(filters: StaffFilters = {}) {
  const schoolId = useAuthStore((s) => s.school?.id ?? '')
  return useQuery({
    queryKey: ['staff', schoolId, filters],
    queryFn: () => fetchStaff(schoolId, filters),
    enabled: !!schoolId,
  })
}

export function useStaffMember(id: string | undefined) {
  return useQuery({
    queryKey: ['staff-member', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!id,
  })
}

export interface CreateStaffPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
  staff_title?: StaffTitle | null
  department?: string | null
  gender?: string | null
  employee_number?: string | null
  qualification?: string | null
  join_date?: string | null
}

export function useCreateStaff() {
  const qc = useQueryClient()
  const { school } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      if (!school) throw new Error('No school context')

      const { data: newId, error } = await supabase.rpc('create_staff_member', {
        p_email: payload.email,
        p_password: payload.password,
        p_first_name: payload.first_name,
        p_last_name: payload.last_name,
        p_role: payload.role,
        p_staff_title: payload.staff_title ?? null,
        p_department: payload.department ?? null,
        p_gender: payload.gender ?? null,
      })
      if (error) throw error

      if (payload.role === 'teacher' && payload.employee_number) {
        const { error: teacherError } = await supabase.from('teachers').insert({
          school_id: school.id,
          profile_id: newId as string,
          employee_number: payload.employee_number,
          department: payload.department ?? null,
          qualification: payload.qualification ?? null,
          join_date: payload.join_date ?? null,
        })
        if (teacherError) throw teacherError
      }

      return newId as string
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export interface UpdateStaffPayload {
  id: string
  first_name: string
  last_name: string
  staff_title?: StaffTitle | null
  department?: string | null
  gender?: string | null
}

export function useUpdateStaff() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateStaffPayload) => {
      const { id, ...rest } = payload
      const { error } = await supabase.from('profiles').update(rest).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      qc.invalidateQueries({ queryKey: ['staff-member'] })
    },
  })
}

export function useToggleStaffActive() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      qc.invalidateQueries({ queryKey: ['staff-member'] })
    },
  })
}
