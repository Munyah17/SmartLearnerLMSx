import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { useClasses } from '@/features/classes/hooks/useClasses'
import { useSubjects } from '@/features/subjects/hooks/useSubjects'
import { useStudents } from '@/features/students/hooks/useStudents'
import { useAuthStore } from '@/features/auth/authStore'
import { useGrades, useSaveGrades, getGradeLetter, type GradeContext } from '../hooks/useGrades'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import type { AssessmentType } from '@/types/models'

const ASSESSMENT_TYPES: AssessmentType[] = ['classwork', 'test', 'exam', 'coursework', 'project', 'assignment']

export default function GradesPage() {
  const { school } = useAuthStore()
  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects()

  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [term, setTerm] = useState('Term 1')
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('test')
  const [assessmentName, setAssessmentName] = useState('')
  const [maxScore, setMaxScore] = useState(100)

  const activeClassId = classId || classes[0]?.id || ''
  const activeSubjectId = subjectId || subjects[0]?.id || ''
  const academicYear = school?.academic_year ?? String(new Date().getFullYear())

  const ctx: GradeContext = {
    classId: activeClassId, subjectId: activeSubjectId, term, academicYear, assessmentName,
  }

  const { data: students = [], isLoading: studentsLoading } = useStudents({ classId: activeClassId, isActive: true })
  const { data: existing = [] } = useGrades(ctx)
  const save = useSaveGrades()

  const [scores, setScores] = useState<Record<string, string>>({})

  useEffect(() => {
    const initial: Record<string, string> = {}
    for (const s of students) {
      const record = existing.find((g) => g.student_id === s.id)
      initial[s.id] = record ? String(record.score) : ''
    }
    setScores(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClassId, activeSubjectId, term, assessmentName, students.length, existing.length])

  const ready = !!(activeClassId && activeSubjectId && term && assessmentName)

  async function handleSave() {
    const entries = students
      .filter((s) => scores[s.id] !== undefined && scores[s.id] !== '')
      .map((s) => ({ student_id: s.id, score: parseFloat(scores[s.id]) }))

    if (entries.length === 0) return

    await save.mutateAsync({ ctx, assessmentType, maxScore, entries })
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Grades &amp; Results</h1>
        <p className="text-sm text-slate-500 mt-1">Record assessment scores per class and subject</p>
      </div>

      {/* Assessment context */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Class" value={activeClassId} onChange={(e) => setClassId(e.target.value)}>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Subject" value={activeSubjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input label="Term" value={term} onChange={(e) => setTerm(e.target.value)} />
          <Select label="Assessment Type" value={assessmentType} onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}>
            {ASSESSMENT_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Assessment Name"
            placeholder="e.g. Mid-term Test"
            value={assessmentName}
            onChange={(e) => setAssessmentName(e.target.value)}
          />
          <Input
            label="Max Score"
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(parseFloat(e.target.value) || 100)}
          />
        </div>
      </div>

      {/* Roster */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!ready ? (
          <div className="py-16 text-center">
            <BarChart3 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Name the assessment to begin</p>
            <p className="text-xs text-slate-400 mt-1">Fill in the assessment details above to load the roster</p>
          </div>
        ) : studentsLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-500">No students in this class</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-50">
              {students.map((s) => {
                const score = scores[s.id] ?? ''
                const pct = score !== '' ? (parseFloat(score) / maxScore) * 100 : null
                return (
                  <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{s.first_name} {s.last_name}</p>
                        <p className="text-xs text-slate-400 font-mono">{s.student_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={maxScore}
                        value={score}
                        onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        placeholder="—"
                        className="w-20 text-sm text-center border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-xs text-slate-400 w-14">/ {maxScore}</span>
                      {pct !== null && !isNaN(pct) && (
                        <Badge variant={pct >= 50 ? 'green' : 'red'}>{getGradeLetter(pct)}</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-end">
              <Button onClick={handleSave} loading={save.isPending}>
                Save Grades
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
