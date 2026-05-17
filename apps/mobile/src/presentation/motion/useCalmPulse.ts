import { useEffect, useMemo } from 'react';
import {
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { motionTokens } from './tokens';
import { motionEasing } from './easing';

export function useCalmPulse(reducedMotion: boolean) {
  const scale = useSharedValue(motionTokens.pulse.baseScale);
  const glow = useSharedValue(motionTokens.pulse.glowMin);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      glow.value = 0.6;
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(motionTokens.pulse.peakScale, {
          duration: motionTokens.duration.ambient,
          easing: motionEasing.smoothInOut,
        }),
        withTiming(motionTokens.pulse.baseScale, {
          duration: motionTokens.duration.ambient,
          easing: motionEasing.smoothInOut,
        }),
      ),
      -1,
      false,
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(motionTokens.pulse.glowMax, {
          duration: motionTokens.duration.long,
          easing: motionEasing.calmOut,
        }),
        withTiming(motionTokens.pulse.glowMin, {
          duration: motionTokens.duration.long,
          easing: motionEasing.calmOut,
        }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(glow);
    };
  }, [glow, reducedMotion, scale]);

  return useMemo(() => ({ scale, glow }), [scale, glow]);
}
