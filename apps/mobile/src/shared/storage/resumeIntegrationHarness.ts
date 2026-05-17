import {
  createSession,
  createSessionSnapshot,
  restoreSessionSnapshot,
  validateSessionSnapshot,
  type SessionSnapshot,
  type SessionState,
} from '@nexa/game-engine';
import {
  decideResumableSnapshotSave,
  type SaveReason,
} from './resumeSavePolicy';
import {
  initialRecoverySnapshot,
  reduceRecoveryState,
  type RecoverySnapshot,
} from '../../state/recoveryState';

export interface InMemoryResumableStorage {
  save: (snapshot: SessionSnapshot) => Promise<void>;
  load: () => Promise<unknown | null>;
  clear: () => Promise<void>;
  getSaveCount: () => number;
  getClearCount: () => number;
  getLoadCount: () => number;
  getLastSaved: () => SessionSnapshot | null;
}

export interface TransientUiState {
  selectedNodeId: string | null;
  selectedLinkId: string | null;
  dragPreviewActive: boolean;
  staleSummaryVisible: boolean;
}

export interface HarnessSnapshot {
  session: SessionState | null;
  recovery: RecoverySnapshot;
  uiState: TransientUiState;
  continueAvailable: boolean;
  sessionSummaryPersisted: boolean;
  lastSaveReason: SaveReason | null;
}

function createTransientUiState(): TransientUiState {
  return {
    selectedNodeId: null,
    selectedLinkId: null,
    dragPreviewActive: false,
    staleSummaryVisible: false,
  };
}

export function createInMemoryResumableStorage(
  malformedRaw: unknown | null = null,
): InMemoryResumableStorage {
  let persisted: unknown | null = malformedRaw;
  let saveCount = 0;
  let clearCount = 0;
  let loadCount = 0;
  let lastSaved: SessionSnapshot | null = null;

  return {
    save: async (snapshot) => {
      persisted = { version: 1, snapshot };
      lastSaved = snapshot;
      saveCount += 1;
    },
    load: async () => {
      loadCount += 1;
      if (!persisted || typeof persisted !== 'object') return null;
      const parsed = persisted as { snapshot?: unknown };
      return parsed.snapshot ?? null;
    },
    clear: async () => {
      persisted = null;
      clearCount += 1;
    },
    getSaveCount: () => saveCount,
    getClearCount: () => clearCount,
    getLoadCount: () => loadCount,
    getLastSaved: () => lastSaved,
  };
}

export class ResumeRecoveryHarness {
  private storage: InMemoryResumableStorage;
  private session: SessionState | null = null;
  private recovery: RecoverySnapshot = initialRecoverySnapshot;
  private uiState: TransientUiState = createTransientUiState();
  private continueAvailable = false;
  private sessionSummaryPersisted = false;
  private lastSavedSnapshot: SessionSnapshot | null = null;
  private lastSavedFingerprint: string | null = null;
  private epoch = 0;
  private pendingWrites: Array<{
    epoch: number;
    snapshot: SessionSnapshot;
    fingerprint: string | null;
  }> = [];
  private restoredSessionId: string | null = null;
  private lastSaveReason: SaveReason | null = null;
  private validatedSnapshot: unknown | null = null;

  constructor(storage: InMemoryResumableStorage) {
    this.storage = storage;
  }

  getState(): HarnessSnapshot {
    return {
      session: this.session,
      recovery: this.recovery,
      uiState: { ...this.uiState },
      continueAvailable: this.continueAvailable,
      sessionSummaryPersisted: this.sessionSummaryPersisted,
      lastSaveReason: this.lastSaveReason,
    };
  }

  startNewSession(seed: string): void {
    this.epoch += 1;
    this.session = createSession(seed);
    this.recovery = reduceRecoveryState(this.recovery, { type: 'reset' });
    this.uiState = createTransientUiState();
    this.lastSavedSnapshot = null;
    this.lastSavedFingerprint = null;
    this.restoredSessionId = null;
    this.sessionSummaryPersisted = false;
  }

  setTransientUiState(state: Partial<TransientUiState>): void {
    this.uiState = { ...this.uiState, ...state };
  }

  setSessionForTest(session: SessionState): void {
    this.session = session;
  }

  async triggerBackground(reason: SaveReason = 'background'): Promise<boolean> {
    if (!this.session || this.session.collapsed) return false;
    const decision = decideResumableSnapshotSave({
      reason,
      currentSession: this.session,
      lastSavedSnapshot: this.lastSavedSnapshot,
      lastSavedFingerprint: this.lastSavedFingerprint,
    });
    if (!decision.shouldSave) return false;

    this.lastSaveReason = reason;
    this.pendingWrites.push({
      epoch: this.epoch,
      snapshot: decision.snapshot,
      fingerprint: decision.fingerprint,
    });
    return true;
  }

  async flushPendingWrites(): Promise<void> {
    while (this.pendingWrites.length > 0) {
      const write = this.pendingWrites.shift();
      if (!write) continue;
      if (write.epoch !== this.epoch) continue;
      await this.storage.save(write.snapshot);
      this.lastSavedSnapshot = write.snapshot;
      this.lastSavedFingerprint = write.fingerprint;
    }
  }

  async collapseSessionAndClearSnapshot(): Promise<void> {
    this.epoch += 1;
    if (this.session) {
      this.session = { ...this.session, collapsed: true };
    }
    await this.storage.clear();
    this.lastSavedSnapshot = null;
    this.lastSavedFingerprint = null;
    this.sessionSummaryPersisted = true;
  }

  async restartSession(seed: string): Promise<void> {
    this.epoch += 1;
    await this.storage.clear();
    this.lastSavedSnapshot = null;
    this.lastSavedFingerprint = null;
    this.session = createSession(seed);
    this.uiState = createTransientUiState();
    this.sessionSummaryPersisted = false;
  }

  async exitHomeFromGame(): Promise<void> {
    this.epoch += 1;
    await this.storage.clear();
    this.lastSavedSnapshot = null;
    this.lastSavedFingerprint = null;
  }

  async runHomeRecoveryCheck(): Promise<void> {
    this.recovery = reduceRecoveryState(this.recovery, { type: 'check' });
    const loaded = await this.storage.load();

    if (!loaded) {
      this.recovery = reduceRecoveryState(this.recovery, { type: 'expired' });
      this.continueAvailable = false;
      this.validatedSnapshot = null;
      return;
    }

    const validation = validateSessionSnapshot(loaded);
    if (!validation.valid) {
      this.recovery = reduceRecoveryState(this.recovery, {
        type: 'invalid',
        reason: validation.errors[0]
          ? `${validation.errors[0].path}:${validation.errors[0].code}`
          : 'invalid',
      });
      await this.storage.clear();
      this.recovery = reduceRecoveryState(this.recovery, { type: 'cleared' });
      this.continueAvailable = false;
      this.validatedSnapshot = null;
      return;
    }

    this.recovery = reduceRecoveryState(this.recovery, { type: 'valid' });
    this.continueAvailable = true;
    this.validatedSnapshot = loaded;
  }

  performRestoreOnce(): boolean {
    if (!this.continueAvailable) return false;
    if (!this.validatedSnapshot) return false;
    const restoredSession = restoreSessionSnapshot(this.validatedSnapshot);
    if (this.restoredSessionId === restoredSession.sessionId) return false;

    this.recovery = reduceRecoveryState(this.recovery, {
      type: 'restoring',
      sessionId: restoredSession.sessionId,
    });
    this.session = restoredSession;
    this.uiState = createTransientUiState();
    this.recovery = reduceRecoveryState(this.recovery, {
      type: 'restored',
      sessionId: restoredSession.sessionId,
    });
    this.restoredSessionId = restoredSession.sessionId;
    this.continueAvailable = false;
    this.validatedSnapshot = null;
    return true;
  }

  async storageLoad(): Promise<unknown | null> {
    return this.storage.load();
  }

  async storageClear(): Promise<void> {
    await this.storage.clear();
  }

  debugValidationReason(): string | null {
    if (
      typeof globalThis !== 'undefined' &&
      '__DEV__' in globalThis &&
      (globalThis as { __DEV__?: boolean }).__DEV__
    ) {
      return this.recovery.devValidationReason;
    }
    return null;
  }
}

export function createSavedSnapshot(seed: string): SessionSnapshot {
  return createSessionSnapshot(createSession(seed));
}
