import { useState, useEffect, useRef, useCallback } from 'react';
import { playTick, NoisePlayer } from '../utils/sounds';

export type { NoiseType } from '../utils/sounds';
import type { NoiseType } from '../utils/sounds';

export interface SoundState {
  tickEnabled: boolean;
  noiseType: NoiseType;
}

export interface SoundActions {
  setTickEnabled: (v: boolean) => void;
  setNoiseType: (t: NoiseType) => void;
}

export function useSounds(
  isRunning: boolean,
  secondsLeft: number,
): SoundState & SoundActions {
  const [tickEnabled, setTickEnabled] = useState(false);
  const [noiseType, setNoiseTypeState] = useState<NoiseType>('off');

  const ctxRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<NoisePlayer | null>(null);
  const prevSecondsRef = useRef(secondsLeft);
  const tickEnabledRef = useRef(tickEnabled);
  const isRunningRef = useRef(isRunning);

  useEffect(() => { tickEnabledRef.current = tickEnabled; }, [tickEnabled]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Tick on every second while running
  useEffect(() => {
    if (isRunning && secondsLeft !== prevSecondsRef.current && tickEnabledRef.current) {
      playTick(getCtx());
    }
    prevSecondsRef.current = secondsLeft;
  }, [secondsLeft, isRunning, getCtx]);

  // Background noise
  useEffect(() => {
    if (noiseType === 'off') {
      playerRef.current?.stop();
      return;
    }

    const ctx = getCtx();
    if (!playerRef.current) {
      playerRef.current = new NoisePlayer(ctx);
    }
    playerRef.current.start(noiseType);

    return () => playerRef.current?.stop();
  }, [noiseType, getCtx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.dispose();
      ctxRef.current?.close();
    };
  }, []);

  const setNoiseType = useCallback((t: NoiseType) => {
    setNoiseTypeState(t);
  }, []);

  return { tickEnabled, noiseType, setTickEnabled, setNoiseType };
}
