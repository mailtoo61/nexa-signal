import { keyValueStorage } from './keyValueStorage';
import type {
  GameSettings,
  PostRunTuningReport,
  SessionSummary,
} from '@nexa/types';
import type { SessionSnapshot } from '@nexa/game-engine';
import {
  MAX_LOCAL_TUNING_REPORTS,
  isPostRunTuningReport,
  sanitizeReportHistory,
  toBoundedReportHistory,
  upsertReportHistory,
} from './reportHistory';
import {
  DEFAULT_TUNING_PROFILE_TAG,
  sanitizeTuningProfileTag,
} from '../dev/tuningProfileTag';
import {
  MAX_SAVED_TUNING_TAGS,
  sanitizeExperimentNote,
  sanitizeExperimentNotesByTag,
  sanitizeSavedTuningTags,
} from '../dev/tuningProfileData';

const STORAGE_VERSION = 1;
const KEYS = {
  anonymousUserId: 'nexa.anonymousUserId',
  settings: 'nexa.settings.v1',
  bestScore: 'nexa.bestScore.v1',
  unlockedThemes: 'nexa.unlockedThemes.v1',
  lastSessionSummary: 'nexa.lastSessionSummary.v1',
  dailyAttemptMetadata: 'nexa.dailyAttemptMetadata.v1',
  lifetimeStats: 'nexa.lifetimeStats.v1',
  tutorialSeen: 'nexa.tutorialSeen.v1',
  specialHintsSeen: 'nexa.specialHintsSeen.v1',
  lastPostRunTuningReport: 'nexa.lastPostRunTuningReport.v1',
  postRunTuningReportHistory: 'nexa.postRunTuningReportHistory.v1',
  currentTuningProfileTag: 'nexa.currentTuningProfileTag.v1',
  savedTuningProfileTags: 'nexa.savedTuningProfileTags.v1',
  experimentNotesByTag: 'nexa.experimentNotesByTag.v1',
  resumableSessionSnapshot: 'nexa.resumableSessionSnapshot.v1',
};

export interface DailyAttemptMetadata {
  day: string;
  attempts: number;
}

export interface LifetimeStats {
  totalSessionsPlayed: number;
  totalNodesStabilized: number;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  selectedLanguage: 'en',
  reducedMotionEnabled: false,
  hapticsEnabled: true,
  audioEnabled: true,
};

export async function getOrCreateAnonymousUserId(
  createId: () => string,
): Promise<string> {
  const existing = await keyValueStorage.getItem(KEYS.anonymousUserId);
  if (existing) return existing;
  const next = createId();
  await keyValueStorage.setItem(KEYS.anonymousUserId, next);
  return next;
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  await keyValueStorage.setItem(
    KEYS.settings,
    JSON.stringify({ version: STORAGE_VERSION, settings }),
  );
}

export async function loadSettings(): Promise<GameSettings> {
  const raw = await keyValueStorage.getItem(KEYS.settings);
  if (!raw) return DEFAULT_GAME_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as {
      settings?: Partial<GameSettings> & {
        locale?: string;
        reducedMotion?: boolean;
      };
    };
    const fromStorage = parsed.settings ?? {};
    const selectedLanguage =
      fromStorage.selectedLanguage ??
      (fromStorage.locale as GameSettings['selectedLanguage'] | undefined) ??
      DEFAULT_GAME_SETTINGS.selectedLanguage;
    const reducedMotionEnabled =
      fromStorage.reducedMotionEnabled ??
      fromStorage.reducedMotion ??
      DEFAULT_GAME_SETTINGS.reducedMotionEnabled;
    return {
      selectedLanguage:
        selectedLanguage === 'en' ||
        selectedLanguage === 'tr' ||
        selectedLanguage === 'de' ||
        selectedLanguage === 'es' ||
        selectedLanguage === 'ja' ||
        selectedLanguage === 'pt-BR'
          ? selectedLanguage
          : DEFAULT_GAME_SETTINGS.selectedLanguage,
      reducedMotionEnabled:
        typeof reducedMotionEnabled === 'boolean'
          ? reducedMotionEnabled
          : DEFAULT_GAME_SETTINGS.reducedMotionEnabled,
      audioEnabled:
        typeof fromStorage.audioEnabled === 'boolean'
          ? fromStorage.audioEnabled
          : DEFAULT_GAME_SETTINGS.audioEnabled,
      hapticsEnabled:
        typeof fromStorage.hapticsEnabled === 'boolean'
          ? fromStorage.hapticsEnabled
          : DEFAULT_GAME_SETTINGS.hapticsEnabled,
    };
  } catch {
    return DEFAULT_GAME_SETTINGS;
  }
}

export async function saveLastSummary(summary: SessionSummary): Promise<void> {
  await keyValueStorage.setItem(
    KEYS.lastSessionSummary,
    JSON.stringify({ version: STORAGE_VERSION, summary }),
  );
}

export async function saveBestScore(bestScore: number): Promise<void> {
  await keyValueStorage.setItem(
    KEYS.bestScore,
    JSON.stringify({ version: STORAGE_VERSION, bestScore }),
  );
}

export async function loadBestScore(): Promise<number> {
  const raw = await keyValueStorage.getItem(KEYS.bestScore);
  if (!raw) return 0;
  const parsed = JSON.parse(raw) as { bestScore?: number };
  return parsed.bestScore ?? 0;
}

export async function loadLifetimeStats(): Promise<LifetimeStats> {
  const raw = await keyValueStorage.getItem(KEYS.lifetimeStats);
  if (!raw) return { totalSessionsPlayed: 0, totalNodesStabilized: 0 };
  const parsed = JSON.parse(raw) as { stats?: LifetimeStats };
  return (
    parsed.stats ?? {
      totalSessionsPlayed: 0,
      totalNodesStabilized: 0,
    }
  );
}

export async function saveLifetimeStats(stats: LifetimeStats): Promise<void> {
  await keyValueStorage.setItem(
    KEYS.lifetimeStats,
    JSON.stringify({ version: STORAGE_VERSION, stats }),
  );
}

export async function loadTutorialSeen(): Promise<boolean> {
  const raw = await keyValueStorage.getItem(KEYS.tutorialSeen);
  return raw === '1';
}

export async function saveTutorialSeen(seen: boolean): Promise<void> {
  await keyValueStorage.setItem(KEYS.tutorialSeen, seen ? '1' : '0');
}

export async function loadSpecialHintsSeen(): Promise<string[]> {
  const raw = await keyValueStorage.getItem(KEYS.specialHintsSeen);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as { hints?: string[] };
  return parsed.hints ?? [];
}

export async function saveSpecialHintsSeen(hints: string[]): Promise<void> {
  await keyValueStorage.setItem(
    KEYS.specialHintsSeen,
    JSON.stringify({ version: STORAGE_VERSION, hints }),
  );
}

export async function saveLastPostRunTuningReport(
  report: PostRunTuningReport,
): Promise<void> {
  await keyValueStorage.setItem(
    KEYS.lastPostRunTuningReport,
    JSON.stringify({ version: STORAGE_VERSION, report }),
  );
}

export async function saveCurrentTuningProfileTag(tag: string): Promise<void> {
  const sanitized = sanitizeTuningProfileTag(tag);
  await keyValueStorage.setItem(KEYS.currentTuningProfileTag, sanitized);
}

export async function loadCurrentTuningProfileTag(): Promise<string> {
  const raw = await keyValueStorage.getItem(KEYS.currentTuningProfileTag);
  if (!raw) return DEFAULT_TUNING_PROFILE_TAG;
  return sanitizeTuningProfileTag(raw);
}

export async function loadSavedTuningProfileTags(): Promise<string[]> {
  const raw = await keyValueStorage.getItem(KEYS.savedTuningProfileTags);
  if (!raw) return [DEFAULT_TUNING_PROFILE_TAG];
  const parsed = JSON.parse(raw) as { tags?: unknown[] };
  return sanitizeSavedTuningTags(parsed.tags ?? []);
}

export async function saveSavedTuningProfileTags(
  tags: string[],
): Promise<void> {
  const sanitized = sanitizeSavedTuningTags(tags).slice(
    0,
    MAX_SAVED_TUNING_TAGS,
  );
  await keyValueStorage.setItem(
    KEYS.savedTuningProfileTags,
    JSON.stringify({ version: STORAGE_VERSION, tags: sanitized }),
  );
}

export async function loadExperimentNotesByTag(): Promise<
  Record<string, string>
> {
  const raw = await keyValueStorage.getItem(KEYS.experimentNotesByTag);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as { notes?: unknown };
  return sanitizeExperimentNotesByTag(parsed.notes);
}

export async function saveExperimentNoteByTag(
  tag: string,
  note: string,
): Promise<Record<string, string>> {
  const current = await loadExperimentNotesByTag();
  const sanitizedTag = sanitizeTuningProfileTag(tag);
  const sanitizedNote = sanitizeExperimentNote(note);
  const next = { ...current };
  if (!sanitizedNote) {
    delete next[sanitizedTag];
  } else {
    next[sanitizedTag] = sanitizedNote;
  }
  await keyValueStorage.setItem(
    KEYS.experimentNotesByTag,
    JSON.stringify({ version: STORAGE_VERSION, notes: next }),
  );
  return next;
}

export async function savePostRunTuningReport(
  report: PostRunTuningReport,
): Promise<void> {
  await saveLastPostRunTuningReport(report);
  const existing = await loadPostRunTuningReportHistory();
  const nextHistory = upsertReportHistory(existing, report);
  await keyValueStorage.setItem(
    KEYS.postRunTuningReportHistory,
    JSON.stringify({ version: STORAGE_VERSION, reports: nextHistory }),
  );
}

export async function loadLastPostRunTuningReport(): Promise<PostRunTuningReport | null> {
  const raw = await keyValueStorage.getItem(KEYS.lastPostRunTuningReport);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { report?: unknown };
  if (!isPostRunTuningReport(parsed.report)) return null;
  return parsed.report;
}

export async function loadPostRunTuningReportHistory(): Promise<
  PostRunTuningReport[]
> {
  const raw = await keyValueStorage.getItem(KEYS.postRunTuningReportHistory);
  if (!raw) {
    const last = await loadLastPostRunTuningReport();
    return last ? [last] : [];
  }
  const parsed = JSON.parse(raw) as { reports?: unknown[] };
  return sanitizeReportHistory(parsed.reports ?? []);
}

export async function clearPostRunTuningReportHistory(): Promise<void> {
  await keyValueStorage.deleteItem(KEYS.postRunTuningReportHistory);
  await keyValueStorage.deleteItem(KEYS.lastPostRunTuningReport);
}

export async function exportLastPostRunTuningReportJson(): Promise<
  string | null
> {
  const report = await loadLastPostRunTuningReport();
  if (!report) return null;
  return JSON.stringify(report, null, 2);
}

export async function exportAllPostRunTuningReportsJson(): Promise<string> {
  const reports = await loadPostRunTuningReportHistory();
  return JSON.stringify(reports, null, 2);
}

export async function saveResumableSessionSnapshot(
  snapshot: SessionSnapshot,
): Promise<void> {
  await keyValueStorage.setItem(
    KEYS.resumableSessionSnapshot,
    JSON.stringify({ version: STORAGE_VERSION, snapshot }),
  );
}

export async function loadResumableSessionSnapshot(): Promise<unknown | null> {
  const raw = await keyValueStorage.getItem(KEYS.resumableSessionSnapshot);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { snapshot?: unknown };
  return parsed.snapshot ?? null;
}

export async function clearResumableSessionSnapshot(): Promise<void> {
  await keyValueStorage.deleteItem(KEYS.resumableSessionSnapshot);
}

export interface ResetLocalProgressOptions {
  includeSettings: boolean;
}

export async function resetLocalProgress(
  options: ResetLocalProgressOptions,
): Promise<void> {
  await Promise.all([
    keyValueStorage.deleteItem(KEYS.bestScore),
    keyValueStorage.deleteItem(KEYS.lastSessionSummary),
    keyValueStorage.deleteItem(KEYS.dailyAttemptMetadata),
    keyValueStorage.deleteItem(KEYS.lifetimeStats),
    keyValueStorage.deleteItem(KEYS.tutorialSeen),
    keyValueStorage.deleteItem(KEYS.specialHintsSeen),
    keyValueStorage.deleteItem(KEYS.resumableSessionSnapshot),
    keyValueStorage.deleteItem(KEYS.lastPostRunTuningReport),
    keyValueStorage.deleteItem(KEYS.postRunTuningReportHistory),
    keyValueStorage.deleteItem(KEYS.currentTuningProfileTag),
    keyValueStorage.deleteItem(KEYS.savedTuningProfileTags),
    keyValueStorage.deleteItem(KEYS.experimentNotesByTag),
  ]);
  if (options.includeSettings) {
    await keyValueStorage.deleteItem(KEYS.settings);
  }
}
