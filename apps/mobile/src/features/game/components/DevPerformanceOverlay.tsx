import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DevPerformanceOverlayProps {
  nodeCount: number;
  linkCount: number;
  reducedMotion: boolean;
  sceneState: 'booting' | 'live' | 'summary';
}

interface PerfSample {
  fps: number;
  frameMs: number;
  spike: boolean;
  lowFps: boolean;
}

export function DevPerformanceOverlay({
  nodeCount,
  linkCount,
  reducedMotion,
  sceneState,
}: DevPerformanceOverlayProps): React.JSX.Element | null {
  const [sample, setSample] = useState<PerfSample>({
    fps: 0,
    frameMs: 0,
    spike: false,
    lowFps: false,
  });
  const rafRef = useRef<number | null>(null);
  const lastFrameTsRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const frameMsAccumRef = useRef(0);
  const windowStartRef = useRef(0);
  const worstFrameMsRef = useRef(0);

  useEffect(() => {
    if (!__DEV__) return;
    const now = Date.now();
    windowStartRef.current = now;
    frameCountRef.current = 0;
    frameMsAccumRef.current = 0;
    worstFrameMsRef.current = 0;
    lastFrameTsRef.current = null;

    const onFrame = (ts: number) => {
      const last = lastFrameTsRef.current;
      if (last !== null) {
        const delta = ts - last;
        frameCountRef.current += 1;
        frameMsAccumRef.current += delta;
        if (delta > worstFrameMsRef.current) {
          worstFrameMsRef.current = delta;
        }
      }
      lastFrameTsRef.current = ts;

      const elapsed = Date.now() - windowStartRef.current;
      if (elapsed >= 800) {
        const frames = frameCountRef.current;
        const avgFrameMs = frames > 0 ? frameMsAccumRef.current / frames : 0;
        const fps = avgFrameMs > 0 ? Math.min(120, 1000 / avgFrameMs) : 0;
        const worst = worstFrameMsRef.current;
        setSample({
          fps,
          frameMs: avgFrameMs,
          spike: worst >= 32,
          lowFps: fps > 0 && fps < 45,
        });
        windowStartRef.current = Date.now();
        frameCountRef.current = 0;
        frameMsAccumRef.current = 0;
        worstFrameMsRef.current = 0;
      }

      rafRef.current = requestAnimationFrame(onFrame);
    };

    rafRef.current = requestAnimationFrame(onFrame);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (!__DEV__) return null;

  return (
    <View pointerEvents="none" style={styles.root}>
      <Text style={styles.line}>
        {`FPS ${Math.round(sample.fps)} | ${sample.frameMs.toFixed(1)}ms`}
      </Text>
      <Text style={styles.line}>{`N ${nodeCount} | L ${linkCount}`}</Text>
      <Text style={styles.line}>
        {`RM ${reducedMotion ? 'ON' : 'OFF'} | ${sceneState.toUpperCase()}`}
      </Text>
      {sample.lowFps ? <Text style={styles.warn}>LOW FPS</Text> : null}
      {sample.spike ? <Text style={styles.warn}>FRAME SPIKE</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5A7EA84D',
    backgroundColor: '#081427A8',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
    zIndex: 60,
  },
  line: {
    color: '#BED8F6',
    fontSize: 10,
    letterSpacing: 0.3,
    fontWeight: '600',
  },
  warn: {
    color: '#FFE3A6',
    fontSize: 9,
    letterSpacing: 0.4,
    fontWeight: '700',
  },
});
