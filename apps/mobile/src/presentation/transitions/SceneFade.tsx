import React, { type PropsWithChildren, useEffect } from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motionTokens } from '../motion/tokens';
import { useReducedMotion } from '../../shared/accessibility/useReducedMotion';

export function SceneFade({ children }: PropsWithChildren): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const transitionDuration = reducedMotion ? 0 : motionTokens.duration.medium;
  const enterExitDuration = reducedMotion ? 0 : 300;

  useEffect(() => {
    opacity.value = withTiming(1, { duration: transitionDuration });
  }, [opacity, transitionDuration]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      entering={FadeIn.duration(enterExitDuration)}
      exiting={FadeOut.duration(enterExitDuration)}
      style={{ flex: 1 }}
    >
      <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>
    </Animated.View>
  );
}
