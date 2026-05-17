import { describe, expect, it } from 'vitest';
import {
  createSession,
  createSessionSnapshot,
  stepSession,
} from '../../../../../packages/game-engine/src/index';
import {
  decideResumableSnapshotSave,
  getSnapshotFingerprintSafe,
} from './resumeSavePolicy';

describe('resume save policy', () => {
  it('skips duplicate snapshots', () => {
    const session = createSession('save-policy-seed');
    const snapshot = createSessionSnapshot(session);
    const decision = decideResumableSnapshotSave({
      reason: 'tick',
      currentSession: session,
      lastSavedSnapshot: snapshot,
      lastSavedFingerprint: getSnapshotFingerprintSafe(snapshot),
    });

    expect(decision.shouldSave).toBe(false);
    expect(decision.reason).toBe('duplicate');
  });

  it('saves after meaningful tick delta', () => {
    let session = createSession('save-policy-tick');
    const previous = createSessionSnapshot(session);
    for (let i = 0; i < 4; i += 1) {
      session = stepSession(session);
    }

    const decision = decideResumableSnapshotSave({
      reason: 'tick',
      currentSession: session,
      lastSavedSnapshot: previous,
      lastSavedFingerprint: getSnapshotFingerprintSafe(previous),
    });

    expect(decision.shouldSave).toBe(true);
  });

  it('saves after player action reason', () => {
    const session = createSession('save-policy-action');
    const decision = decideResumableSnapshotSave({
      reason: 'player_action',
      currentSession: session,
      lastSavedSnapshot: createSessionSnapshot(session),
      lastSavedFingerprint: null,
    });

    expect(decision.shouldSave).toBe(true);
  });
});
