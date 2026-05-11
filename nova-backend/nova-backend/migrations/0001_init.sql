CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle      TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  rating      INT  NOT NULL DEFAULT 1500,
  country     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game        TEXT NOT NULL,
  mode        TEXT NOT NULL,
  server      TEXT NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at    TIMESTAMPTZ,
  winner_id   UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS match_players (
  match_id  UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id),
  rating_before INT NOT NULL,
  rating_after  INT,
  PRIMARY KEY (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournaments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  game         TEXT NOT NULL,
  status       TEXT NOT NULL,
  prize_cents  BIGINT NOT NULL DEFAULT 0,
  capacity     INT NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  region       TEXT NOT NULL DEFAULT 'Global'
);

CREATE TABLE IF NOT EXISTS tournament_entries (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  seed          INT,
  PRIMARY KEY (tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS analytics_daily (
  day              DATE PRIMARY KEY,
  dau              INT NOT NULL DEFAULT 0,
  matches_played   INT NOT NULL DEFAULT 0,
  peak_concurrent  INT NOT NULL DEFAULT 0,
  signups          INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC);
CREATE INDEX IF NOT EXISTS idx_matches_started ON matches(started_at DESC);
