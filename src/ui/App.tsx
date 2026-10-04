import { useCallback, useEffect, useState } from 'react';
import { setThemeEnabled, unlockAudio } from '../audio/synth';
import { loadBests, loadSettings, type Bests } from '../game/storage';
import type { QubitCount } from '../game/types';
import { CrtFrame } from './components/CrtFrame';
import { ThemeToggle } from './components/ThemeToggle';
import { GameScreen } from './GameScreen';
import { MenuScreen } from './MenuScreen';
import { TutorialScreen } from './TutorialScreen';

export function App() {
  const [level, setLevel] = useState<QubitCount | null>(null);
  const [tutorial, setTutorial] = useState(false);
  const [bests, setBests] = useState<Bests>(loadBests);
  const [themeOn, setThemeOn] = useState(() => loadSettings().themeOn);

  useEffect(() => {
    const onGesture = () => unlockAudio();
    window.addEventListener('pointerdown', onGesture);
    return () => window.removeEventListener('pointerdown', onGesture);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeOn((prev) => {
      const next = !prev;
      setThemeEnabled(next);
      return next;
    });
  }, []);

  const onScore = useCallback((_level: QubitCount, _value: number) => {
    setBests(loadBests());
  }, []);

  return (
    <CrtFrame corner={<ThemeToggle themeOn={themeOn} onToggle={toggleTheme} />}>
      {level !== null ? (
        <GameScreen
          key={level}
          level={level}
          onExit={() => setLevel(null)}
          onScore={onScore}
        />
      ) : tutorial ? (
        <TutorialScreen onBack={() => setTutorial(false)} />
      ) : (
        <MenuScreen
          bests={bests}
          onPlay={setLevel}
          onTutorial={() => setTutorial(true)}
        />
      )}
    </CrtFrame>
  );
}
