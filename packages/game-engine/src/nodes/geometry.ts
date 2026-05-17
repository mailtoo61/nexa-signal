import type { Node } from '../graph/types';

export function nodeDistance(a: Node, b: Node): number {
  return Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);
}
