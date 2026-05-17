import type { PresentationSnapshot } from '../bridge/presentationBridge';
import type { ThemeId } from '../themes/themes';

export interface DragPreview {
  fromNodeId: string;
  x: number;
  y: number;
  hoverNodeId: string | null;
}

export interface SignalSceneProps {
  width: number;
  height: number;
  snapshot: PresentationSnapshot;
  themeId: ThemeId;
  reducedMotion: boolean;
  selectedNodeId?: string | null;
  selectedLinkId?: string | null;
  focusedNodeId?: string | null;
  focusedLinkId?: string | null;
  pulseNodeId?: string | null;
  pulseLinkId?: string | null;
  dragPreview?: DragPreview | null;
}
