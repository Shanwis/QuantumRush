import { useCallback, useEffect, useState } from 'react';
import { sfx, setThemeEnabled, unlockAudio } from '../audio/synth';
import { loadTag } from '../game/leaderboard';
import { loadBests, loadSettings, type Bests } from '../game/storage';
import type { QubitCount } from '../game/types';
import { CrtFrame } from './components/CrtFrame';
import { ThemeToggle } from './components/ThemeToggle';
import { GameScreen } from './GameScreen';
import { LeaderboardScreen } from './LeaderboardScreen';
import { MenuScreen } from './MenuScreen';
import { TagGate } from './TagGate';
import { TutorialScreen } from './TutorialScreen';

type View =
  | { view: 'menu' }
  | { view: 'tutorial' }
  | { view: 'leaderboard' }
  | { view: 'play'; level: QubitCount };

export function App() {
  const [screen, setScreen] = useState<View>({ view: 'menu' });
  const [bests, setBests] = useState<Bests>(loadBests);
  const [themeOn, setThemeOn] = useState(() => loadSettings().themeOn);
  const [tagReady, setTagReady] = useState(() => loadTag() !== '');

  useEffect(() => {
    const onGesture = () => unlockAudio();
    window.addEventListener('pointerdown', onGesture);
    return () => window.removeEventListener('pointerdown', onGesture);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeOn((prev) => {
      sfx('click');
      const next = !prev;
      setThemeEnabled(next);
      return next;
    });
  }, []);

  const onScore = useCallback((_level: QubitCount, _value: number) => {
    setBests(loadBests());
  }, []);

  const click = () => sfx('click');
  const goMenu = () => {
    click();
    setScreen({ view: 'menu' });
  };
  const goLeaderboard = () => {
    click();
    setScreen({ view: 'leaderboard' });
  };

  return (
    <CrtFrame corner={<ThemeToggle themeOn={themeOn} onToggle={toggleTheme} />}>
      {!tagReady ? (
        <TagGate onDone={() => setTagReady(true)} />
      ) : screen.view === 'play' ? (
        <GameScreen
          key={screen.level}
          level={screen.level}
          onExit={goMenu}
          onScore={onScore}
          onLeaderboard={goLeaderboard}
        />
      ) : screen.view === 'tutorial' ? (
        <TutorialScreen
          onBack={goMenu}
          onPlayLevel={(level) => {
            click();
            setScreen({ view: 'play', level });
          }}
        />
      ) : screen.view === 'leaderboard' ? (
        <LeaderboardScreen onBack={goMenu} />
      ) : (
        <MenuScreen
          bests={bests}
          onPlay={(level) => {
            click();
            setScreen({ view: 'play', level });
          }}
          onTutorial={() => {
            click();
            setScreen({ view: 'tutorial' });
          }}
          onLeaderboard={goLeaderboard}
        />
      )}
    </CrtFrame>
  );
}
