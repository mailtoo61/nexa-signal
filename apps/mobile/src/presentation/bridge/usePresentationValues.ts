import { useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import type { PresentationSnapshot } from './presentationBridge';
import { motionTokens } from '../motion/tokens';

export function usePresentationValues(snapshot: PresentationSnapshot) {
  const stability = useSharedValue(snapshot.stability);
  const collapseProgress = useSharedValue(snapshot.collapsed ? 1 : 0);

  useEffect(() => {
    stability.value = withTiming(snapshot.stability, {
      duration: motionTokens.duration.quick,
    });
    collapseProgress.value = withTiming(snapshot.collapsed ? 1 : 0, {
      duration: motionTokens.duration.medium,
    });
  }, [collapseProgress, snapshot.collapsed, snapshot.stability, stability]);

  return { stability, collapseProgress };
}
