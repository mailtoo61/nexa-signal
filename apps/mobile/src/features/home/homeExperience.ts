import type { SessionState } from '@nexa/game-engine';

export interface HomeExperienceInput {
  totalSessionsPlayed: number;
  hasTutorialSeen: boolean;
  session: SessionState | null;
  hasResumableSnapshot: boolean;
}

export interface HomeExperienceState {
  shouldShowContinueCta: boolean;
  showIntroHeadline: boolean;
  showContinueHint: boolean;
}

export function getHomeExperienceState(
  input: HomeExperienceInput,
): HomeExperienceState {
  const hasInProgressSession = Boolean(
    input.session && !input.session.collapsed,
  );
  const hasResumable = input.hasResumableSnapshot;
  const hasHistory = input.totalSessionsPlayed > 0 || input.hasTutorialSeen;
  return {
    shouldShowContinueCta: hasInProgressSession || hasHistory || hasResumable,
    showIntroHeadline: !hasHistory,
    showContinueHint: hasHistory || hasResumable,
  };
}
