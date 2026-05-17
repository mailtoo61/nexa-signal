import { describe, expect, it } from 'vitest';
import {
  createSavedSnapshot,
  createInMemoryResumableStorage,
  ResumeRecoveryHarness,
} from './resumeIntegrationHarness';

describe('resume/recovery integration harness', () => {
  it('saves active session on background when policy permits and skips duplicates', async () => {
    const storage = createInMemoryResumableStorage();
    const harness = new ResumeRecoveryHarness(storage);

    harness.startNewSession('bg-allow');
    const firstQueued = await harness.triggerBackground('session_start');
    await harness.flushPendingWrites();

    const duplicateQueued = await harness.triggerBackground('background');
    await harness.flushPendingWrites();

    expect(firstQueued).toBe(true);
    expect(duplicateQueued).toBe(false);
    expect(storage.getSaveCount()).toBe(1);
  });

  it('does not save after terminal collapse and respects race guard ordering', async () => {
    const storage = createInMemoryResumableStorage();
    const harness = new ResumeRecoveryHarness(storage);

    harness.startNewSession('collapse-race');
    await harness.triggerBackground('session_start');
    await harness.collapseSessionAndClearSnapshot();
    await harness.flushPendingWrites();

    const afterCollapseQueued = await harness.triggerBackground('background');
    const loadedAfterCollapse = await harness.storageLoad();

    expect(afterCollapseQueued).toBe(false);
    expect(loadedAfterCollapse).toBeNull();
    expect(storage.getClearCount()).toBe(1);
    expect(harness.getState().sessionSummaryPersisted).toBe(true);
  });

  it('restores valid snapshot and clears transient UI state without stale summary', async () => {
    const storage = createInMemoryResumableStorage();
    await storage.save(createSavedSnapshot('restore-valid'));
    const harness = new ResumeRecoveryHarness(storage);

    harness.setTransientUiState({
      selectedNodeId: 'n1',
      selectedLinkId: 'l1',
      dragPreviewActive: true,
      staleSummaryVisible: true,
    });

    await harness.runHomeRecoveryCheck();
    const restored = harness.performRestoreOnce();
    const state = harness.getState();

    expect(restored).toBe(true);
    expect(state.recovery.state).toBe('restored');
    expect(state.session?.seed).toBe('restore-valid');
    expect(state.uiState.selectedNodeId).toBeNull();
    expect(state.uiState.selectedLinkId).toBeNull();
    expect(state.uiState.dragPreviewActive).toBe(false);
    expect(state.uiState.staleSummaryVisible).toBe(false);
  });

  it('cannot restore twice for same validated snapshot', async () => {
    const storage = createInMemoryResumableStorage();
    await storage.save(createSavedSnapshot('restore-once'));
    const harness = new ResumeRecoveryHarness(storage);

    await harness.runHomeRecoveryCheck();
    const first = harness.performRestoreOnce();
    const second = harness.performRestoreOnce();

    expect(first).toBe(true);
    expect(second).toBe(false);
  });

  it('rejects invalid snapshot, clears once, and keeps fresh fallback available', async () => {
    const storage = createInMemoryResumableStorage({
      version: 1,
      snapshot: { broken: true },
    });
    const harness = new ResumeRecoveryHarness(storage);

    await harness.runHomeRecoveryCheck();
    const state = harness.getState();

    expect(state.recovery.invalidCleared).toBe(true);
    expect(state.recovery.state).toBe('cleared');
    expect(state.continueAvailable).toBe(false);
    expect(storage.getClearCount()).toBe(1);
    expect(harness.debugValidationReason()).toBeNull();
  });

  it('restart clears previous snapshot before new session and replaces safely', async () => {
    const storage = createInMemoryResumableStorage();
    const harness = new ResumeRecoveryHarness(storage);

    harness.startNewSession('restart-old');
    await harness.triggerBackground('session_start');
    await harness.flushPendingWrites();
    await harness.restartSession('restart-new');
    await harness.triggerBackground('session_start');
    await harness.flushPendingWrites();

    expect(storage.getClearCount()).toBe(1);
    expect(storage.getLastSaved()?.session.seed).toBe('restart-new');
  });

  it('home exit clears resumable snapshot and disables continue until validated save exists', async () => {
    const storage = createInMemoryResumableStorage();
    const harness = new ResumeRecoveryHarness(storage);

    harness.startNewSession('home-exit');
    await harness.triggerBackground('session_start');
    await harness.flushPendingWrites();
    await harness.exitHomeFromGame();
    await harness.runHomeRecoveryCheck();

    expect(harness.getState().continueAvailable).toBe(false);

    harness.startNewSession('home-exit-new');
    await harness.triggerBackground('session_start');
    await harness.flushPendingWrites();
    await harness.runHomeRecoveryCheck();

    expect(harness.getState().continueAvailable).toBe(true);
  });

  it('storage ordering: save->load latest, clear->load none, malformed load safe', async () => {
    const storage = createInMemoryResumableStorage();
    const harness = new ResumeRecoveryHarness(storage);

    const s1 = createSavedSnapshot('store-1');
    const s2 = createSavedSnapshot('store-2');
    await storage.save(s1);
    await storage.save(s2);

    const loadedLatest = await harness.storageLoad();
    expect(
      (loadedLatest as { session?: { seed?: string } })?.session?.seed,
    ).toBe('store-2');

    await harness.storageClear();
    const loadedAfterClear = await harness.storageLoad();
    expect(loadedAfterClear).toBeNull();

    const malformedStorage = createInMemoryResumableStorage('malformed');
    const malformedHarness = new ResumeRecoveryHarness(malformedStorage);
    await malformedHarness.runHomeRecoveryCheck();
    expect(malformedHarness.getState().continueAvailable).toBe(false);
  });
});
