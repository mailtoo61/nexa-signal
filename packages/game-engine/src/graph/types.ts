import type { NodeType } from '../nodes/types';

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  health: number;
  overload: number;
  stabilized: boolean;
}
export interface Link {
  id: string;
  from: string;
  to: string;
  health: number;
  broken: boolean;
}
export interface NetworkGraph {
  nodes: Node[];
  links: Link[];
}
