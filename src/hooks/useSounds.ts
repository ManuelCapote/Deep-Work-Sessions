import { useState, useEffect, useRef, useCallback } from 'react';
import { playTick, NoisePlayer } from '../utils/sounds';
import { LofiPlayer } from '../utils/lofi';

export type { NoiseType } from '../utils/sounds';
import type { NoiseType } from '../utils/sounds';

interface Player {
  start(type?: string): void;
  stop(): void;
  setVolume(v: number): void;
  dispose(): void;
}

export interface SoundState {
  tickEnabled: boolean;
  noiseType: NoiseType;
  mixType: NoiseType;
}

export interface SoundActions {
  setTickEnabled: (v: boolean) => void;
  setNoiseType: (t: NoiseType) => void;
  setMixType: (t: NoiseType) => void;
}

function createPlayer(ctx: AudioContext, type: NoiseType): Player {
  if (type === 'lofi') return new LofiPlayer(ctx);
  return new NoisePlayer(ctx);
}

function startPlayer(player: Player, type: NoiseType): void {
  if (type === 'lofi') {
    (player as LofiPlayer).start();
  } else {
    (player as NoisePlayer).start(type as Exclude<NoiseType, 'off' | 'lofi'>);
  }
}

export function useSounds(
  isRunning: boolean,
  secondsLeft: number,
  volumes?: { master: number; tick: number },
): SoundState & SoundActions {
  const masterVol = volumes?.master ?? 0.2;
  const tickVol = volumes?.tick ?? 0.07;

  const [tickEnabled, setTickEnabled] = useState(false);
  const [noiseType, setNoiseTypeState] = useState<NoiseType>('off');
  const [mixType, setMixTypeState] = useState<NoiseType>('off');

  const ctxRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<Player | null>(null);
  const mixPlayerRef = useRef<Player | null>(null);
  const prevSecondsRef = useRef(secondsLeft);
  const tickEnabledRef = useRef(tickEnabled);
  const isRunningRef = useRef(isRunning);
  const tickVolRef = useRef(tickVol);
  const prevNoiseTypeRef = useRef<NoiseType>('off');
  const prevMixTypeRef = useRef<NoiseType>('off');

  useEffect(() => { tickEnabledRef.current = tickEnabled; }, [tickEnabled]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { tickVolRef.current = tickVol; }, [tickVol]);

  // Apply volume changes to active players
  useEffect(() => {
    playerRef.current?.setVolume(masterVol);
    mixPlayerRef.current?.setVolume(masterVol * 0.5);
  }, [masterVol]);

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
      playTick(getCtx(), tickVolRef.current);
    }
    prevSecondsRef.current = secondsLeft;
  }, [secondsLeft, isRunning, getCtx]);

  // Primary background noise
  useEffect(() => {
    if (noiseType === 'off') {
      playerRef.current?.stop();
      prevNoiseTypeRef.current = 'off';
      return;
    }

    const ctx = getCtx();

    // Need new player if type category changed (lofi vs noise)
    const needNewPlayer = !playerRef.current ||
      (noiseType === 'lofi') !== (prevNoiseTypeRef.current === 'lofi');

    if (needNewPlayer) {
      playerRef.current?.dispose();
      playerRef.current = createPlayer(ctx, noiseType);
    }

    playerRef.current!.setVolume(masterVol);
    startPlayer(playerRef.current!, noiseType);
    prevNoiseTypeRef.current = noiseType;

    return () => playerRef.current?.stop();
  }, [noiseType, getCtx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Secondary (mix) sound
  useEffect(() => {
    if (mixType === 'off') {
      mixPlayerRef.current?.stop();
      prevMixTypeRef.current = 'off';
      return;
    }

    const ctx = getCtx();

    const needNewPlayer = !mixPlayerRef.current ||
      (mixType === 'lofi') !== (prevMixTypeRef.current === 'lofi');

    if (needNewPlayer) {
      mixPlayerRef.current?.dispose();
      mixPlayerRef.current = createPlayer(ctx, mixType);
    }

    mixPlayerRef.current!.setVolume(masterVol * 0.5);
    startPlayer(mixPlayerRef.current!, mixType);
    prevMixTypeRef.current = mixType;

    return () => mixPlayerRef.current?.stop();
  }, [mixType, getCtx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.dispose();
      mixPlayerRef.current?.dispose();
      ctxRef.current?.close();
    };
  }, []);

  const setNoiseType = useCallback((t: NoiseType) => setNoiseTypeState(t), []);
  const setMixType = useCallback((t: NoiseType) => setMixTypeState(t), []);

  return { tickEnabled, noiseType, mixType, setTickEnabled, setNoiseType, setMixType };
}
