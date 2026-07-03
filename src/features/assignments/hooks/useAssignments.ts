import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import type { Assignment, AssignmentSubmission } from '@/types/models'

export type AssignmentRow = Assignment & {
  class?: { id: string; name: string }
  subject?: { id: string; name: string }
}

export interface AssignmentFilters {
  classId?: string
}

async function fetchAssignments(schoolId: string, filters: AssignmentFilters): Promise<AssignmentRow[]> {
  let query = supabase
    .from('assignments')
    .select('*, class:classes(id, name), subject:subjects(id, name)')
    .eq('school_id', schoolId)
    .order('due_date', { ascending: true })

  if (filters.classId) query = query.eq('class_id', filters.classId)

  const { data, error } = await query
  if (error) throw error
  return (data as AssignmentRow[]) ?? []
}

export function useAssignments(filters: AssignmentFilters = {}) {
  const schoolId = useAuthStore((s) => s.school?.id ?? '')

  return useQuery({
    queryKey: ['assignments', schoolId, filters],
    queryFn: () => fetchAssignments(schoolId, filters),
    enabled: !!schoolId,
  })
}

export interface UpsertAssignmentPayload {
  id?: string
  class_id: string
  subject_id: string
  title: string
  description?: string | null
  due_date?: string | null
  max_score?: number
}

export function useUpsertAssignment() {
  const qc = useQueryClient()
  const { school, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: UpsertAssignmentPayload) => {
      if (!school) throw new Error('No school context')

      const row = { ...payload, school_id: school.id, created_by: profile?.id ?? null }

      if (payload.id) {
        const { id, ...rest } = row
        const { error } = await supabase.from('assignments').update(rest).eq('id', id)
        if (error) throw error
      } else {
        const { id: _id, ...rest } = row
        const { error } = await supabase.from('assignments').insert(rest)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export function useDeleteAssignment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assignments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

async function fetchSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)

  if (error) throw error
  return (data as AssignmentSubmission[]) ?? []
}

export function useSubmissions(assignmentId: string) {
  return useQuery({
    queryKey: ['assignment_submissions', assignmentId],
    queryFn: () => fetchSubmissions(assignmentId),
    enabled: !!assignmentId,
  })
}

export interface GradeSubmissionEntry {
  student_id: string
  score: number | null
  feedback?: string | null
}

export function useSaveSubmissions() {
  const qc = useQueryClient()
  const { profile } = useAuthStore()

  return useMutation({
    mutationFn: async ({ assignmentId, entries }: { assignmentId: string; entries: GradeSubmissionEntry[] }) => {
      const rows = entries.map((e) => ({
        assignment_id: assignmentId,
        student_id: e.student_id,
        score: e.score,
        feedback: e.feedback ?? null,
        graded_by: profile?.id ?? null,
      }))

      const { error } = await supabase
        .from('assignment_submissions')
        .upsert(rows, { onConflict: 'assignment_id,student_id' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignment_submissions'] })
    },
  })
}
