export const engineTuning = {
  version: 'v1.1.0',
  tickMs: 500,
  thresholds: {
    overloadWarning: 45,
    overloadCritical: 80,
    collapseWarning: 40,
    collapseCritical: 20,
  },
  actions: {
    stabilizeStrength: 24,
    repairStrength: 22,
  },
  links: {
    maxHealth: 100,
    decayMin: 1,
    decayMax: 3,
  },
  connect: {
    maxConnectDistance: 0.46,
    maxNodeDegree: 5,
    connectionSignalCost: 4,
    minimumSignalRequired: 12,
  },
  nodeTypes: {
    nodeTypeSpawnWeights: {
      relay: 0.35,
      amplifier: 0.22,
      stabilizer: 0.28,
      decayer: 0.15,
    },
    relayRangeBonus: 0.09,
    amplifierSignalBonus: 6,
    amplifierOverloadPenalty: 2,
    stabilizerRadius: 0.3,
    stabilizerInstabilityReduction: 2,
    decayerRadius: 0.28,
    decayerLinkDamageRate: 1,
    maxSpecialNodesEarlySession: 2,
    specialNodeUnlockTiming: 40,
  },
  instability: {
    earlyTicks: 40,
    midTicks: 120,
    earlyScale: 0.55,
    midScale: 0.85,
    lateScale: 1.2,
  },
  intro: {
    earlyInstabilityMultiplier: 0.62,
    earlyAmplifierPenaltyMultiplier: 0.38,
    earlyDecayerDamageMultiplier: 0.24,
    earlyDurationTicks: 120,
    warningThresholdBoost: 12,
  },
  scoring: {
    basePerTick: 10,
    minPerTick: 1,
    stabilizedBonus: 15,
    healthyLinkBonus: 5,
    tickBonus: 2,
    survivalSecondBonus: 1,
    criticalSaveBonus: 20,
    connectionCreatedBonus: 8,
  },
} as const;

export function instabilityScale(tick: number): number {
  if (tick < engineTuning.instability.earlyTicks) {
    return engineTuning.instability.earlyScale;
  }
  if (tick < engineTuning.instability.midTicks) {
    return engineTuning.instability.midScale;
  }
  return engineTuning.instability.lateScale;
}
