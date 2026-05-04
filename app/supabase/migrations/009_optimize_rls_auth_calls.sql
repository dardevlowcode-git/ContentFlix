-- Commento didattico:
-- Scopo del file: ottimizzare le policy RLS evitando rivalutazioni per-riga di auth.uid().
-- Flusso: ricrea in modo idempotente le policy che usano auth.uid(), sostituendo con (select auth.uid()).

-- ============================================================
-- Migration 009: Optimize RLS auth function calls
-- ============================================================

-- Helper aggiornato: evita chiamata diretta auth.uid() nel predicato interno.
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = (select auth.uid())
      AND r.name = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS
DROP POLICY IF EXISTS "Users: read own" ON public.users;
CREATE POLICY "Users: read own" ON public.users
  FOR SELECT USING (id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "Users: update own" ON public.users;
CREATE POLICY "Users: update own" ON public.users
  FOR UPDATE USING (id = (select auth.uid()));

-- USER IDENTITIES
DROP POLICY IF EXISTS "User identities: read own" ON public.user_identities;
CREATE POLICY "User identities: read own" ON public.user_identities
  FOR SELECT USING (user_id = (select auth.uid()) OR is_super_admin());

-- USER ROLES
DROP POLICY IF EXISTS "User roles: read own" ON public.user_roles;
CREATE POLICY "User roles: read own" ON public.user_roles
  FOR SELECT USING (user_id = (select auth.uid()) OR is_super_admin());

-- USER PROVIDER CREDENTIALS
DROP POLICY IF EXISTS "Credentials: read own" ON public.user_provider_credentials;
CREATE POLICY "Credentials: read own" ON public.user_provider_credentials
  FOR SELECT USING (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "Credentials: manage own" ON public.user_provider_credentials;
CREATE POLICY "Credentials: manage own" ON public.user_provider_credentials
  FOR ALL USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Credential checks: read own" ON public.credential_checks;
CREATE POLICY "Credential checks: read own" ON public.credential_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM user_provider_credentials c
      WHERE c.id = credential_id
        AND (c.user_id = (select auth.uid()) OR is_super_admin())
    )
  );

-- CANONICAL CONTENT READ
DROP POLICY IF EXISTS "Channels: authenticated read" ON public.channels;
CREATE POLICY "Channels: authenticated read" ON public.channels
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Videos: authenticated read" ON public.videos;
CREATE POLICY "Videos: authenticated read" ON public.videos
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Video analysis: authenticated read" ON public.video_analysis;
CREATE POLICY "Video analysis: authenticated read" ON public.video_analysis
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Localized content: authenticated read" ON public.video_localized_content;
CREATE POLICY "Localized content: authenticated read" ON public.video_localized_content
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Sync state: authenticated read" ON public.canonical_sync_state;
CREATE POLICY "Sync state: authenticated read" ON public.canonical_sync_state
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);

-- USER LAYER
DROP POLICY IF EXISTS "User channels: own" ON public.user_channels;
CREATE POLICY "User channels: own" ON public.user_channels
  FOR ALL USING (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "User channel prefs: own" ON public.user_channel_preferences;
CREATE POLICY "User channel prefs: own" ON public.user_channel_preferences
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM user_channels uc
      WHERE uc.id = user_channel_id
        AND (uc.user_id = (select auth.uid()) OR is_super_admin())
    )
  );

DROP POLICY IF EXISTS "User video states: own" ON public.user_video_states;
CREATE POLICY "User video states: own" ON public.user_video_states
  FOR ALL USING (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "Watchlists: own" ON public.watchlists;
CREATE POLICY "Watchlists: own" ON public.watchlists
  FOR ALL USING (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "Watchlist items: own" ON public.watchlist_items;
CREATE POLICY "Watchlist items: own" ON public.watchlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM watchlists w
      WHERE w.id = watchlist_id
        AND (w.user_id = (select auth.uid()) OR is_super_admin())
    )
  );

-- JOBS
DROP POLICY IF EXISTS "Jobs: read own or admin" ON public.jobs;
CREATE POLICY "Jobs: read own or admin" ON public.jobs
  FOR SELECT USING (created_by_user_id = (select auth.uid()) OR is_super_admin());

-- ROLES
DROP POLICY IF EXISTS "Roles: authenticated read" ON public.roles;
CREATE POLICY "Roles: authenticated read" ON public.roles
  FOR SELECT USING ((select auth.uid()) IS NOT NULL);
