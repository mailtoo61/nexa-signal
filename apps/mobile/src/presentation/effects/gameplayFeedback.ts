import { track } from '../../shared/analytics/analytics';
import { playUiTone } from '../../shared/audio/audioService';
import { triggerPrimaryHaptic } from '../../shared/haptics/hapticsService';

export interface FeedbackSettings {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  reducedFeedback: boolean;
}

function buildSettings(settings: FeedbackSettings) {
  return {
    enabled: settings.hapticsEnabled,
    reducedFeedback: settings.reducedFeedback,
  };
}

export async function onSelectNode(settings: FeedbackSettings): Promise<void> {
  track({ name: 'node_selected', timestamp: Date.now() });
  await triggerPrimaryHaptic(buildSettings(settings));
}

export async function onSelectLink(settings: FeedbackSettings): Promise<void> {
  track({ name: 'link_selected', timestamp: Date.now() });
  await triggerPrimaryHaptic(buildSettings(settings));
}

export async function onDragStart(settings: FeedbackSettings): Promise<void> {
  await triggerPrimaryHaptic(
    buildSettings({ ...settings, reducedFeedback: true }),
  );
}

export async function onValidDragHover(
  settings: FeedbackSettings,
): Promise<void> {
  if (settings.reducedFeedback) return;
  await triggerPrimaryHaptic(
    buildSettings({ ...settings, reducedFeedback: true }),
  );
}

export async function onInvalidDragRelease(
  settings: FeedbackSettings,
): Promise<void> {
  await triggerPrimaryHaptic(
    buildSettings({ ...settings, reducedFeedback: true }),
  );
}

export async function onActionSuccess(
  settings: FeedbackSettings,
  event: 'node_stabilized' | 'link_repaired' | 'session_restarted',
): Promise<void> {
  track({ name: event, timestamp: Date.now() });
  await triggerPrimaryHaptic(buildSettings(settings));
  await playUiTone({
    enabled: settings.audioEnabled,
    reducedFeedback: settings.reducedFeedback,
  });
}

export async function onConnectSuccess(
  settings: FeedbackSettings,
): Promise<void> {
  await triggerPrimaryHaptic(buildSettings(settings));
  await playUiTone({
    enabled: settings.audioEnabled,
    reducedFeedback: settings.reducedFeedback,
  });
}

export async function onActionInvalid(
  settings: FeedbackSettings,
): Promise<void> {
  track({ name: 'action_invalid', timestamp: Date.now() });
  await triggerPrimaryHaptic(
    buildSettings({ ...settings, reducedFeedback: true }),
  );
}

export function onCollapseWarningShown(): void {
  track({ name: 'collapse_warning_shown', timestamp: Date.now() });
}

export function onSummaryViewed(): void {
  track({ name: 'summary_viewed', timestamp: Date.now() });
}

export function onSessionEnded(): void {
  track({ name: 'session_ended', timestamp: Date.now() });
}
