-- Commento didattico:
-- Scopo del file: aggiorna il vincolo sullo stato video utente per supportare anche il valore "hidden".
-- Flusso: rimuove il check precedente e lo ricrea includendo unseen/seen/hidden.
ALTER TABLE user_video_states
  DROP CONSTRAINT IF EXISTS user_video_states_seen_status_check;

ALTER TABLE user_video_states
  ADD CONSTRAINT user_video_states_seen_status_check
  CHECK (seen_status IN ('unseen', 'seen', 'hidden'));
