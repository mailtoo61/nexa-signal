import { engineTuning } from '../config/tuning';
import type { NodeType } from '../nodes/types';
import type { PlayerAction, SessionState } from '../session/types';
import { canConnect } from '../validation/canConnect';

function stampFirstAction(state: SessionState): SessionState {
  if (state.metrics.firstActionTick !== null) return state;
  return {
    ...state,
    metrics: {
      ...state.metrics,
      firstActionTick: state.tick,
    },
  };
}

function registerSeenTypes(
  state: SessionState,
  types: NodeType[],
): SessionState {
  const unique = Array.from(
    new Set([...state.metrics.specialNodeSeen, ...types]),
  );
  return {
    ...state,
    metrics: {
      ...state.metrics,
      specialNodeSeen: unique,
    },
  };
}

function addInvalidAction(state: SessionState): SessionState {
  const withStamp = stampFirstAction(state);
  return {
    ...withStamp,
    metrics: {
      ...withStamp.metrics,
      invalidActions: withStamp.metrics.invalidActions + 1,
    },
  };
}

export function applyAction(
  state: SessionState,
  action: PlayerAction,
): SessionState {
  if (state.collapsed) return state;

  switch (action.type) {
    case 'stabilize': {
      const node = state.graph.nodes.find((item) => item.id === action.nodeId);
      if (!node || node.overload < 10) return addInvalidAction(state);
      const criticalSave = node.overload >= 85 || state.stability <= 20;
      const withSeen = registerSeenTypes(stampFirstAction(state), [node.type]);
      return {
        ...withSeen,
        graph: {
          ...withSeen.graph,
          nodes: withSeen.graph.nodes.map((item) =>
            item.id === action.nodeId
              ? {
                  ...item,
                  overload: Math.max(
                    0,
                    item.overload - engineTuning.actions.stabilizeStrength,
                  ),
                  stabilized: true,
                }
              : item,
          ),
        },
        metrics: {
          ...withSeen.metrics,
          nodesStabilized: withSeen.metrics.nodesStabilized + 1,
          firstSuccessfulStabilizeTick:
            withSeen.metrics.firstSuccessfulStabilizeTick === null
              ? withSeen.tick
              : withSeen.metrics.firstSuccessfulStabilizeTick,
          criticalSaves:
            withSeen.metrics.criticalSaves + (criticalSave ? 1 : 0),
          stabilizerSaves:
            withSeen.metrics.stabilizerSaves +
            (node.type === 'stabilizer' ? 1 : 0),
        },
      };
    }

    case 'repair': {
      const link = state.graph.links.find((item) => item.id === action.linkId);
      if (!link || link.health > 95) return addInvalidAction(state);
      const withStamp = stampFirstAction(state);
      return {
        ...withStamp,
        graph: {
          ...withStamp.graph,
          links: withStamp.graph.links.map((item) =>
            item.id === action.linkId
              ? {
                  ...item,
                  health: Math.min(
                    100,
                    item.health + engineTuning.actions.repairStrength,
                  ),
                  broken: false,
                }
              : item,
          ),
        },
        metrics: {
          ...withStamp.metrics,
          linksRepaired: withStamp.metrics.linksRepaired + 1,
          firstSuccessfulRepairTick:
            withStamp.metrics.firstSuccessfulRepairTick === null
              ? withStamp.tick
              : withStamp.metrics.firstSuccessfulRepairTick,
        },
      };
    }

    case 'disconnect': {
      const exists = state.graph.links.some(
        (item) => item.id === action.linkId,
      );
      if (!exists) return addInvalidAction(state);
      const withStamp = stampFirstAction(state);
      return {
        ...withStamp,
        graph: {
          ...withStamp.graph,
          links: withStamp.graph.links.filter(
            (item) => item.id !== action.linkId,
          ),
        },
      };
    }

    case 'connect': {
      const validation = canConnect(state, action.from, action.to);
      if (!validation.valid) {
        return addInvalidAction(state);
      }
      const fromNode = state.graph.nodes.find(
        (item) => item.id === action.from,
      );
      const toNode = state.graph.nodes.find((item) => item.id === action.to);
      if (!fromNode || !toNode) return addInvalidAction(state);

      const withSeen = registerSeenTypes(stampFirstAction(state), [
        fromNode.type,
        toNode.type,
      ]);
      return {
        ...withSeen,
        signalStrength: Math.max(
          0,
          withSeen.signalStrength - engineTuning.connect.connectionSignalCost,
        ),
        graph: {
          ...withSeen.graph,
          links: [
            ...withSeen.graph.links,
            {
              id: `l${withSeen.graph.links.length + 1}`,
              from: action.from,
              to: action.to,
              health: 100,
              broken: false,
            },
          ],
        },
        metrics: {
          ...withSeen.metrics,
          connectionsCreated: withSeen.metrics.connectionsCreated + 1,
          relayConnectionsUsed:
            withSeen.metrics.relayConnectionsUsed +
            (fromNode.type === 'relay' || toNode.type === 'relay' ? 1 : 0),
        },
      };
    }

    case 'redirect': {
      const link = state.graph.links.find((item) => item.id === action.linkId);
      const hasTo = state.graph.nodes.some((item) => item.id === action.to);
      if (!link || !hasTo || link.to === action.to)
        return addInvalidAction(state);
      const withStamp = stampFirstAction(state);
      return {
        ...withStamp,
        graph: {
          ...withStamp.graph,
          links: withStamp.graph.links.map((item) =>
            item.id === action.linkId ? { ...item, to: action.to } : item,
          ),
        },
      };
    }

    default:
      return state;
  }
}
