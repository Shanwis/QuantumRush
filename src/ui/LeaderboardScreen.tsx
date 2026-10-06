import { useEffect, useState } from 'react';
import { fetchLeaderboard, type LeaderboardData } from '../game/leaderboard';
import { loadBests } from '../game/storage';
import { LEVEL_LABELS, PLAY_LEVELS, type QubitCount } from '../game/types';

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [tab, setTab] = useState<QubitCount>(2);
  const bests = loadBests();

  const load = () => {
    setData(null);
    void fetchLeaderboard().then(setData);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <header className="hud">
        <div className="hud__stat">
          <span className="hud__label">GLOBAL</span>
          <span className="hud__value">LEADERBOARD</span>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--ghost" onClick={load}>
            REFRESH
          </button>
          <button className="btn btn--ghost" onClick={onBack}>
            BACK TO MENU
          </button>
        </div>
      </header>

      {data === null ? (
        <p className="hint hint--center">SCANNING...</p>
      ) : (
        <>
          {data.source === 'offline' ? (
            <p className="leaderboard-banner">LINK DOWN — LOCAL RECORDS ONLY</p>
          ) : null}
          <div className="leaderboard-tabs">
            {PLAY_LEVELS.map((level) => (
              <button
                key={level}
                className={`btn ${tab === level ? 'btn--amber' : 'btn--ghost'}`}
                onClick={() => setTab(level)}
              >
                {LEVEL_LABELS[level]}
              </button>
            ))}
          </div>
          <div className="leaderboard-columns">
            {PLAY_LEVELS.map((level) => (
              <section
                key={level}
                className={`panel leaderboard-col ${tab === level ? '' : 'leaderboard-col--hidden'}`}
              >
                <h2 className="panel__title">{LEVEL_LABELS[level]}</h2>
                <div className="leaderboard-scroll">
                  {data.byLevel[level].length === 0 ? (
                    <p className="hint">
                      {data.source === 'live'
                        ? 'NO SCORES YET'
                        : `YOUR BEST: ${bests[level] ?? '---'}`}
                    </p>
                  ) : (
                    data.byLevel[level].map((entry, index) => (
                      <div
                        className="leaderboard-row"
                        key={`${entry.playerName}-${index}`}
                      >
                        <span
                          className={`leaderboard-rank ${
                            index < 3 ? `leaderboard-rank--top${index + 1}` : ''
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <span className="leaderboard-name">{entry.playerName}</span>
                        <span className="leaderboard-score">{entry.score}</span>
                        <span className="leaderboard-stats">
                          {entry.moves}mv {entry.timeSeconds}s
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
