import {
  createSessionSnapshot,
  getSessionSnapshotFingerprint,
  type SessionSnapshot,
  type SessionState,
} from '@nexa/game-engine';

export type SaveReason =
  | 'tick'
  | 'player_action'
  | 'background'
  | 'session_start'
  | 'session_restart'
  | 'force';

export interface SavePolicyContext {
  reason: SaveReason;
  currentSession: SessionState;
  lastSavedSnapshot: SessionSnapshot | null;
  lastSavedFingerprint: string | null;
  force?: boolean;
}

export interface SavePolicyDecision {
  shouldSave: boolean;
  reason: 'forced' | 'meaningful_change' | 'duplicate' | 'no_threshold_match';
  snapshot: SessionSnapshot;
  fingerprint: string | null;
}

const TICK_DELTA_THRESHOLD = 4;
const SCORE_DELTA_THRESHOLD = 25;
const STABILITY_DELTA_THRESHOLD = 2;

export function getSnapshotFingerprintSafe(
  snapshot: SessionSnapshot,
): string | null {
  try {
    return getSessionSnapshotFingerprint(snapshot);
  } catch {
    return null;
  }
}

function hasMeaningfulDelta(
  previous: SessionSnapshot | null,
  next: SessionSnapshot,
): boolean {
  if (!previous) return true;

  const prev = previous.session;
  const cur = next.session;

  if (cur.tick - prev.tick >= TICK_DELTA_THRESHOLD) return true;
  if (Math.abs(cur.score - prev.score) >= SCORE_DELTA_THRESHOLD) return true;
  if (Math.abs(cur.stability - prev.stability) >= STABILITY_DELTA_THRESHOLD) {
    return true;
  }

  if (
    cur.graph.nodes.length !== prev.graph.nodes.length ||
    cur.graph.links.length !== prev.graph.links.length
  ) {
    return true;
  }

  return false;
}

export function decideResumableSnapshotSave(
  context: SavePolicyContext,
): SavePolicyDecision {
  const snapshot = createSessionSnapshot(context.currentSession);
  const fingerprint = getSnapshotFingerprintSafe(snapshot);

  if (context.force || context.reason === 'force') {
    return {
      shouldSave: true,
      reason: 'forced',
      snapshot,
      fingerprint,
    };
  }

  if (
    fingerprint !== null &&
    context.lastSavedFingerprint !== null &&
    fingerprint === context.lastSavedFingerprint
  ) {
    return {
      shouldSave: false,
      reason: 'duplicate',
      snapshot,
      fingerprint,
    };
  }

  if (context.reason === 'player_action') {
    return {
      shouldSave: true,
      reason: 'meaningful_change',
      snapshot,
      fingerprint,
    };
  }

  const meaningful = hasMeaningfulDelta(context.lastSavedSnapshot, snapshot);
  return {
    shouldSave: meaningful,
    reason: meaningful ? 'meaningful_change' : 'no_threshold_match',
    snapshot,
    fingerprint,
  };
}
