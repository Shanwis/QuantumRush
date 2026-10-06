-- Qubit Rush V2 — leaderboard schema
--
-- SCORE FORMULA (must stay in lockstep with src/game/scoring.ts):
--   score = GREATEST(100, 5000 - moves * 120 - time_seconds * 15)
--           * (CASE level WHEN 2 THEN 2 WHEN 3 THEN 4 WHEN 4 THEN 8 END)
-- Clients never send a score. The generated column computes it server-side,
-- so tampered scores are impossible; parity is pinned by
-- src/game/leaderboard.test.ts ("formula matches SQL generated column").

CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    level SMALLINT NOT NULL CHECK (level IN (2, 3, 4)),
    moves INTEGER NOT NULL CHECK (moves BETWEEN 1 AND 500),
    time_seconds INTEGER NOT NULL CHECK (time_seconds BETWEEN 0 AND 86400),
    score BIGINT GENERATED ALWAYS AS (
        GREATEST(100, 5000 - moves * 120 - time_seconds * 15)
        * (CASE level WHEN 2 THEN 2 WHEN 3 THEN 4 WHEN 4 THEN 8 END)
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT player_name_format CHECK (player_name ~ '^[A-Z0-9 ]{1,12}$'),
    CONSTRAINT player_name_trimmed CHECK (player_name = btrim(player_name)),
    CONSTRAINT score_plausible CHECK (score BETWEEN 200 AND 40000),
    UNIQUE (player_name, level)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_level_score
ON public.leaderboard (level, score DESC, created_at ASC);

-- All writes go through submit_score(); the table itself is read-only to clients.
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read" ON public.leaderboard;
CREATE POLICY "public read"
ON public.leaderboard
FOR SELECT
TO anon, authenticated
USING (true);

-- Upsert-keep-best: repeated submissions replace the row only when better.
-- Spam therefore cannot climb the board, and one entry per player per level.
CREATE OR REPLACE FUNCTION public.submit_score(
    p_name TEXT,
    p_level SMALLINT,
    p_moves INTEGER,
    p_time_seconds INTEGER
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    INSERT INTO public.leaderboard (player_name, level, moves, time_seconds)
    VALUES (p_name, p_level, p_moves, p_time_seconds)
    ON CONFLICT (player_name, level) DO UPDATE
    SET moves = EXCLUDED.moves,
        time_seconds = EXCLUDED.time_seconds,
        created_at = now()
    WHERE leaderboard.score <
        GREATEST(100, 5000 - EXCLUDED.moves * 120 - EXCLUDED.time_seconds * 15)
        * (CASE EXCLUDED.level WHEN 2 THEN 2 WHEN 3 THEN 4 ELSE 8 END);
$$;

REVOKE EXECUTE ON FUNCTION public.submit_score(TEXT, SMALLINT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_score(TEXT, SMALLINT, INTEGER, INTEGER) TO anon, authenticated;
