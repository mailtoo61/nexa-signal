import {
  triggerPrimaryHaptic,
  type HapticSettings,
} from '../../shared/haptics/hapticsService';

export async function runTouchRippleFeedback(
  settings: HapticSettings,
): Promise<void> {
  await triggerPrimaryHaptic(settings);
}
