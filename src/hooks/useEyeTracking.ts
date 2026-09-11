import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

export type TrackingState = 'idle' | 'loading' | 'ready' | 'error';

export interface EyeTrackingData {
  ear: number;
  isBlinking: boolean;
  faceDetected: boolean;
}

interface UseEyeTrackingOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  onBlink?: () => void;
}

const EAR_CLOSED = 0.12;
const FACE_LOSS_GRACE_MS = 300;

export function useEyeTracking({ videoRef, enabled, onBlink }: UseEyeTrackingOptions) {
  const [trackingState, setTrackingState] = useState<TrackingState>('idle');
  const [eyeData, setEyeData] = useState<EyeTrackingData>({
    ear: 0,
    isBlinking: false,
    faceDetected: false,
  });

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const faceLostSinceRef = useRef<number | null>(null);
  const wasBlinkingRef = useRef<boolean>(false);
  const onBlinkRef = useRef<((() => void) | undefined)>(undefined);
  onBlinkRef.current = onBlink;

  const calculateEAR = useCallback((landmarks: { x: number; y: number; z?: number }[]): number => {
    const p1 = landmarks[33];
    const p2 = landmarks[133];
    const p3 = landmarks[159];
    const p4 = landmarks[145];
    const p5 = landmarks[153];
    const p6 = landmarks[246];

    const vertical1 = Math.hypot(p3.x - p4.x, p3.y - p4.y);
    const vertical2 = Math.hypot(p5.x - p6.x, p5.y - p6.y);
    const horizontal = Math.hypot(p1.x - p2.x, p1.y - p2.y);

    if (horizontal === 0) return 0;
    return (vertical1 + vertical2) / (2 * horizontal);
  }, []);

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const now = performance.now();

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;

      let results: Awaited<ReturnType<typeof landmarker.detectForVideo>> | null = null;
      try {
        results = landmarker.detectForVideo(video, now);
      } catch {
        // detectForVideo can throw if called too soon after init
      }

      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        faceLostSinceRef.current = null;
        const landmarks = results.faceLandmarks[0];
        const ear = calculateEAR(landmarks);
        const isBlinking = ear < EAR_CLOSED;

        setEyeData({
          ear,
          isBlinking,
          faceDetected: true,
        });

        if (isBlinking && !wasBlinkingRef.current) {
          wasBlinkingRef.current = true;
          onBlinkRef.current?.();
        } else if (!isBlinking && wasBlinkingRef.current) {
          wasBlinkingRef.current = false;
        }
      } else {
        if (faceLostSinceRef.current === null) {
          faceLostSinceRef.current = now;
        }

        if (now - faceLostSinceRef.current > FACE_LOSS_GRACE_MS) {
          setEyeData((prev) => ({
            ...prev,
            faceDetected: false,
            isBlinking: false,
          }));
          wasBlinkingRef.current = false;
        }
      }
    }

    rafRef.current = requestAnimationFrame(detectLoop);
  }, [videoRef, calculateEAR]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setTrackingState('loading');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        if (cancelled) return;
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          numFaces: 1,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setTrackingState('ready');
      } catch (err) {
        console.error('Failed to init FaceLandmarker:', err);
        if (!cancelled) setTrackingState('error');
      }
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    if (trackingState !== 'ready') return;

    rafRef.current = requestAnimationFrame(detectLoop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, trackingState, detectLoop]);

  return { trackingState, eyeData };
}
