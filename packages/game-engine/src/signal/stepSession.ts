import { engineTuning, instabilityScale } from '../config/tuning';
import { nodeDistance } from '../nodes/geometry';
import { createRng } from '../rng/index';
import type { SessionState } from '../session/types';

function introFactor(state: SessionState): number {
  if (state.profile !== 'intro') return 1;
  if (state.tick >= engineTuning.intro.earlyDurationTicks) return 1;
  return engineTuning.intro.earlyInstabilityMultiplier;
}

export function stepSession(prev: SessionState): SessionState {
  if (prev.collapsed) return prev;
  const rng = createRng(`${prev.seed}:${prev.tick}`);
  const baseScale = instabilityScale(prev.tick);
  const intro = introFactor(prev);
  const scale = baseScale * intro;

  const stabilizers = prev.graph.nodes.filter(
    (node) => node.type === 'stabilizer',
  );
  const decayers = prev.graph.nodes.filter((node) => node.type === 'decayer');

  let stabilizerSaves = 0;
  let amplifierBoosts = 0;
  let decayerDamagePrevented = prev.metrics.decayerDamagePrevented;

  const graph = {
    nodes: prev.graph.nodes.map((node) => {
      let delta = Math.floor(rng.next() * 8 * scale);
      if (node.type === 'amplifier') {
        delta += Math.floor(
          engineTuning.nodeTypes.amplifierOverloadPenalty *
            (prev.profile === 'intro' &&
            prev.tick < engineTuning.intro.earlyDurationTicks
              ? engineTuning.intro.earlyAmplifierPenaltyMultiplier
              : 1),
        );
        amplifierBoosts += 1;
      }

      const nearbyStabilizers = stabilizers.filter(
        (stabilizer) =>
          stabilizer.id !== node.id &&
          nodeDistance(stabilizer, node) <=
            engineTuning.nodeTypes.stabilizerRadius,
      ).length;

      if (nearbyStabilizers > 0) {
        delta = Math.max(
          0,
          delta -
            nearbyStabilizers *
              engineTuning.nodeTypes.stabilizerInstabilityReduction,
        );
        stabilizerSaves += nearbyStabilizers;
      }

      const overload = Math.min(100, node.overload + delta);
      return {
        ...node,
        overload,
        stabilized: false,
        health: Math.max(0, node.health - Math.floor(overload / 42)),
      };
    }),
    links: prev.graph.links.map((link) => {
      const decaySpan =
        engineTuning.links.decayMax - engineTuning.links.decayMin + 1;
      const rawDecay =
        engineTuning.links.decayMin +
        Math.floor(rng.next() * decaySpan * scale);

      const from = prev.graph.nodes.find((node) => node.id === link.from);
      const to = prev.graph.nodes.find((node) => node.id === link.to);
      let decayerExtra = 0;
      if (from && to) {
        for (const decayer of decayers) {
          const nearFrom =
            nodeDistance(decayer, from) <= engineTuning.nodeTypes.decayerRadius;
          const nearTo =
            nodeDistance(decayer, to) <= engineTuning.nodeTypes.decayerRadius;
          if (nearFrom || nearTo) {
            decayerExtra += Math.ceil(
              engineTuning.nodeTypes.decayerLinkDamageRate *
                (prev.profile === 'intro' &&
                prev.tick < engineTuning.intro.earlyDurationTicks
                  ? engineTuning.intro.earlyDecayerDamageMultiplier
                  : 1),
            );
          }
        }
      }

      const nextHealth = Math.max(
        0,
        link.health - Math.max(1, rawDecay) - decayerExtra,
      );
      if (decayerExtra === 0) {
        decayerDamagePrevented += 1;
      }
      return {
        ...link,
        health: nextHealth,
        broken: nextHealth <= 0,
      };
    }),
  };

  const stabilityDrain = graph.nodes.reduce(
    (sum, node) => sum + Math.floor(node.overload / 58),
    0,
  );
  const stability = Math.max(0, prev.stability - stabilityDrain);
  const avgLinkHealth =
    graph.links.reduce((sum, link) => sum + link.health, 0) /
    Math.max(1, graph.links.length);
  const avgOverload =
    graph.nodes.reduce((sum, node) => sum + node.overload, 0) /
    Math.max(1, graph.nodes.length);

  const amplifierCount = graph.nodes.filter(
    (node) => node.type === 'amplifier',
  ).length;
  const signalStrength = Math.max(
    0,
    Math.min(
      100,
      Math.floor(
        avgLinkHealth * 0.62 +
          (100 - avgOverload) * 0.38 +
          amplifierCount * engineTuning.nodeTypes.amplifierSignalBonus,
      ),
    ),
  );

  const collapsed =
    stability <= 0 ||
    graph.nodes.some((node) => node.health <= 0) ||
    graph.nodes.some((node) => node.type === 'core' && node.health <= 20);

  const overloadAny = graph.nodes.some(
    (node) => node.overload >= engineTuning.thresholds.overloadWarning,
  );
  const warningThreshold =
    engineTuning.thresholds.collapseWarning +
    (prev.profile === 'intro' ? engineTuning.intro.warningThresholdBoost : 0);

  const coreRiskEvents =
    prev.metrics.coreRiskEvents +
    (graph.nodes.some((node) => node.type === 'core' && node.overload > 80)
      ? 1
      : 0);

  const score =
    prev.score +
    Math.max(
      engineTuning.scoring.minPerTick,
      engineTuning.scoring.basePerTick - stabilityDrain,
    );

  const riskValue = Math.max(
    0,
    Math.min(100, 100 - (stability + signalStrength) / 2),
  );

  return {
    ...prev,
    tick: prev.tick + 1,
    elapsedMs: prev.elapsedMs + engineTuning.tickMs,
    signalStrength,
    graph,
    stability,
    collapsed,
    score,
    metrics: {
      ...prev.metrics,
      firstOverloadTick:
        prev.metrics.firstOverloadTick === null && overloadAny
          ? prev.tick
          : prev.metrics.firstOverloadTick,
      firstCollapseWarningTick:
        prev.metrics.firstCollapseWarningTick === null &&
        stability <= warningThreshold
          ? prev.tick
          : prev.metrics.firstCollapseWarningTick,
      amplifierBoosts: prev.metrics.amplifierBoosts + amplifierBoosts,
      stabilizerSaves: prev.metrics.stabilizerSaves + stabilizerSaves,
      decayerDamagePrevented,
      coreRiskEvents,
      riskSum: prev.metrics.riskSum + riskValue,
      riskSamples: prev.metrics.riskSamples + 1,
    },
  };
}
