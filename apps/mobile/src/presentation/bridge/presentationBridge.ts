import type { SessionState } from '@nexa/game-engine';

export interface PresentationSnapshot {
  sessionId: string;
  stability: number;
  signalStrength: number;
  elapsedMs: number;
  tick: number;
  collapsed: boolean;
  score: number;
  nodes: Array<{
    id: string;
    type: 'core' | 'relay' | 'amplifier' | 'stabilizer' | 'decayer';
    position: { x: number; y: number };
    health: number;
    overload: number;
    stabilized: boolean;
  }>;
  links: Array<{
    id: string;
    from: string;
    to: string;
    health: number;
    broken: boolean;
  }>;
}

export function toPresentationSnapshot(
  session: SessionState | null,
): PresentationSnapshot {
  if (!session) {
    return {
      sessionId: 'none',
      stability: 0,
      signalStrength: 0,
      elapsedMs: 0,
      tick: 0,
      collapsed: false,
      score: 0,
      nodes: [],
      links: [],
    };
  }

  return {
    sessionId: session.sessionId,
    stability: session.stability,
    signalStrength: session.signalStrength,
    elapsedMs: session.elapsedMs,
    tick: session.tick,
    collapsed: session.collapsed,
    score: session.score,
    nodes: session.graph.nodes,
    links: session.graph.links,
  };
}
