import { describe, expect, it } from 'vitest';
import { getHomeExperienceState } from './homeExperience';

describe('getHomeExperienceState', () => {
  it('shows enter path on first-time experience', () => {
    const state = getHomeExperienceState({
      totalSessionsPlayed: 0,
      hasTutorialSeen: false,
      session: null,
      hasResumableSnapshot: false,
    });
    expect(state.shouldShowContinueCta).toBe(false);
    expect(state.showIntroHeadline).toBe(true);
  });

  it('shows continue path for returning players', () => {
    const state = getHomeExperienceState({
      totalSessionsPlayed: 2,
      hasTutorialSeen: true,
      session: null,
      hasResumableSnapshot: false,
    });
    expect(state.shouldShowContinueCta).toBe(true);
    expect(state.showContinueHint).toBe(true);
  });

  it('shows continue when in-memory session exists', () => {
    const state = getHomeExperienceState({
      totalSessionsPlayed: 0,
      hasTutorialSeen: false,
      session: { collapsed: false } as never,
      hasResumableSnapshot: false,
    });
    expect(state.shouldShowContinueCta).toBe(true);
  });

  it('shows continue when a resumable snapshot exists', () => {
    const state = getHomeExperienceState({
      totalSessionsPlayed: 0,
      hasTutorialSeen: false,
      session: null,
      hasResumableSnapshot: true,
    });
    expect(state.shouldShowContinueCta).toBe(true);
  });
});
