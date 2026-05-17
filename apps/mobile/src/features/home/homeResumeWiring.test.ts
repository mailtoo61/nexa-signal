import { describe, expect, it } from 'vitest';
import { createSessionSnapshot, createSession } from '@nexa/game-engine';
import { initialRecoverySnapshot } from '../../state/recoveryState';
import {
  evaluateHomeRecoverySnapshot,
  resolveHomeContinueAction,
} from './homeResumeWiring';
import { getHomeExperienceState } from './homeExperience';

describe('home resume wiring', () => {
  it('continue appears only after validated resumable snapshot exists', () => {
    const session = createSession('home-valid');
    const evalResult = evaluateHomeRecoverySnapshot(
      createSessionSnapshot(session),
      initialRecoverySnapshot,
    );

    const stateWithout = getHomeExperienceState({
      totalSessionsPlayed: 0,
      hasTutorialSeen: false,
      session: null,
      hasResumableSnapshot: false,
    });
    const stateWith = getHomeExperienceState({
      totalSessionsPlayed: 0,
      hasTutorialSeen: false,
      session: null,
      hasResumableSnapshot: Boolean(evalResult.resumableSession),
    });

    expect(stateWithout.shouldShowContinueCta).toBe(false);
    expect(stateWith.shouldShowContinueCta).toBe(true);
    expect(evalResult.recovery.state).toBe('valid');
  });

  it('invalid snapshot falls back fresh and clears once without technical copy', () => {
    const result = evaluateHomeRecoverySnapshot(
      { broken: true },
      initialRecoverySnapshot,
    );

    expect(result.recovery.state).toBe('cleared');
    expect(result.recovery.invalidCleared).toBe(true);
    expect(result.resumeStatusKey).toBe('resumeFailedSafely');
    expect(result.shouldClearSnapshot).toBe(true);
    expect(result.recovery.devValidationReason).toBeNull();
  });

  it('first-time enter network remains when no snapshot exists', () => {
    const result = evaluateHomeRecoverySnapshot(null, initialRecoverySnapshot);
    const homeState = getHomeExperienceState({
      totalSessionsPlayed: 0,
      hasTutorialSeen: false,
      session: null,
      hasResumableSnapshot: false,
    });

    expect(result.recovery.state).toBe('expired');
    expect(homeState.shouldShowContinueCta).toBe(false);
  });

  it('continue action restores once and does not loop', () => {
    const session = createSession('home-restore');
    const valid = evaluateHomeRecoverySnapshot(
      createSessionSnapshot(session),
      initialRecoverySnapshot,
    );

    const first = resolveHomeContinueAction({
      resumableSession: valid.resumableSession,
      recovery: valid.recovery,
      shouldShowContinueCta: true,
    });

    const second = resolveHomeContinueAction({
      resumableSession: first.resumableSession,
      recovery: first.recovery,
      shouldShowContinueCta: true,
    });

    expect(first.shouldRestoreSession).toBe(true);
    expect(first.resumeStatusKey).toBe('networkRestored');
    expect(second.shouldRestoreSession).toBe(false);
    expect(second.resumeStatusKey).toBe('previousNetworkUnavailable');
  });
});
