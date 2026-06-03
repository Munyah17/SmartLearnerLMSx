import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile, School } from '@/types/models'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  school: School | null
  isLoading: boolean
  setAuth: (user: User, session: Session, profile: Profile, school: School) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      school: null,
      isLoading: true,
      setAuth: (user, session, profile, school) =>
        set({ user, session, profile, school, isLoading: false }),
      clearAuth: () =>
        set({ user: null, session: null, profile: null, school: null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'sl-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        school: state.school,
      }),
    },
  ),
)
