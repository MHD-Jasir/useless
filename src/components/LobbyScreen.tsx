import { Eye, Skull, Trophy, AlertTriangle, Camera, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LobbyScreenProps {
  highScore: number;
  onStart: () => void;
}

export function LobbyScreen({ highScore, onStart }: LobbyScreenProps) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f] px-4">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Eye
                className={`w-12 h-12 text-red-500 transition-transform duration-100 ${glitch ? 'scale-110 rotate-3' : ''}`}
                strokeWidth={1.5}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>
            </div>
          </div>
          <h1
            className={`text-5xl sm:text-6xl font-black tracking-tight text-white transition-all duration-100 ${glitch ? 'translate-x-1' : ''}`}
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            THE BLINKING
          </h1>
          <h1
            className={`text-5xl sm:text-6xl font-black tracking-tight text-red-500 transition-all duration-100 ${glitch ? '-translate-x-1' : ''}`}
            style={{ textShadow: '0 0 30px rgba(239,68,68,0.5)' }}
          >
            STARING CONTEST
          </h1>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.3em] text-gray-500">
            How long can you last?
          </p>
        </div>

        {/* Rules card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-950/60 backdrop-blur-sm p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Skull className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              The Rules
            </h2>
          </div>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">
                1
              </span>
              <div className="flex items-center gap-2 text-gray-300">
                <Camera className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Grant camera access when prompted</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">
                2
              </span>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
                <span className="text-sm">Stare into the red dot in the center</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">
                3
              </span>
              <div className="flex items-center gap-2 text-gray-300">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-red-400">
                  DO NOT BLINK.
                </span>
                <span className="text-sm text-gray-500">One blink and it's over.</span>
              </div>
            </li>
          </ol>
        </div>

        {/* High score */}
        {highScore > 0 && (
          <div className="flex items-center justify-center gap-2 mb-8 text-gray-400">
            <Trophy className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
            <span className="text-sm font-medium uppercase tracking-wider">
              Best Survival:
            </span>
            <span className="text-lg font-bold text-amber-400 tabular-nums">
              {highScore.toFixed(2)}s
            </span>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={onStart}
          className="group relative w-full overflow-hidden rounded-xl bg-red-600 px-8 py-5 text-lg font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:bg-red-500 hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" fill="currentColor" />
            Start Contest
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>

        <p className="mt-4 text-center text-xs text-gray-600">
          Click the button to enable audio & camera
        </p>
      </div>
    </div>
  );
}
