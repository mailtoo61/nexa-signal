import { describe, expect, it } from 'vitest';
import { initialRecoverySnapshot, reduceRecoveryState } from './recoveryState';

describe('recovery state machine', () => {
  it('transitions across check/valid/restoring/restored', () => {
    let state = reduceRecoveryState(initialRecoverySnapshot, { type: 'check' });
    state = reduceRecoveryState(state, { type: 'valid' });
    state = reduceRecoveryState(state, {
      type: 'restoring',
      sessionId: 'session-1',
    });
    state = reduceRecoveryState(state, {
      type: 'restored',
      sessionId: 'session-1',
    });

    expect(state.state).toBe('restored');
    expect(state.restoredSessionId).toBe('session-1');
  });

  it('marks invalid and cleared once', () => {
    const invalid = reduceRecoveryState(initialRecoverySnapshot, {
      type: 'invalid',
      reason: 'snapshot.session.tick:invalid_number',
    });
    const cleared = reduceRecoveryState(invalid, { type: 'cleared' });

    expect(invalid.state).toBe('invalid');
    expect(cleared.state).toBe('cleared');
    expect(cleared.invalidCleared).toBe(true);
  });

  it('prevents double restore loop for same session id', () => {
    const restoring = reduceRecoveryState(initialRecoverySnapshot, {
      type: 'restoring',
      sessionId: 'session-loop',
    });
    const sameAgain = reduceRecoveryState(restoring, {
      type: 'restoring',
      sessionId: 'session-loop',
    });

    expect(sameAgain).toEqual(restoring);
  });
});
