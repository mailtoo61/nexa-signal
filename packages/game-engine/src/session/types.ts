import type { NetworkGraph } from '../graph/types';
import type { NodeType } from '../nodes/types';

export interface SessionMetrics {
  nodesStabilized: number;
  linksRepaired: number;
  connectionsCreated: number;
  invalidActions: number;
  criticalSaves: number;
  collapseWarningsShown: number;
  firstActionTick: number | null;
  firstOverloadTick: number | null;
  firstCollapseWarningTick: number | null;
  firstSuccessfulStabilizeTick: number | null;
  firstSuccessfulRepairTick: number | null;
  relayConnectionsUsed: number;
  amplifierBoosts: number;
  stabilizerSaves: number;
  decayerDamagePrevented: number;
  coreRiskEvents: number;
  specialNodeSeen: NodeType[];
  riskSum: number;
  riskSamples: number;
}

export interface SessionState {
  sessionId: string;
  seed: string;
  profile: 'intro' | 'standard';
  tuningVersion: string;
  tick: number;
  elapsedMs: number;
  signalStrength: number;
  stability: number;
  collapsed: boolean;
  score: number;
  graph: NetworkGraph;
  metrics: SessionMetrics;
}

export type PlayerAction =
  | { type: 'connect'; from: string; to: string }
  | { type: 'disconnect'; linkId: string }
  | { type: 'redirect'; linkId: string; to: string }
  | { type: 'stabilize'; nodeId: string }
  | { type: 'repair'; linkId: string };
