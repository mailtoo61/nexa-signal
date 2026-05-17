export interface AudioSettings {
  enabled: boolean;
  reducedFeedback: boolean;
}

export async function playUiTone(settings: AudioSettings): Promise<void> {
  if (!settings.enabled) return;
  void settings.reducedFeedback;
}
