import type { PresentationSnapshot } from '../bridge/presentationBridge';

export interface PositionedNode {
  id: string;
  type: 'core' | 'relay' | 'amplifier' | 'stabilizer' | 'decayer';
  x: number;
  y: number;
  health: number;
  overload: number;
  stabilized: boolean;
}

export function layoutNodes(
  snapshot: PresentationSnapshot,
  width: number,
  height: number,
): PositionedNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const ring = Math.min(width, height) * 0.3;
  const count = Math.max(1, snapshot.nodes.length);

  return snapshot.nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const fallbackX = cx + Math.cos(angle) * ring;
    const fallbackY = cy + Math.sin(angle) * ring;
    return {
      ...node,
      x:
        typeof (node as { position?: { x: number } }).position?.x === 'number'
          ? (node as { position: { x: number } }).position.x * width
          : fallbackX,
      y:
        typeof (node as { position?: { y: number } }).position?.y === 'number'
          ? (node as { position: { y: number } }).position.y * height
          : fallbackY,
    };
  });
}

export function findNodePosition(
  nodes: PositionedNode[],
  id: string,
): PositionedNode | null {
  return nodes.find((node) => node.id === id) ?? null;
}
