import { describe, expect, it } from 'vitest';
import { createSession } from '@nexa/game-engine';
import {
  applyPersistenceWriteResult,
  createInitialPersistenceRuntimeState,
  createInitialTransientUiState,
  handleRestartOrHomeClear,
  handleSessionLifecycleChange,
  handleTerminalClear,
  planSessionPersistenceWrite,
} from './gameResumeWiring';

describe('game resume wiring', () => {
  it('restored/new session lifecycle clears transient selection/drag/summary state', () => {
    const runtime = createInitialPersistenceRuntimeState();
    const session = createSession('game-lifecycle');
    const transient = {
      selectedNodeId: 'n1',
      selectedLinkId: 'l1',
      dragPreviewActive: true,
      staleSummaryVisible: true,
    };

    const lifecycle = handleSessionLifecycleChange({ runtime, session });
    const cleared = createInitialTransientUiState();

    expect(lifecycle.shouldResetTransientUi).toBe(true);
    expect(cleared.selectedNodeId).toBeNull();
    expect(cleared.selectedLinkId).toBeNull();
    expect(cleared.dragPreviewActive).toBe(false);
    expect(cleared.staleSummaryVisible).toBe(false);
    expect(transient.staleSummaryVisible).toBe(true);
  });

  it('background save writes when policy permits and skips duplicate transitions', () => {
    const session = createSession('bg-save');
    let runtime = createInitialPersistenceRuntimeState();

    const first = planSessionPersistenceWrite({
      runtime,
      session,
      reasonOverride: 'background',
    });
    runtime = applyPersistenceWriteResult({
      runtime: first.runtime,
      writePlan: first.writePlan,
    });

    const duplicate = planSessionPersistenceWrite({
      runtime,
      session,
      reasonOverride: 'background',
    });

    expect(first.writePlan.shouldWrite).toBe(true);
    expect(duplicate.writePlan.shouldWrite).toBe(false);
  });

  it('after collapse, background save is blocked and stale pending write cannot apply', () => {
    const session = createSession('collapse-guard');
    let runtime = createInitialPersistenceRuntimeState();

    const pending = planSessionPersistenceWrite({
      runtime,
      session,
      reasonOverride: 'background',
    });

    runtime = handleTerminalClear(pending.runtime);
    runtime = applyPersistenceWriteResult({
      runtime,
      writePlan: pending.writePlan,
    });

    const collapsedSession = { ...session, collapsed: true };
    const blocked = planSessionPersistenceWrite({
      runtime,
      session: collapsedSession,
      reasonOverride: 'background',
    });

    expect(runtime.lastSavedSnapshot).toBeNull();
    expect(blocked.writePlan.shouldWrite).toBe(false);
  });

  it('restart/home clear resets fingerprint state and increments epoch', () => {
    const session = createSession('restart-home');
    let runtime = createInitialPersistenceRuntimeState();

    const saved = planSessionPersistenceWrite({
      runtime,
      session,
      reasonOverride: 'session_start',
    });
    runtime = applyPersistenceWriteResult({
      runtime: saved.runtime,
      writePlan: saved.writePlan,
    });

    const reset = handleRestartOrHomeClear(runtime);

    expect(runtime.lastSavedSnapshot).not.toBeNull();
    expect(reset.lastSavedSnapshot).toBeNull();
    expect(reset.lastSavedFingerprint).toBeNull();
    expect(reset.epoch).toBe(runtime.epoch + 1);
  });

  it('session lifecycle re-entry does not loop reset for same session id', () => {
    const session = createSession('loop-guard');
    const start = createInitialPersistenceRuntimeState();
    const first = handleSessionLifecycleChange({ runtime: start, session });
    const second = handleSessionLifecycleChange({
      runtime: first.runtime,
      session,
    });

    expect(first.shouldResetTransientUi).toBe(true);
    expect(second.shouldResetTransientUi).toBe(false);
  });
});
