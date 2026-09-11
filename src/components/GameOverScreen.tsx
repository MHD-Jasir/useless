import { useEffect, useState } from 'react';
import { Eye, Trophy, RotateCcw, Home, Skull } from 'lucide-react';

interface GameOverScreenProps {
  survivalTime: number;
  highScore: number;
  isNewHighScore: boolean;
  onTryAgain: () => void;
  onHome: () => void;
}

export function GameOverScreen({
  survivalTime,
  highScore,
  isNewHighScore,
  onTryAgain,
  onHome,
}: GameOverScreenProps) {
  const [flashPhase, setFlashPhase] = useState<'flash' | 'reveal'>('flash');

  useEffect(() => {
    const t = setTimeout(() => setFlashPhase('reveal'), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f] px-4">
      {/* Flash overlay */}
      {flashPhase === 'flash' && (
        <div className="absolute inset-0 z-50 animate-pulse bg-red-600" style={{ animationDuration: '100ms' }} />
      )}

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-red-600/15 blur-[120px]" />
      </div>

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div
        className={`relative z-10 w-full max-w-lg transition-all duration-500 ${
          flashPhase === 'reveal' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Skull icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Skull className="w-16 h-16 text-red-500" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Eye className="w-6 h-6 text-red-900" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* YOU BLINKED */}
        <h1
          className="text-center text-6xl sm:text-7xl font-black tracking-tight text-red-500 mb-2"
          style={{ textShadow: '0 0 40px rgba(239,68,68,0.6)' }}
        >
          YOU BLINKED
        </h1>
        <p className="text-center text-sm font-medium uppercase tracking-[0.3em] text-gray-500 mb-8">
          The contest is over
        </p>

        {/* Stats card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-950/60 backdrop-blur-sm p-6 sm:p-8 mb-8">
          <div className="mb-6 border-b border-gray-800 pb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Your Survival Time
            </p>
            <p className="text-5xl font-black tabular-nums text-white">
              {survivalTime.toFixed(2)}
              <span className="text-2xl text-gray-500">s</span>
            </p>
          </div>

          {isNewHighScore ? (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <Trophy className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-bold text-amber-400">NEW HIGH SCORE!</p>
                <p className="text-xs text-amber-500/70">
                  You beat your previous best of {highScore.toFixed(2)}s
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-500">
                  Best: {highScore.toFixed(2)}s
                </span>
              </div>
              <span className="text-xs text-gray-600">
                {(highScore - survivalTime).toFixed(2)}s to beat it
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onTryAgain}
            className="group relative flex-1 overflow-hidden rounded-xl bg-red-600 px-6 py-4 text-base font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:bg-red-500 hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Try Again
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
          <button
            onClick={onHome}
            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-6 py-4 text-base font-bold uppercase tracking-wider text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-800 active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              Home
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
