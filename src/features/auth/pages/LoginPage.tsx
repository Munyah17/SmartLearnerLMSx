export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            SmartLearner<span className="text-primary-600">LMS</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            School Management System for Zimbabwe
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-slate-600">Authentication</p>
          <p className="text-xs text-slate-400 mt-1">Coming in Phase 2</p>
        </div>
      </div>
    </div>
  )
}
