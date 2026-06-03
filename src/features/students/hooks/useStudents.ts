import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import type { Student } from '@/types/models'

export type StudentRow = Student & { class?: { id: string; name: string } }

export interface StudentFilters {
  search?: string
  classId?: string
  isActive?: boolean
}

async function fetchStudents(schoolId: string, filters: StudentFilters): Promise<StudentRow[]> {
  let query = supabase
    .from('students')
    .select('*, class:classes(id, name)')
    .eq('school_id', schoolId)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (filters.search) {
    const term = `%${filters.search}%`
    query = query.or(`first_name.ilike.${term},last_name.ilike.${term},student_number.ilike.${term}`)
  }

  if (filters.classId) {
    query = query.eq('class_id', filters.classId)
  }

  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  const { data, error } = await query
  if (error) throw error
  return (data as StudentRow[]) ?? []
}

export function useStudents(filters: StudentFilters = {}) {
  const schoolId = useAuthStore((s) => s.school?.id ?? '')

  return useQuery({
    queryKey: ['students', schoolId, filters],
    queryFn: () => fetchStudents(schoolId, filters),
    enabled: !!schoolId,
  })
}

export interface UpsertStudentPayload {
  id?: string
  student_number: string
  first_name: string
  last_name: string
  date_of_birth?: string | null
  gender?: string | null
  class_id?: string | null
  address?: string | null
  guardian_name?: string | null
  guardian_phone?: string | null
  guardian_email?: string | null
  is_active?: boolean
}

export function useUpsertStudent() {
  const qc = useQueryClient()
  const { school, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: UpsertStudentPayload) => {
      if (!school) throw new Error('No school context')

      const row = {
        ...payload,
        school_id: school.id,
        created_by: profile?.id ?? null,
      }

      if (payload.id) {
        const { id, ...rest } = row
        const { error } = await supabase
          .from('students')
          .update(rest)
          .eq('id', id)
        if (error) throw error
      } else {
        const { id: _id, ...rest } = row
        const { error } = await supabase
          .from('students')
          .insert(rest)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useDeleteStudent() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('students').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
