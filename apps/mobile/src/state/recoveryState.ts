export type RecoveryState =
  | 'idle'
  | 'checking'
  | 'valid'
  | 'restoring'
  | 'restored'
  | 'invalid'
  | 'expired'
  | 'cleared';

export interface RecoverySnapshot {
  state: RecoveryState;
  restoredSessionId: string | null;
  invalidCleared: boolean;
  devValidationReason: string | null;
}

export const initialRecoverySnapshot: RecoverySnapshot = {
  state: 'idle',
  restoredSessionId: null,
  invalidCleared: false,
  devValidationReason: null,
};

export type RecoveryEvent =
  | { type: 'check' }
  | { type: 'valid' }
  | { type: 'restoring'; sessionId: string }
  | { type: 'restored'; sessionId: string }
  | { type: 'invalid'; reason?: string }
  | { type: 'expired' }
  | { type: 'cleared' }
  | { type: 'reset' };

export function reduceRecoveryState(
  current: RecoverySnapshot,
  event: RecoveryEvent,
): RecoverySnapshot {
  const devMode =
    typeof globalThis !== 'undefined' &&
    '__DEV__' in globalThis &&
    Boolean((globalThis as { __DEV__?: boolean }).__DEV__);
  switch (event.type) {
    case 'check':
      return {
        ...current,
        state: 'checking',
        devValidationReason: null,
      };
    case 'valid':
      return {
        ...current,
        state: 'valid',
        devValidationReason: null,
      };
    case 'restoring':
      if (current.restoredSessionId === event.sessionId) {
        return current;
      }
      return {
        ...current,
        state: 'restoring',
        restoredSessionId: event.sessionId,
        devValidationReason: null,
      };
    case 'restored':
      return {
        ...current,
        state: 'restored',
        restoredSessionId: event.sessionId,
        devValidationReason: null,
      };
    case 'invalid':
      return {
        ...current,
        state: 'invalid',
        devValidationReason: devMode ? (event.reason ?? null) : null,
      };
    case 'expired':
      return {
        ...current,
        state: 'expired',
        devValidationReason: null,
      };
    case 'cleared':
      return {
        ...current,
        state: 'cleared',
        invalidCleared: true,
      };
    case 'reset':
      return {
        ...initialRecoverySnapshot,
      };
    default:
      return current;
  }
}
