import { useEffect, useRef, useState } from 'react';
import { Eye, Activity, ShieldCheck, Search, AlertCircle } from 'lucide-react';
import { useEyeTracking } from '@/hooks/useEyeTracking';

interface PlayingScreenProps {
  stream: MediaStream | null;
  onBlink: () => void;
}

const EAR_OPEN = 0.18;

export function PlayingScreen({ stream, onBlink }: PlayingScreenProps) {
  const displayVideoRef = useRef<HTMLVideoElement>(null);
  const { trackingState, eyeData } = useEyeTracking({
    videoRef: displayVideoRef,
    enabled: true,
    onBlink,
  });

  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrated, setCalibrated] = useState(false);
  const baselineEarRef = useRef<number>(0);
  const sampleCountRef = useRef<number>(0);

  // Attach the camera stream to the visible video element
  useEffect(() => {
    if (stream && displayVideoRef.current) {
      displayVideoRef.current.srcObject = stream;
      displayVideoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    if (trackingState !== 'ready' || !eyeData.faceDetected) return;
    if (calibrated) return;

    if (eyeData.ear > 0.05) {
      baselineEarRef.current += eyeData.ear;
      sampleCountRef.current += 1;
      const progress = Math.min(sampleCountRef.current / 45, 1);
      setCalibrationProgress(progress);

      if (sampleCountRef.current >= 45) {
        baselineEarRef.current /= sampleCountRef.current;
        setCalibrated(true);
      }
    }
  }, [trackingState, eyeData.faceDetected, eyeData.ear, calibrated]);

  const earPercent = Math.min(
    Math.max((eyeData.ear / Math.max(baselineEarRef.current || EAR_OPEN, 0.01)) * 100, 0),
    100
  );

  const statusLabel = !eyeData.faceDetected
    ? 'No Face'
    : !calibrated
      ? 'Calibrating...'
      : eyeData.isBlinking
        ? 'BLINK!'
        : 'Eyes Locked';

  const statusColor = eyeData.isBlinking
    ? 'text-red-400 border-red-500/50 bg-red-500/10'
    : !eyeData.faceDetected
      ? 'text-amber-400 border-amber-500/50 bg-amber-500/10'
      : !calibrated
        ? 'text-gray-400 border-gray-600 bg-gray-800/50'
        : 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f] px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-[120px] transition-colors duration-300 ${
            eyeData.isBlinking ? 'bg-red-600/20' : 'bg-red-600/5'
          }`}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-red-500" strokeWidth={1.5} />
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Staring Contest
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${statusColor}`}
          >
            {eyeData.faceDetected ? (
              eyeData.isBlinking ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            {statusLabel}
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-gray-800 bg-black shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <video
            ref={displayVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover -scale-x-100"
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
            }}
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full border border-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute -inset-4 rounded-full border border-red-500/30" />
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
            </div>
          </div>

          {trackingState === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-red-500" />
              <p className="text-sm text-gray-400">Loading AI vision model...</p>
            </div>
          )}

          {trackingState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
              <AlertCircle className="mb-3 w-10 h-10 text-red-500" />
              <p className="text-sm font-semibold text-red-400">Vision model failed to load</p>
              <p className="mt-1 text-xs text-gray-500">Check your connection and try again</p>
            </div>
          )}

          {trackingState === 'ready' && !calibrated && eyeData.faceDetected && (
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <div className="rounded-full bg-black/70 px-4 py-2 backdrop-blur-sm">
                <p className="text-xs font-medium text-gray-300">
                  Calibrating... keep your eyes open{' '}
                  <span className="text-red-400 font-bold">
                    {Math.round(calibrationProgress * 100)}%
                  </span>
                </p>
              </div>
            </div>
          )}

          {trackingState === 'ready' && !eyeData.faceDetected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/70 px-4 py-2 backdrop-blur-sm">
                <p className="text-xs font-medium text-amber-400">
                  Show your face to the camera
                </p>
              </div>
            </div>
          )}

          {calibrated && (
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="rounded-lg bg-black/60 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Eye Tension
                  </span>
                </div>
                <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      earPercent > 60
                        ? 'bg-emerald-500'
                        : earPercent > 30
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${earPercent}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] tabular-nums text-gray-500">
                  EAR: {eyeData.ear.toFixed(3)}
                </div>
              </div>

              <div className="rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Survival
                </div>
                <SurvivalTimer />
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          Keep your eyes wide open. Do not look away. Do not blink.
        </p>
      </div>
    </div>
  );
}

function SurvivalTimer() {
  const [time, setTime] = useState(0);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setTime((performance.now() - startTimeRef.current) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="text-2xl font-bold tabular-nums text-white">
      {time.toFixed(2)}s
    </div>
  );
}
