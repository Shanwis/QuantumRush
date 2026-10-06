-- Upgrade: anonymous-auth row ownership (run once on an existing database)
--
-- Requires "Allow anonymous sign-ins" enabled in Supabase Auth settings.
-- New canonical schema lives in migration.sql; this file upgrades a v1 DB.
--
-- SCORE FORMULA (lockstep with src/game/scoring.ts):
--   score = GREATEST(100, 5000 - moves * 120 - time_seconds * 15)
--           * (CASE level WHEN 2 THEN 2 WHEN 3 THEN 4 WHEN 4 THEN 8 END)

ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.leaderboard SET user_id = gen_random_uuid() WHERE user_id IS NULL;
ALTER TABLE public.leaderboard ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.leaderboard DROP CONSTRAINT IF EXISTS leaderboard_player_name_level_key;
ALTER TABLE public.leaderboard DROP CONSTRAINT IF EXISTS one_entry_per_player_level;
ALTER TABLE public.leaderboard ADD CONSTRAINT one_entry_per_user_level UNIQUE (user_id, level);

DROP FUNCTION IF EXISTS public.submit_score(TEXT, SMALLINT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.submit_score(
    p_name TEXT,
    p_level SMALLINT,
    p_moves INTEGER,
    p_time_seconds INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    INSERT INTO public.leaderboard (user_id, player_name, level, moves, time_seconds)
    VALUES (auth.uid(), p_name, p_level, p_moves, p_time_seconds)
    ON CONFLICT (user_id, level) DO UPDATE
    SET player_name = EXCLUDED.player_name,
        moves = EXCLUDED.moves,
        time_seconds = EXCLUDED.time_seconds,
        created_at = now()
    WHERE public.leaderboard.score <
        GREATEST(100, 5000 - EXCLUDED.moves * 120 - EXCLUDED.time_seconds * 15)
        * (CASE EXCLUDED.level WHEN 2 THEN 2 WHEN 3 THEN 4 ELSE 8 END);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_score(TEXT, SMALLINT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_score(TEXT, SMALLINT, INTEGER, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_score(TEXT, SMALLINT, INTEGER, INTEGER) TO authenticated;
