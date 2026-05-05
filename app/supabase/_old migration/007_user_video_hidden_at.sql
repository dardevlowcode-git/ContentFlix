-- Commento didattico:
-- Scopo del file: aggiunge timestamp dedicato allo stato nascosto nel layer utente video.
-- Moduli richiamati: PostgreSQL migration
-- Flusso: estende `user_video_states` con colonna `hidden_at` valorizzata dalle mutazioni API.

ALTER TABLE user_video_states
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;
