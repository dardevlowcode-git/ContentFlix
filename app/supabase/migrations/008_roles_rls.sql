-- Commento didattico:
-- Scopo del file: chiude il gap segnalato da Supabase Security Advisor su `public.roles`.
-- Flusso: abilita RLS sulla tabella e aggiunge una policy minima di sola lettura per utenti autenticati.

-- ============================================================
-- Migration 008: Enable RLS on public.roles
-- ============================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'roles'
      AND policyname = 'Roles: authenticated read'
  ) THEN
    CREATE POLICY "Roles: authenticated read" ON public.roles
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END;
$$;
