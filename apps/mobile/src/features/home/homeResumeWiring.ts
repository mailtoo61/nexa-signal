import {
  restoreSessionSnapshot,
  validateSessionSnapshot,
  type SessionState,
} from '@nexa/game-engine';
import {
  reduceRecoveryState,
  type RecoverySnapshot,
} from '../../state/recoveryState';

export interface HomeRecoveryResult {
  recovery: RecoverySnapshot;
  resumableSession: SessionState | null;
  resumeStatusKey: string | null;
  shouldClearSnapshot: boolean;
}

export function evaluateHomeRecoverySnapshot(
  snapshot: unknown | null,
  currentRecovery: RecoverySnapshot,
): HomeRecoveryResult {
  const checkingRecovery = reduceRecoveryState(currentRecovery, {
    type: 'check',
  });

  if (!snapshot) {
    return {
      recovery: reduceRecoveryState(checkingRecovery, { type: 'expired' }),
      resumableSession: null,
      resumeStatusKey: null,
      shouldClearSnapshot: false,
    };
  }

  const validation = validateSessionSnapshot(snapshot);
  if (!validation.valid) {
    const firstError = validation.errors[0];
    const invalidReason = firstError
      ? `${firstError.path}:${firstError.code}`
      : 'invalid';

    return {
      recovery: reduceRecoveryState(
        reduceRecoveryState(checkingRecovery, {
          type: 'invalid',
          reason: invalidReason,
        }),
        { type: 'cleared' },
      ),
      resumableSession: null,
      resumeStatusKey: 'resumeFailedSafely',
      shouldClearSnapshot: true,
    };
  }

  return {
    recovery: reduceRecoveryState(checkingRecovery, { type: 'valid' }),
    resumableSession: restoreSessionSnapshot(snapshot),
    resumeStatusKey: null,
    shouldClearSnapshot: false,
  };
}

export interface HomeContinueActionResult {
  recovery: RecoverySnapshot;
  resumableSession: SessionState | null;
  resumeStatusKey: string;
  shouldRestoreSession: boolean;
  restoredSession: SessionState | null;
}

export function resolveHomeContinueAction(params: {
  resumableSession: SessionState | null;
  recovery: RecoverySnapshot;
  shouldShowContinueCta: boolean;
}): HomeContinueActionResult {
  const { recovery, resumableSession, shouldShowContinueCta } = params;

  if (resumableSession && recovery.state === 'valid') {
    const restoring = reduceRecoveryState(recovery, {
      type: 'restoring',
      sessionId: resumableSession.sessionId,
    });
    return {
      recovery: reduceRecoveryState(restoring, {
        type: 'restored',
        sessionId: resumableSession.sessionId,
      }),
      resumableSession: null,
      resumeStatusKey: 'networkRestored',
      shouldRestoreSession: true,
      restoredSession: resumableSession,
    };
  }

  if (shouldShowContinueCta) {
    return {
      recovery,
      resumableSession,
      resumeStatusKey: 'previousNetworkUnavailable',
      shouldRestoreSession: false,
      restoredSession: null,
    };
  }

  return {
    recovery,
    resumableSession,
    resumeStatusKey: 'startingFreshNetwork',
    shouldRestoreSession: false,
    restoredSession: null,
  };
}
