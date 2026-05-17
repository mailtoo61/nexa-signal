import { describe, expect, it } from 'vitest';
import {
  createSession,
  createSessionSnapshot,
  getSessionSnapshotFingerprint,
  stepSession,
} from '../src/index.js';

describe('session snapshot fingerprint', () => {
  it('is stable for equal snapshots', () => {
    const session = createSession('seed-fingerprint');
    const snapshotA = createSessionSnapshot(session);
    const snapshotB = createSessionSnapshot({ ...session });

    expect(getSessionSnapshotFingerprint(snapshotA)).toBe(
      getSessionSnapshotFingerprint(snapshotB),
    );
  });

  it('changes when gameplay state changes', () => {
    const session = createSession('seed-fingerprint-change');
    const before = createSessionSnapshot(session);
    const after = createSessionSnapshot(stepSession(session));

    expect(getSessionSnapshotFingerprint(before)).not.toBe(
      getSessionSnapshotFingerprint(after),
    );
  });
});
