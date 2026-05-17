import { engineTuning } from '../config/tuning';
import type { NodeType } from './types';

export function assignNodeTypes(seedValues: number[]): NodeType[] {
  const types: NodeType[] = ['core'];
  const specialCap = engineTuning.nodeTypes.maxSpecialNodesEarlySession;

  for (let i = 1; i < seedValues.length; i += 1) {
    const value = seedValues[i];
    const specialCount = types.filter((t) => t !== 'core').length;
    if (specialCount >= specialCap) {
      types.push('relay');
      continue;
    }

    const w = engineTuning.nodeTypes.nodeTypeSpawnWeights;
    const relayCut = w.relay;
    const ampCut = relayCut + w.amplifier;
    const stabCut = ampCut + w.stabilizer;

    if (value < relayCut) {
      types.push('relay');
    } else if (value < ampCut) {
      types.push('amplifier');
    } else if (value < stabCut) {
      types.push('stabilizer');
    } else {
      types.push('decayer');
    }
  }

  return types;
}

export function isSpecialNode(type: NodeType): boolean {
  return type !== 'core' && type !== 'relay';
}
