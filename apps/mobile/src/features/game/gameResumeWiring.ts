import type { SessionSnapshot, SessionState } from '@nexa/game-engine';
import {
  decideResumableSnapshotSave,
  type SaveReason,
} from '../../shared/storage/resumeSavePolicy';

export interface GameTransientUiState {
  selectedNodeId: string | null;
  selectedLinkId: string | null;
  dragPreviewActive: boolean;
  staleSummaryVisible: boolean;
}

export interface PersistenceRuntimeState {
  epoch: number;
  lastSavedSnapshot: SessionSnapshot | null;
  lastSavedFingerprint: string | null;
  sessionLifecycleId: string | null;
  pendingSaveReason: SaveReason;
}

export interface PersistenceWritePlan {
  shouldWrite: boolean;
  snapshot: SessionSnapshot | null;
  fingerprint: string | null;
  reason: SaveReason;
  epoch: number;
}

export function shouldAutoStartSession(params: {
  tutorialLoaded: boolean;
  session: SessionState | null;
  endedVisible: boolean;
}): boolean {
  const { tutorialLoaded, session, endedVisible } = params;
  return tutorialLoaded && session === null && !endedVisible;
}

export function createInitialTransientUiState(): GameTransientUiState {
  return {
    selectedNodeId: null,
    selectedLinkId: null,
    dragPreviewActive: false,
    staleSummaryVisible: false,
  };
}

export function createInitialPersistenceRuntimeState(): PersistenceRuntimeState {
  return {
    epoch: 0,
    lastSavedSnapshot: null,
    lastSavedFingerprint: null,
    sessionLifecycleId: null,
    pendingSaveReason: 'tick',
  };
}

export function handleSessionLifecycleChange(params: {
  runtime: PersistenceRuntimeState;
  session: SessionState | null;
}): {
  runtime: PersistenceRuntimeState;
  shouldResetTransientUi: boolean;
} {
  const { runtime, session } = params;
  if (!session) {
    return { runtime, shouldResetTransientUi: false };
  }
  if (runtime.sessionLifecycleId === session.sessionId) {
    return { runtime, shouldResetTransientUi: false };
  }

  const nextRuntime: PersistenceRuntimeState = {
    ...runtime,
    sessionLifecycleId: session.sessionId,
    pendingSaveReason:
      runtime.lastSavedSnapshot === null ? 'session_start' : 'session_restart',
  };

  return {
    runtime: nextRuntime,
    shouldResetTransientUi: true,
  };
}

export function planSessionPersistenceWrite(params: {
  runtime: PersistenceRuntimeState;
  session: SessionState | null;
  reasonOverride?: SaveReason;
}): {
  runtime: PersistenceRuntimeState;
  writePlan: PersistenceWritePlan;
} {
  const { runtime, session, reasonOverride } = params;
  const reason = reasonOverride ?? runtime.pendingSaveReason;

  if (!session || session.collapsed) {
    return {
      runtime: {
        ...runtime,
        pendingSaveReason: 'tick',
      },
      writePlan: {
        shouldWrite: false,
        snapshot: null,
        fingerprint: null,
        reason,
        epoch: runtime.epoch,
      },
    };
  }

  const decision = decideResumableSnapshotSave({
    reason,
    currentSession: session,
    lastSavedSnapshot: runtime.lastSavedSnapshot,
    lastSavedFingerprint: runtime.lastSavedFingerprint,
  });

  return {
    runtime: {
      ...runtime,
      pendingSaveReason: 'tick',
    },
    writePlan: {
      shouldWrite: decision.shouldSave,
      snapshot: decision.shouldSave ? decision.snapshot : null,
      fingerprint: decision.shouldSave ? decision.fingerprint : null,
      reason,
      epoch: runtime.epoch,
    },
  };
}

export function applyPersistenceWriteResult(params: {
  runtime: PersistenceRuntimeState;
  writePlan: PersistenceWritePlan;
}): PersistenceRuntimeState {
  const { runtime, writePlan } = params;
  if (!writePlan.shouldWrite || !writePlan.snapshot) return runtime;
  if (writePlan.epoch !== runtime.epoch) return runtime;

  return {
    ...runtime,
    lastSavedSnapshot: writePlan.snapshot,
    lastSavedFingerprint: writePlan.fingerprint,
  };
}

export function handleTerminalClear(
  runtime: PersistenceRuntimeState,
): PersistenceRuntimeState {
  return {
    ...runtime,
    epoch: runtime.epoch + 1,
    lastSavedSnapshot: null,
    lastSavedFingerprint: null,
  };
}

export function handleRestartOrHomeClear(
  runtime: PersistenceRuntimeState,
): PersistenceRuntimeState {
  return {
    ...runtime,
    epoch: runtime.epoch + 1,
    lastSavedSnapshot: null,
    lastSavedFingerprint: null,
    pendingSaveReason: 'tick',
  };
}
