import { describe, expect, it, vi } from 'vitest';

const { triggerPrimaryHapticMock, playUiToneMock } = vi.hoisted(() => ({
  triggerPrimaryHapticMock: vi.fn(async () => {}),
  playUiToneMock: vi.fn(async () => {}),
}));

vi.mock('../../shared/haptics/hapticsService', () => ({
  triggerPrimaryHaptic: triggerPrimaryHapticMock,
}));
vi.mock('../../shared/audio/audioService', () => ({
  playUiTone: playUiToneMock,
}));
vi.mock('../../shared/analytics/analytics', () => ({
  track: vi.fn(),
}));

import { onActionSuccess } from './gameplayFeedback';

describe('gameplay feedback gating', () => {
  it('passes disabled flags through centralized services', async () => {
    await onActionSuccess(
      {
        audioEnabled: false,
        hapticsEnabled: false,
        reducedFeedback: true,
      },
      'session_restarted',
    );

    expect(triggerPrimaryHapticMock).toHaveBeenCalledWith({
      enabled: false,
      reducedFeedback: true,
    });
    expect(playUiToneMock).toHaveBeenCalledWith({
      enabled: false,
      reducedFeedback: true,
    });
  });
});
