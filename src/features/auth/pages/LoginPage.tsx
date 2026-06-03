import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROLE_LABELS, type UserRole } from '@/types/roles'
import { cn } from '@/utils/cn'

interface LoginForm {
  email: string
  password: string
}

interface DemoAccount {
  role: UserRole
  email: string
  password: string
  color: string
  initials: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'school_admin',
    email: 'admin@demo.smartlearnlms.co.zw',
    password: 'demo1234',
    color: 'bg-blue-100 text-blue-700 ring-blue-200',
    initials: 'SA',
  },
  {
    role: 'teacher',
    email: 'teacher@demo.smartlearnlms.co.zw',
    password: 'demo1234',
    color: 'bg-violet-100 text-violet-700 ring-violet-200',
    initials: 'TC',
  },
  {
    role: 'student',
    email: 'student@demo.smartlearnlms.co.zw',
    password: 'demo1234',
    color: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    initials: 'ST',
  },
  {
    role: 'parent',
    email: 'parent@demo.smartlearnlms.co.zw',
    password: 'demo1234',
    color: 'bg-amber-100 text-amber-700 ring-amber-200',
    initials: 'PA',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [activeDemo, setActiveDemo] = useState<UserRole | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  function fillDemo(account: DemoAccount) {
    setValue('email', account.email, { shouldValidate: true })
    setValue('password', account.password, { shouldValidate: true })
    setActiveDemo(account.role)
    setServerError(null)
  }

  async function onSubmit({ email, password }: LoginForm) {
    setServerError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setServerError(error.message)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            SmartLearner<span className="text-primary-600">LMS</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">School Management System for Zimbabwe</p>
        </div>

        {/* Demo accounts */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Try a demo account
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => fillDemo(account)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all',
                  activeDemo === account.role
                    ? 'border-primary-500 bg-white shadow-sm'
                    : 'border-transparent bg-white hover:border-slate-200 hover:shadow-sm',
                )}
              >
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ring-1 shrink-0', account.color)}>
                  {account.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {ROLE_LABELS[account.role]}
                  </p>
                  <p className="text-xs text-slate-400">click to fill</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="admin@school.co.zw"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            Contact your school administrator for access.
          </p>
        </div>
      </div>
    </div>
  )
}
