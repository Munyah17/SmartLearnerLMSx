import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import type { Attendance, AttendanceStatus } from '@/types/models'

async function fetchAttendance(schoolId: string, classId: string, date: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .eq('date', date)

  if (error) throw error
  return (data as Attendance[]) ?? []
}

export function useAttendance(classId: string, date: string) {
  const schoolId = useAuthStore((s) => s.school?.id ?? '')

  return useQuery({
    queryKey: ['attendance', schoolId, classId, date],
    queryFn: () => fetchAttendance(schoolId, classId, date),
    enabled: !!schoolId && !!classId && !!date,
  })
}

export interface AttendanceEntry {
  student_id: string
  status: AttendanceStatus
  notes?: string | null
}

export function useSaveAttendance() {
  const qc = useQueryClient()
  const { school, profile } = useAuthStore()

  return useMutation({
    mutationFn: async ({ classId, date, entries }: { classId: string; date: string; entries: AttendanceEntry[] }) => {
      if (!school) throw new Error('No school context')

      const rows = entries.map((e) => ({
        school_id: school.id,
        student_id: e.student_id,
        class_id: classId,
        date,
        status: e.status,
        notes: e.notes ?? null,
        recorded_by: profile?.id ?? null,
      }))

      const { error } = await supabase
        .from('attendance')
        .upsert(rows, { onConflict: 'school_id,student_id,date' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}
