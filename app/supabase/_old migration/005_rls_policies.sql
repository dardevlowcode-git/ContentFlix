-- Commento didattico:
-- Scopo del file: migrazione database Supabase per creare/aggiornare tabelle, vincoli e policy di sicurezza.
-- Flusso: viene eseguito in ordine cronologico; gli oggetti creati qui vengono poi usati da servizi API e pagine dell'app.

-- ============================================================
-- Migration 005: Row Level Security Policies
-- Utraya V1
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_identities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowlist_entries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions_audit       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_provider_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_checks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analysis            ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analysis_raw        ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_localized_content   ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_sync_state      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_channels             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_channel_preferences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_video_states         ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists                ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_attempts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_locks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_logs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents                 ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: is the current user a super_admin?
-- ============================================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- USERS — own profile only; admin sees all
-- ============================================================
CREATE POLICY "Users: read own" ON users
  FOR SELECT USING (id = auth.uid() OR is_super_admin());

CREATE POLICY "Users: update own" ON users
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- USER IDENTITIES
-- ============================================================
CREATE POLICY "User identities: read own" ON user_identities
  FOR SELECT USING (user_id = auth.uid() OR is_super_admin());

-- ============================================================
-- USER ROLES — read only for users; admin can manage
-- ============================================================
CREATE POLICY "User roles: read own" ON user_roles
  FOR SELECT USING (user_id = auth.uid() OR is_super_admin());

-- ============================================================
-- ALLOWLIST — admin only
-- ============================================================
CREATE POLICY "Allowlist: admin only" ON allowlist_entries
  FOR ALL USING (is_super_admin());

-- ============================================================
-- ADMIN ACTIONS AUDIT — admin only
-- ============================================================
CREATE POLICY "Admin audit: admin only" ON admin_actions_audit
  FOR ALL USING (is_super_admin());

-- ============================================================
-- USER PROVIDER CREDENTIALS — own only
-- ============================================================
CREATE POLICY "Credentials: read own" ON user_provider_credentials
  FOR SELECT USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Credentials: manage own" ON user_provider_credentials
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Credential checks: read own" ON credential_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_provider_credentials c
      WHERE c.id = credential_id AND (c.user_id = auth.uid() OR is_super_admin())
    )
  );

-- ============================================================
-- CANONICAL CONTENT — all authenticated users can read
-- ============================================================
CREATE POLICY "Channels: authenticated read" ON channels
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Channels: admin write" ON channels
  FOR ALL USING (is_super_admin());

CREATE POLICY "Videos: authenticated read" ON videos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Videos: admin write" ON videos
  FOR ALL USING (is_super_admin());

CREATE POLICY "Video analysis: authenticated read" ON video_analysis
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Video analysis: admin write" ON video_analysis
  FOR ALL USING (is_super_admin());

CREATE POLICY "Video analysis raw: admin only" ON video_analysis_raw
  FOR ALL USING (is_super_admin());

CREATE POLICY "Localized content: authenticated read" ON video_localized_content
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Localized content: admin write" ON video_localized_content
  FOR ALL USING (is_super_admin());

CREATE POLICY "Sync state: authenticated read" ON canonical_sync_state
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================
-- USER LAYER — own data only
-- ============================================================
CREATE POLICY "User channels: own" ON user_channels
  FOR ALL USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "User channel prefs: own" ON user_channel_preferences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_channels uc
      WHERE uc.id = user_channel_id AND (uc.user_id = auth.uid() OR is_super_admin())
    )
  );

CREATE POLICY "User video states: own" ON user_video_states
  FOR ALL USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Watchlists: own" ON watchlists
  FOR ALL USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Watchlist items: own" ON watchlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM watchlists w
      WHERE w.id = watchlist_id AND (w.user_id = auth.uid() OR is_super_admin())
    )
  );

-- ============================================================
-- JOBS & OPERATIONS — admin only for full access
-- Users can see their own created jobs
-- ============================================================
CREATE POLICY "Jobs: read own or admin" ON jobs
  FOR SELECT USING (created_by_user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Jobs: admin manage" ON jobs
  FOR ALL USING (is_super_admin());

CREATE POLICY "Job attempts: admin only" ON job_attempts
  FOR ALL USING (is_super_admin());

CREATE POLICY "Job locks: admin only" ON job_locks
  FOR ALL USING (is_super_admin());

CREATE POLICY "App logs: admin only" ON app_logs
  FOR ALL USING (is_super_admin());

CREATE POLICY "Audit logs: admin only" ON audit_logs
  FOR ALL USING (is_super_admin());

CREATE POLICY "Incidents: admin only" ON incidents
  FOR ALL USING (is_super_admin());
