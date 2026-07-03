import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import type { Subject } from '@/types/models'

async function fetchSubjects(schoolId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', schoolId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data as Subject[]) ?? []
}

export function useSubjects() {
  const schoolId = useAuthStore((s) => s.school?.id ?? '')

  return useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => fetchSubjects(schoolId),
    enabled: !!schoolId,
  })
}

export interface UpsertSubjectPayload {
  id?: string
  name: string
  code: string
  description?: string | null
}

export function useUpsertSubject() {
  const qc = useQueryClient()
  const { school } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: UpsertSubjectPayload) => {
      if (!school) throw new Error('No school context')

      const row = { ...payload, school_id: school.id }

      if (payload.id) {
        const { id, ...rest } = row
        const { error } = await supabase.from('subjects').update(rest).eq('id', id)
        if (error) throw error
      } else {
        const { id: _id, ...rest } = row
        const { error } = await supabase.from('subjects').insert(rest)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}

export function useDeleteSubject() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}
