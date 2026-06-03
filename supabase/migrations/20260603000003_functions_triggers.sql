-- ============================================================
-- SmartLearnerLMS — Migration 003: Auth Functions & Triggers
-- ============================================================

-- ============================================================
-- Custom JWT Claims Hook
-- Stamps school_id and user_role into the access token.
-- Register this in Supabase Dashboard:
--   Authentication → Hooks → Custom Access Token Hook
--   Function: public.custom_access_token_hook
-- ============================================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  claims     jsonb;
  user_data  record;
BEGIN
  SELECT school_id, role
  INTO   user_data
  FROM   public.profiles
  WHERE  id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';

  IF user_data IS NOT NULL THEN
    claims := jsonb_set(claims, '{school_id}',  to_jsonb(user_data.school_id::text));
    claims := jsonb_set(claims, '{user_role}',  to_jsonb(user_data.role));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- ============================================================
-- Auto-profile creation trigger (fires after auth.users INSERT)
-- Populates a partial profile row so the user can log in;
-- the application completes the profile (school_id, role) on
-- the first onboarding step.
--
-- NOTE: This trigger is a fallback safety net only. The primary
-- path is the application explicitly calling INSERT INTO profiles.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- No-op placeholder. Application handles profile creation.
  -- Extend this function in a future migration if needed.
  RETURN NEW;
END;
$$;

-- ============================================================
-- Seed: Insert a default school for development
-- Remove or replace before production deployment.
-- ============================================================
INSERT INTO public.schools (name, slug, email, is_active)
VALUES (
  'Demo School',
  'demo-school',
  'admin@demoschool.ac.zw',
  true
)
ON CONFLICT (slug) DO NOTHING;
