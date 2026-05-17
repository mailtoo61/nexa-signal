import type { SessionState } from '../session/types';
import {
  createSessionSnapshot,
  deserializeSessionSnapshot,
  restoreSessionSnapshot,
  serializeSessionSnapshot,
} from './sessionSnapshot';

export function serializeSession(state: SessionState): string {
  return serializeSessionSnapshot(createSessionSnapshot(state));
}

export function deserializeSession(payload: string): SessionState {
  return restoreSessionSnapshot(deserializeSessionSnapshot(payload));
}
