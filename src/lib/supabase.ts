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

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresAt: number;
}

const AUTH_KEY = 'qubit_rush_auth';

function loadSession(): StoredSession | null {
  try {
    const raw = globalThis.localStorage?.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: StoredSession | null): void {
  try {
    if (session === null) globalThis.localStorage?.removeItem(AUTH_KEY);
    else globalThis.localStorage?.setItem(AUTH_KEY, JSON.stringify(session));
  } catch {
    return;
  }
}

async function authRequest(path: string, body: unknown): Promise<StoredSession> {
  const res = await fetch(`${url}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`auth failed: ${res.status}`);
  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    user?: { id: string };
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    userId: data.user?.id ?? '',
    expiresAt: (data.expires_at ?? Math.floor(Date.now() / 1000) + 3600) * 1000,
  };
}

export async function ensureAnonSession(): Promise<string> {
  let session = loadSession();
  if (session !== null && session.expiresAt - 60_000 > Date.now()) {
    return session.accessToken;
  }
  if (session !== null) {
    try {
      session = await authRequest('token?grant_type=refresh_token', {
        refresh_token: session.refreshToken,
      });
      saveSession(session);
      return session.accessToken;
    } catch {
      saveSession(null);
    }
  }
  session = await authRequest('signup', { data: {} });
  saveSession(session);
  return session.accessToken;
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
  const token = await ensureAnonSession();
  const res = await fetch(`${url}/rest/v1/rpc/submit_score`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_name: name,
      p_level: level,
      p_moves: moves,
      p_time_seconds: timeSeconds,
    }),
  });
  if (!res.ok) throw new Error(`score submit failed: ${res.status}`);
}
