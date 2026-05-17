import type { NodeType } from '@nexa/game-engine';

export interface RunTelemetrySnapshot {
  tutorialCompletionMs: number | null;
  recommendationShownCount: number;
  recommendationAcceptedCount: number;
  recommendationAcceptanceRate: number;
  nodeTypeEncounterTiming: Record<string, number>;
  legendOpenedCount: number;
  legendAutoShownCount: number;
  invalidDragReleaseCount: number;
  firstDragConnectMs: number | null;
  firstLegendOpenMs: number | null;
}

interface RecommendationLike {
  actionType: string;
  targetType: 'node' | 'link';
  targetId: string;
}

interface RecommendationToken {
  actionType: RecommendationLike['actionType'];
  targetType: RecommendationLike['targetType'];
  targetId: string | null;
}

export class RunTelemetryAggregator {
  private readonly startTimeMs: number;
  private tutorialCompletionMs: number | null = null;
  private recommendationShownCount = 0;
  private recommendationAcceptedCount = 0;
  private pendingRecommendation: RecommendationToken | null = null;
  private nodeTypeEncounterTiming = new Map<NodeType, number>();
  private legendOpenedCount = 0;
  private legendAutoShownCount = 0;
  private invalidDragReleaseCount = 0;
  private firstDragConnectMs: number | null = null;
  private firstLegendOpenMs: number | null = null;

  constructor(startTimeMs: number) {
    this.startTimeMs = startTimeMs;
  }

  onTutorialCompleted(nowMs: number): void {
    if (this.tutorialCompletionMs === null) {
      this.tutorialCompletionMs = Math.max(0, nowMs - this.startTimeMs);
    }
  }

  onRecommendationShown(recommendation: RecommendationLike | null): void {
    if (!recommendation) {
      return;
    }
    const next: RecommendationToken = {
      actionType: recommendation.actionType,
      targetType: recommendation.targetType,
      targetId: recommendation.targetId,
    };
    if (
      this.pendingRecommendation &&
      this.pendingRecommendation.actionType === next.actionType &&
      this.pendingRecommendation.targetType === next.targetType &&
      this.pendingRecommendation.targetId === next.targetId
    ) {
      return;
    }
    this.pendingRecommendation = next;
    this.recommendationShownCount += 1;
  }

  onActionApplied(actionType: string, targetId: string | null): boolean {
    if (!this.pendingRecommendation) {
      return false;
    }
    const accepted =
      this.pendingRecommendation.actionType === actionType &&
      this.pendingRecommendation.targetId === targetId;
    if (accepted) {
      this.recommendationAcceptedCount += 1;
      this.pendingRecommendation = null;
      return true;
    }
    return false;
  }

  onNodeTypeEncountered(nodeType: NodeType, nowMs: number): void {
    if (nodeType === 'core') return;
    if (this.nodeTypeEncounterTiming.has(nodeType)) return;
    this.nodeTypeEncounterTiming.set(
      nodeType,
      Math.max(0, nowMs - this.startTimeMs),
    );
  }

  onLegendOpened(nowMs: number): void {
    this.legendOpenedCount += 1;
    if (this.firstLegendOpenMs === null) {
      this.firstLegendOpenMs = Math.max(0, nowMs - this.startTimeMs);
    }
  }

  onLegendAutoShown(): void {
    this.legendAutoShownCount += 1;
  }

  onInvalidDragRelease(): void {
    this.invalidDragReleaseCount += 1;
  }

  onFirstDragConnect(nowMs: number): void {
    if (this.firstDragConnectMs === null) {
      this.firstDragConnectMs = Math.max(0, nowMs - this.startTimeMs);
    }
  }

  buildSnapshot(): RunTelemetrySnapshot {
    const encounterObject: Record<string, number> = {};
    for (const [nodeType, ms] of this.nodeTypeEncounterTiming.entries()) {
      encounterObject[nodeType] = ms;
    }
    return {
      tutorialCompletionMs: this.tutorialCompletionMs,
      recommendationShownCount: this.recommendationShownCount,
      recommendationAcceptedCount: this.recommendationAcceptedCount,
      recommendationAcceptanceRate:
        this.recommendationShownCount === 0
          ? 0
          : this.recommendationAcceptedCount / this.recommendationShownCount,
      nodeTypeEncounterTiming: encounterObject,
      legendOpenedCount: this.legendOpenedCount,
      legendAutoShownCount: this.legendAutoShownCount,
      invalidDragReleaseCount: this.invalidDragReleaseCount,
      firstDragConnectMs: this.firstDragConnectMs,
      firstLegendOpenMs: this.firstLegendOpenMs,
    };
  }
}
