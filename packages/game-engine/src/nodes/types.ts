export type NodeType =
  | 'core'
  | 'relay'
  | 'amplifier'
  | 'stabilizer'
  | 'decayer';

export function nodeTypePriority(type: NodeType): number {
  switch (type) {
    case 'core':
      return 100;
    case 'decayer':
      return 90;
    case 'amplifier':
      return 70;
    case 'stabilizer':
      return 60;
    case 'relay':
      return 50;
    default:
      return 0;
  }
}
