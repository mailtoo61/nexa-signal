import { Easing } from 'react-native-reanimated';
import { motionTokens } from './tokens';

export const motionEasing = {
  standard: Easing.bezier(...motionTokens.easing.standard),
  smoothInOut: Easing.bezier(...motionTokens.easing.smoothInOut),
  calmOut: Easing.bezier(...motionTokens.easing.calmOut),
};
