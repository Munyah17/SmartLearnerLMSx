import { useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import type { Profile, School } from '@/types/models'

async function loadUserData(
  user: User,
  session: Session,
  setAuth: (u: User, s: Session, p: Profile, sc: School) => void,
  clearAuth: () => void,
) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) { clearAuth(); return }

  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('*')
    .eq('id', profile.school_id)
    .single()

  if (schoolError || !school) { clearAuth(); return }

  setAuth(user, session, profile as Profile, school as School)
}

export function useAuthInit() {
  const { setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLoading(true)
        loadUserData(session.user, session, setAuth, clearAuth)
      } else {
        clearAuth()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setLoading(true)
          loadUserData(session.user, session, setAuth, clearAuth)
        } else {
          clearAuth()
        }
      },
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
