import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useAppSettingsStore } from '../../state/appSettingsStore';
import { mergeReducedMotionPreference } from './reducedMotionPreference';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  const forcedReduced = useAppSettingsStore(
    (state) => state.reducedMotionEnabled,
  );

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReduced(enabled),
    );

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return mergeReducedMotionPreference(reduced, forcedReduced);
}
