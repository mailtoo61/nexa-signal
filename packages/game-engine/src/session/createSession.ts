import { engineTuning } from '../config/tuning';
import { assignNodeTypes } from '../nodes/assignNodeTypes';
import { createRng } from '../rng/index';
import type { SessionState } from '../session/types';

export function createSession(seed: string): SessionState {
  const rng = createRng(seed);
  const rolls = Array.from({ length: 6 }, () => rng.next());
  const nodeTypes = assignNodeTypes(rolls);
  const profile: 'intro' | 'standard' = seed.startsWith('intro-')
    ? 'intro'
    : 'standard';

  const nodes = Array.from({ length: 6 }, (_, i) => ({
    id: `n${i}`,
    type: nodeTypes[i],
    position: {
      x: 0.5 + Math.cos((Math.PI * 2 * i) / 6 - Math.PI / 2) * 0.32,
      y: 0.5 + Math.sin((Math.PI * 2 * i) / 6 - Math.PI / 2) * 0.32,
    },
    health: 100,
    overload: Math.floor(rng.next() * 14),
    stabilized: false,
  }));
  const links = Array.from({ length: 7 }, (_, i) => ({
    id: `l${i}`,
    from: `n${i % 6}`,
    to: `n${(i + 1) % 6}`,
    health: 100,
    broken: false,
  }));
  return {
    sessionId: `s_${seed}`,
    seed,
    profile,
    tuningVersion: engineTuning.version,
    tick: 0,
    elapsedMs: 0,
    signalStrength: 100,
    stability: 100,
    collapsed: false,
    score: 0,
    graph: { nodes, links },
    metrics: {
      nodesStabilized: 0,
      linksRepaired: 0,
      connectionsCreated: 0,
      invalidActions: 0,
      criticalSaves: 0,
      collapseWarningsShown: 0,
      firstActionTick: null,
      firstOverloadTick: null,
      firstCollapseWarningTick: null,
      firstSuccessfulStabilizeTick: null,
      firstSuccessfulRepairTick: null,
      relayConnectionsUsed: 0,
      amplifierBoosts: 0,
      stabilizerSaves: 0,
      decayerDamagePrevented: 0,
      coreRiskEvents: 0,
      specialNodeSeen: [],
      riskSum: 0,
      riskSamples: 0,
    },
  };
}
