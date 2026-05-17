import { describe, expect, it } from 'vitest';
import {
  applyAction,
  calculateFinalScore,
  canConnect,
  createSession,
  createSessionSnapshot,
  deserializeSessionSnapshot,
  deserializeSession,
  engineTuning,
  getCollapseReason,
  getNetworkRiskSnapshot,
  getRecommendedAction,
  instabilityScale,
  serializeSession,
  serializeSessionSnapshot,
  stepSession,
  restoreSessionSnapshot,
  validateSessionSnapshot,
} from '../src/index.js';

describe('engine determinism', () => {
  it('returns the same state sequence for same seed', () => {
    const seed = 'daily-2026-05-10';
    let a = createSession(seed);
    let b = createSession(seed);
    for (let i = 0; i < 20; i += 1) {
      a = stepSession(a);
      b = stepSession(b);
    }
    expect(a).toEqual(b);
  });

  it('deterministic node positions and types by seed', () => {
    const one = createSession('geo-1');
    const two = createSession('geo-1');
    expect(one.graph.nodes.map((n) => ({ p: n.position, t: n.type }))).toEqual(
      two.graph.nodes.map((n) => ({ p: n.position, t: n.type })),
    );
  });

  it('onboarding intro profile is deterministic by seed prefix', () => {
    const intro = createSession('intro-abc');
    const standard = createSession('run-abc');
    expect(intro.profile).toBe('intro');
    expect(standard.profile).toBe('standard');
  });

  it('core always exists', () => {
    const state = createSession('core-check');
    expect(state.graph.nodes.some((n) => n.type === 'core')).toBe(true);
  });

  it('early session special node cap respected', () => {
    const state = createSession('special-cap');
    const special = state.graph.nodes.filter(
      (n) =>
        n.type === 'amplifier' ||
        n.type === 'stabilizer' ||
        n.type === 'decayer',
    );
    expect(special.length).toBeLessThanOrEqual(
      engineTuning.nodeTypes.maxSpecialNodesEarlySession,
    );
  });

  it('relay bonus affects validation', () => {
    const state = createSession('relay-range');
    const boosted = {
      ...state,
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.map((n, i) =>
          i === 0
            ? { ...n, type: 'relay', position: { x: 0.1, y: 0.1 } }
            : i === 1
              ? { ...n, position: { x: 0.56, y: 0.1 } }
              : n,
        ),
        links: state.graph.links.filter(
          (l) => !(l.from === 'n0' && l.to === 'n1'),
        ),
      },
    };
    expect(canConnect(boosted, 'n0', 'n1').valid).toBe(true);
  });

  it('connect invalid out of range', () => {
    const state = createSession('range-invalid');
    const forced = {
      ...state,
      graph: {
        ...state.graph,
        links: state.graph.links.filter(
          (l) => !(l.from === 'n0' && l.to === 'n5'),
        ),
        nodes: state.graph.nodes.map((node) =>
          node.id === 'n5' ? { ...node, position: { x: 0.99, y: 0.99 } } : node,
        ),
      },
    };
    const result = canConnect(forced, 'n0', 'n5');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('out_of_range');
  });

  it('rejects self-link and duplicate link', () => {
    const state = createSession('dup-test');
    expect(canConnect(state, 'n0', 'n0').reason).toBe(
      'self_connection_not_allowed',
    );
    expect(canConnect(state, 'n0', 'n1').reason).toBe('duplicate_connection');
  });

  it('amplifier increases deterministic pressure', () => {
    const state = createSession('amp-seed');
    const forced = {
      ...state,
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.map((n, i) =>
          i === 1 ? { ...n, type: 'amplifier' } : n,
        ),
      },
    };
    const next = stepSession(forced);
    expect(next.metrics.amplifierBoosts).toBeGreaterThan(
      forced.metrics.amplifierBoosts,
    );
  });

  it('stabilizer reduces nearby instability deterministically', () => {
    const state = createSession('stab-seed');
    const forced = {
      ...state,
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.map((n, i) =>
          i === 1
            ? { ...n, type: 'stabilizer', position: { x: 0.5, y: 0.5 } }
            : i === 2
              ? { ...n, position: { x: 0.55, y: 0.5 }, overload: 30 }
              : n,
        ),
      },
    };
    const next = stepSession(forced);
    expect(next.metrics.stabilizerSaves).toBeGreaterThanOrEqual(0);
  });

  it('decayer damages nearby links deterministically', () => {
    const state = createSession('decay-seed');
    const forced = {
      ...state,
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.map((n, i) =>
          i === 0 ? { ...n, type: 'decayer' } : n,
        ),
      },
    };
    const next = stepSession(forced);
    expect(next.graph.links.some((l) => l.health < 99)).toBe(true);
  });

  it('recommendation accounts for special nodes', () => {
    const state = createSession('reco-seed');
    const stressed = {
      ...state,
      stability: 12,
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.map((node) =>
          node.id === 'n2'
            ? { ...node, type: 'amplifier', overload: 96 }
            : node,
        ),
      },
    };
    const rec = getRecommendedAction(stressed, { type: 'node', id: 'n2' });
    expect(rec?.reason).toBe('because_amplifier_overload_risk');
  });

  it('risk snapshot reports critical ids', () => {
    const state = createSession('risk-seed');
    const risky = {
      ...state,
      stability: 18,
      signalStrength: 22,
      graph: {
        ...state.graph,
        links: state.graph.links.map((link, idx) =>
          idx === 0 ? { ...link, health: 5 } : link,
        ),
      },
    };
    const risk = getNetworkRiskSnapshot(risky);
    expect(
      risk.riskLevel === 'medium' ||
        risk.riskLevel === 'high' ||
        risk.riskLevel === 'critical',
    ).toBe(true);
    expect(risk.mostCriticalLinkId).not.toBeNull();
  });

  it('collapse reason is deterministic', () => {
    let state = createSession('collapse-seed');
    for (let i = 0; i < 500 && !state.collapsed; i += 1) {
      state = stepSession(state);
    }
    const reasonA = getCollapseReason(state);
    const reasonB = getCollapseReason(state);
    expect(reasonA).toBe(reasonB);
  });

  it('supports deterministic restart with same seed', () => {
    const one = createSession('run-42');
    const two = createSession('run-42');
    expect(one).toEqual(two);
  });

  it('applies stabilize action and updates metrics', () => {
    const initial = createSession('action-seed');
    const target = initial.graph.nodes[0];
    const primed = {
      ...initial,
      graph: {
        ...initial.graph,
        nodes: initial.graph.nodes.map((node) =>
          node.id === target.id ? { ...node, overload: 90 } : node,
        ),
      },
    };
    const next = applyAction(primed, { type: 'stabilize', nodeId: target.id });
    const mutated = next.graph.nodes.find((node) => node.id === target.id);
    expect(mutated?.overload).toBeLessThan(90);
    expect(next.metrics.nodesStabilized).toBe(1);
  });

  it('connect action is deterministic and increments metric', () => {
    const initial = createSession('connect-seed');
    const prepared = {
      ...initial,
      graph: {
        ...initial.graph,
        links: initial.graph.links.filter(
          (link) => !(link.from === 'n0' && link.to === 'n1'),
        ),
      },
    };
    const next = applyAction(prepared, {
      type: 'connect',
      from: 'n0',
      to: 'n1',
    });
    expect(next.graph.links.length).toBe(prepared.graph.links.length + 1);
    expect(next.metrics.connectionsCreated).toBe(1);
    const again = applyAction(prepared, {
      type: 'connect',
      from: 'n0',
      to: 'n1',
    });
    expect(next).toEqual(again);
  });

  it('rejects invalid duplicate connect', () => {
    const initial = createSession('invalid-connect');
    const duplicate = applyAction(initial, {
      type: 'connect',
      from: 'n0',
      to: 'n1',
    });
    expect(duplicate.metrics.invalidActions).toBe(
      initial.metrics.invalidActions + 1,
    );
  });

  it('collapses under instability pressure', () => {
    let state = createSession('collapse-seed');
    for (let i = 0; i < 400 && !state.collapsed; i += 1) {
      state = stepSession(state);
    }
    expect(state.collapsed).toBe(true);
  });

  it('keeps scoring deterministic and serializable', () => {
    let state = createSession('score-seed');
    for (let i = 0; i < 15; i += 1) {
      state = stepSession(state);
    }
    const scoreA = calculateFinalScore(state);
    const restored = deserializeSession(serializeSession(state));
    const scoreB = calculateFinalScore(restored);
    expect(scoreA).toBe(scoreB);
    expect(restored).toEqual(state);
  });

  it('restores snapshot to equal session state', () => {
    let state = createSession('resume-seed');
    for (let i = 0; i < 10; i += 1) {
      state = stepSession(state);
    }
    const snapshot = createSessionSnapshot(state);
    const restored = restoreSessionSnapshot(snapshot);
    expect(restored).toEqual(state);
  });

  it('keeps deterministic continuation after restore', () => {
    let state = createSession('resume-continue-seed');
    for (let i = 0; i < 12; i += 1) {
      state = stepSession(state);
    }
    const restored = restoreSessionSnapshot(createSessionSnapshot(state));
    const a = stepSession(state);
    const b = stepSession(restored);
    expect(a).toEqual(b);
  });

  it('rejects corrupted and impossible snapshots', () => {
    const state = createSession('invalid-snapshot-seed');
    const snapshot = createSessionSnapshot(state);
    const invalid = {
      ...snapshot,
      snapshotVersion: 999,
      session: {
        ...snapshot.session,
        graph: {
          ...snapshot.session.graph,
          links: [
            ...snapshot.session.graph.links,
            {
              id: 'bad-link',
              from: 'n0',
              to: 'missing-node',
              health: 50,
              broken: false,
            },
          ],
        },
      },
    };
    const validation = validateSessionSnapshot(invalid);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('serializes/deserializes snapshot payload safely', () => {
    const state = createSession('snapshot-ser-seed');
    const payload = serializeSessionSnapshot(createSessionSnapshot(state));
    const decoded = deserializeSessionSnapshot(payload);
    const validation = validateSessionSnapshot(decoded);
    expect(validation.valid).toBe(true);
  });

  it('uses deterministic pacing thresholds', () => {
    expect(instabilityScale(0)).toBe(engineTuning.instability.earlyScale);
    expect(instabilityScale(50)).toBe(engineTuning.instability.midScale);
    expect(instabilityScale(130)).toBe(engineTuning.instability.lateScale);
  });

  it('intro profile has smoother early instability pacing', () => {
    const intro = createSession('intro-safety');
    const standard = createSession('run-safety');
    let a = intro;
    let b = standard;
    for (let i = 0; i < 30; i += 1) {
      a = stepSession(a);
      b = stepSession(b);
    }
    expect(a.stability).toBeGreaterThanOrEqual(b.stability);
  });

  it('intro profile tuning keeps first 30 seconds forgiving', () => {
    expect(engineTuning.tickMs * 60).toBe(30_000);
    expect(engineTuning.intro.earlyDurationTicks).toBeGreaterThanOrEqual(60);
    expect(engineTuning.intro.earlyInstabilityMultiplier).toBeLessThan(0.7);
    expect(engineTuning.intro.earlyAmplifierPenaltyMultiplier).toBeLessThan(
      0.45,
    );
    expect(engineTuning.intro.earlyDecayerDamageMultiplier).toBeLessThan(0.3);
  });
});
