import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import type { TimetableSlot } from '@/types/models'

export type TimetableSlotRow = TimetableSlot & {
  subject?: { id: string; name: string; code: string }
  teacher?: { id: string; first_name: string; last_name: string } | null
}

async function fetchSlots(schoolId: string, classId: string): Promise<TimetableSlotRow[]> {
  const { data, error } = await supabase
    .from('timetable_slots')
    .select('*, subject:subjects(id, name, code), teacher:profiles(id, first_name, last_name)')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .order('day_of_week', { ascending: true })
    .order('period_number', { ascending: true })

  if (error) throw error
  return (data as TimetableSlotRow[]) ?? []
}

export function useTimetable(classId: string) {
  const schoolId = useAuthStore((s) => s.school?.id ?? '')

  return useQuery({
    queryKey: ['timetable_slots', schoolId, classId],
    queryFn: () => fetchSlots(schoolId, classId),
    enabled: !!schoolId && !!classId,
  })
}

export interface UpsertSlotPayload {
  id?: string
  class_id: string
  subject_id: string
  teacher_id?: string | null
  day_of_week: number
  period_number: number
  start_time?: string | null
  end_time?: string | null
  room?: string | null
}

export function useUpsertSlot() {
  const qc = useQueryClient()
  const { school, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: UpsertSlotPayload) => {
      if (!school) throw new Error('No school context')

      const row = { ...payload, school_id: school.id, created_by: profile?.id ?? null }

      if (payload.id) {
        const { id, ...rest } = row
        const { error } = await supabase.from('timetable_slots').update(rest).eq('id', id)
        if (error) throw error
      } else {
        const { id: _id, ...rest } = row
        const { error } = await supabase.from('timetable_slots').insert(rest)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable_slots'] })
    },
  })
}

export function useDeleteSlot() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timetable_slots').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable_slots'] })
    },
  })
}
