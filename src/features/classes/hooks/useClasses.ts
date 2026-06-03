import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import type { Class } from '@/types/models'

async function fetchClasses(schoolId: string): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', schoolId)
    .order('grade_level', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return (data as Class[]) ?? []
}

export function useClasses() {
  const schoolId = useAuthStore((s) => s.school?.id ?? '')

  return useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => fetchClasses(schoolId),
    enabled: !!schoolId,
  })
}

export interface UpsertClassPayload {
  id?: string
  name: string
  grade_level: string
  capacity?: number | null
}

export function useUpsertClass() {
  const qc = useQueryClient()
  const { school, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: UpsertClassPayload) => {
      if (!school) throw new Error('No school context')

      const row = {
        ...payload,
        school_id: school.id,
        created_by: profile?.id ?? null,
      }

      if (payload.id) {
        const { id, ...rest } = row
        const { error } = await supabase.from('classes').update(rest).eq('id', id)
        if (error) throw error
      } else {
        const { id: _id, ...rest } = row
        const { error } = await supabase.from('classes').insert(rest)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useDeleteClass() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}
