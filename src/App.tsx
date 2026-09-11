import { useCallback } from 'react';
import { LobbyScreen } from '@/components/LobbyScreen';
import { PlayingScreen } from '@/components/PlayingScreen';
import { GameOverScreen } from '@/components/GameOverScreen';
import { useGame } from '@/hooks/useGame';
import { useCamera } from '@/hooks/useCamera';
import { unlockAudio, playScream } from '@/utils/audio';

export default function App() {
  const { screen, survivalTime, highScore, isNewHighScore, startGame, endGame, goToLobby } =
    useGame();
  const { stream, startCamera } = useCamera();

  const handleStart = useCallback(async () => {
    unlockAudio();
    await startCamera();
    startGame();
  }, [startCamera, startGame]);

  const handleBlink = useCallback(() => {
    playScream();
    endGame();
  }, [endGame]);

  const handleTryAgain = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleHome = useCallback(() => {
    goToLobby();
  }, [goToLobby]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white antialiased">
      {screen === 'lobby' && (
        <LobbyScreen highScore={highScore} onStart={handleStart} />
      )}

      {screen === 'playing' && (
        <PlayingScreen stream={stream} onBlink={handleBlink} />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          survivalTime={survivalTime}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onTryAgain={handleTryAgain}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
