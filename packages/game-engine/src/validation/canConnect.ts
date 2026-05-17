import type { SessionState } from '../session/types';
import { engineTuning } from '../config/tuning';

export type ConnectInvalidReason =
  | 'out_of_range'
  | 'duplicate_connection'
  | 'self_connection_not_allowed'
  | 'max_connections_reached'
  | 'not_enough_signal'
  | 'invalid_target';

export interface ConnectValidationResult {
  valid: boolean;
  reason: ConnectInvalidReason | null;
  distance: number;
}

function findNode(session: SessionState, id: string) {
  return session.graph.nodes.find((node) => node.id === id) ?? null;
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function canConnect(
  session: SessionState,
  fromNodeId: string,
  toNodeId: string,
): ConnectValidationResult {
  const from = findNode(session, fromNodeId);
  const to = findNode(session, toNodeId);
  if (!from || !to) {
    return {
      valid: false,
      reason: 'invalid_target',
      distance: Number.POSITIVE_INFINITY,
    };
  }
  if (fromNodeId === toNodeId) {
    return { valid: false, reason: 'self_connection_not_allowed', distance: 0 };
  }

  const d = distance(from.position, to.position);
  const relayBonus =
    from.type === 'relay' || to.type === 'relay'
      ? engineTuning.nodeTypes.relayRangeBonus
      : 0;
  if (d > engineTuning.connect.maxConnectDistance + relayBonus) {
    return { valid: false, reason: 'out_of_range', distance: d };
  }

  const duplicate = session.graph.links.some(
    (link) => link.from === fromNodeId && link.to === toNodeId,
  );
  if (duplicate) {
    return { valid: false, reason: 'duplicate_connection', distance: d };
  }

  const degree = session.graph.links.filter(
    (link) => link.from === fromNodeId || link.to === fromNodeId,
  ).length;
  if (degree >= engineTuning.connect.maxNodeDegree) {
    return { valid: false, reason: 'max_connections_reached', distance: d };
  }

  if (session.signalStrength < engineTuning.connect.minimumSignalRequired) {
    return { valid: false, reason: 'not_enough_signal', distance: d };
  }

  return { valid: true, reason: null, distance: d };
}
