import { useCallback, useEffect, useRef, useState } from 'react';

export type GameScreen = 'lobby' | 'playing' | 'gameover';

export interface GameStats {
  survivalTime: number;
  highScore: number;
  isNewHighScore: boolean;
}

const HIGH_SCORE_KEY = 'blink-staring-contest-highscore';

export function useGame() {
  const [screen, setScreen] = useState<GameScreen>('lobby');
  const [survivalTime, setSurvivalTime] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed)) setHighScore(parsed);
    }
  }, []);

  const startGame = useCallback(() => {
    setSurvivalTime(0);
    setIsNewHighScore(false);
    startTimeRef.current = performance.now();
    setScreen('playing');
  }, []);

  const endGame = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const finalTime = (performance.now() - startTimeRef.current) / 1000;
    setSurvivalTime(finalTime);

    if (finalTime > highScore) {
      setHighScore(finalTime);
      setIsNewHighScore(true);
      localStorage.setItem(HIGH_SCORE_KEY, finalTime.toFixed(2));
    }

    setScreen('gameover');
  }, [highScore]);

  // Timer loop while playing
  useEffect(() => {
    if (screen !== 'playing') return;

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setSurvivalTime(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [screen]);

  const goToLobby = useCallback(() => {
    setScreen('lobby');
  }, []);

  return {
    screen,
    survivalTime,
    highScore,
    isNewHighScore,
    startGame,
    endGame,
    goToLobby,
  };
}
