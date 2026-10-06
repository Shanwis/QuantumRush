const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return (
    (import.meta.env.VITE_SUPABASE_URL ?? '').length > 0 &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').length > 0
  );
}

export interface LeaderboardRow {
  player_name: string;
  level: number;
  moves: number;
  time_seconds: number;
  score: number;
  created_at: string;
}

function headers(): Record<string, string> {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchTopScores(limit: number): Promise<LeaderboardRow[]> {
  const query = new URLSearchParams({
    select: 'player_name,level,moves,time_seconds,score,created_at',
    order: 'score.desc,created_at.asc',
    limit: String(limit),
  });
  const res = await fetch(`${url}/rest/v1/leaderboard?${query.toString()}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`leaderboard fetch failed: ${res.status}`);
  return (await res.json()) as LeaderboardRow[];
}

export async function submitScoreRpc(
  name: string,
  level: number,
  moves: number,
  timeSeconds: number,
): Promise<void> {
  const res = await fetch(`${url}/rest/v1/rpc/submit_score`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      p_name: name,
      p_level: level,
      p_moves: moves,
      p_time_seconds: timeSeconds,
    }),
  });
  if (!res.ok) throw new Error(`score submit failed: ${res.status}`);
}
