-- Commento didattico:
-- Scopo del file: rimuovere overlap tra policy permissive sulla stessa azione (soprattutto SELECT)
-- mantenendo invariata la semantica autorizzativa.

-- ============================================================
-- Migration 010: Fix multiple permissive policy overlap
-- ============================================================

-- ------------------------------
-- user_provider_credentials
-- ------------------------------
DROP POLICY IF EXISTS "Credentials: read own" ON public.user_provider_credentials;
DROP POLICY IF EXISTS "Credentials: manage own" ON public.user_provider_credentials;

CREATE POLICY "Credentials: read own" ON public.user_provider_credentials
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR is_super_admin());

CREATE POLICY "Credentials: insert own" ON public.user_provider_credentials
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Credentials: update own" ON public.user_provider_credentials
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Credentials: delete own" ON public.user_provider_credentials
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ------------------------------
-- channels
-- ------------------------------
DROP POLICY IF EXISTS "Channels: authenticated read" ON public.channels;
DROP POLICY IF EXISTS "Channels: admin write" ON public.channels;

CREATE POLICY "Channels: authenticated read" ON public.channels
  FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Channels: admin insert" ON public.channels
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "Channels: admin update" ON public.channels
  FOR UPDATE TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Channels: admin delete" ON public.channels
  FOR DELETE TO authenticated
  USING (is_super_admin());

-- ------------------------------
-- videos
-- ------------------------------
DROP POLICY IF EXISTS "Videos: authenticated read" ON public.videos;
DROP POLICY IF EXISTS "Videos: admin write" ON public.videos;

CREATE POLICY "Videos: authenticated read" ON public.videos
  FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Videos: admin insert" ON public.videos
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "Videos: admin update" ON public.videos
  FOR UPDATE TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Videos: admin delete" ON public.videos
  FOR DELETE TO authenticated
  USING (is_super_admin());

-- ------------------------------
-- video_analysis
-- ------------------------------
DROP POLICY IF EXISTS "Video analysis: authenticated read" ON public.video_analysis;
DROP POLICY IF EXISTS "Video analysis: admin write" ON public.video_analysis;

CREATE POLICY "Video analysis: authenticated read" ON public.video_analysis
  FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Video analysis: admin insert" ON public.video_analysis
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "Video analysis: admin update" ON public.video_analysis
  FOR UPDATE TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Video analysis: admin delete" ON public.video_analysis
  FOR DELETE TO authenticated
  USING (is_super_admin());

-- ------------------------------
-- video_localized_content
-- ------------------------------
DROP POLICY IF EXISTS "Localized content: authenticated read" ON public.video_localized_content;
DROP POLICY IF EXISTS "Localized content: admin write" ON public.video_localized_content;

CREATE POLICY "Localized content: authenticated read" ON public.video_localized_content
  FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Localized content: admin insert" ON public.video_localized_content
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "Localized content: admin update" ON public.video_localized_content
  FOR UPDATE TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Localized content: admin delete" ON public.video_localized_content
  FOR DELETE TO authenticated
  USING (is_super_admin());

-- ------------------------------
-- jobs
-- ------------------------------
DROP POLICY IF EXISTS "Jobs: read own or admin" ON public.jobs;
DROP POLICY IF EXISTS "Jobs: admin manage" ON public.jobs;

CREATE POLICY "Jobs: read own or admin" ON public.jobs
  FOR SELECT TO authenticated
  USING (created_by_user_id = (select auth.uid()) OR is_super_admin());

CREATE POLICY "Jobs: admin insert" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "Jobs: admin update" ON public.jobs
  FOR UPDATE TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Jobs: admin delete" ON public.jobs
  FOR DELETE TO authenticated
  USING (is_super_admin());
