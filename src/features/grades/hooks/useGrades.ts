import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import type { AssessmentType, Grade } from '@/types/models'

export interface GradeContext {
  classId: string
  subjectId: string
  term: string
  academicYear: string
  assessmentName: string
}

function contextReady(ctx: GradeContext) {
  return !!(ctx.classId && ctx.subjectId && ctx.term && ctx.academicYear && ctx.assessmentName)
}

async function fetchGrades(schoolId: string, ctx: GradeContext): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('school_id', schoolId)
    .eq('class_id', ctx.classId)
    .eq('subject_id', ctx.subjectId)
    .eq('term', ctx.term)
    .eq('academic_year', ctx.academicYear)
    .eq('assessment_name', ctx.assessmentName)

  if (error) throw error
  return (data as Grade[]) ?? []
}

export function useGrades(ctx: GradeContext) {
  const schoolId = useAuthStore((s) => s.school?.id ?? '')

  return useQuery({
    queryKey: ['grades', schoolId, ctx],
    queryFn: () => fetchGrades(schoolId, ctx),
    enabled: !!schoolId && contextReady(ctx),
  })
}

export interface GradeEntry {
  student_id: string
  score: number
  comment?: string | null
}

export function useSaveGrades() {
  const qc = useQueryClient()
  const { school, profile } = useAuthStore()

  return useMutation({
    mutationFn: async ({
      ctx, assessmentType, maxScore, entries,
    }: {
      ctx: GradeContext
      assessmentType: AssessmentType
      maxScore: number
      entries: GradeEntry[]
    }) => {
      if (!school) throw new Error('No school context')

      const rows = entries.map((e) => ({
        school_id: school.id,
        student_id: e.student_id,
        class_id: ctx.classId,
        subject_id: ctx.subjectId,
        term: ctx.term,
        academic_year: ctx.academicYear,
        assessment_type: assessmentType,
        assessment_name: ctx.assessmentName,
        score: e.score,
        max_score: maxScore,
        grade_letter: getGradeLetter((e.score / maxScore) * 100),
        comment: e.comment ?? null,
        recorded_by: profile?.id ?? null,
      }))

      const { error } = await supabase
        .from('grades')
        .upsert(rows, { onConflict: 'student_id,subject_id,term,academic_year,assessment_name' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] })
    },
  })
}

export function getGradeLetter(percentage: number): string {
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B'
  if (percentage >= 60) return 'C'
  if (percentage >= 50) return 'D'
  return 'F'
}
