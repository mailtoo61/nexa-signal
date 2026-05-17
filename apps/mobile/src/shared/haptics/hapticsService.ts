import * as Haptics from 'expo-haptics';

export interface HapticSettings {
  enabled: boolean;
  reducedFeedback: boolean;
}

export async function triggerPrimaryHaptic(
  settings: HapticSettings,
): Promise<void> {
  if (!settings.enabled) return;
  await Haptics.impactAsync(
    settings.reducedFeedback
      ? Haptics.ImpactFeedbackStyle.Soft
      : Haptics.ImpactFeedbackStyle.Light,
  );
}
