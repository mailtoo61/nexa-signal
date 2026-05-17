import type { PostRunTuningReport } from '@nexa/types';
import {
  DEFAULT_TUNING_PROFILE_TAG,
  sanitizeTuningProfileTag,
} from '../dev/tuningProfileTag';

export const MAX_LOCAL_TUNING_REPORTS = 30;

export function toBoundedReportHistory(
  reports: PostRunTuningReport[],
  maxReports = MAX_LOCAL_TUNING_REPORTS,
): PostRunTuningReport[] {
  return reports.slice(0, maxReports);
}

export function upsertReportHistory(
  existing: PostRunTuningReport[],
  report: PostRunTuningReport,
  maxReports = MAX_LOCAL_TUNING_REPORTS,
): PostRunTuningReport[] {
  return toBoundedReportHistory([report, ...existing], maxReports);
}

export function isPostRunTuningReport(
  value: unknown,
): value is PostRunTuningReport {
  const report = value as Partial<PostRunTuningReport> | null;
  return Boolean(
    report &&
    report.schemaVersion === 1 &&
    typeof report.sessionId === 'string' &&
    typeof report.durationMs === 'number' &&
    typeof report.finalScore === 'number',
  );
}

export function sanitizeReportHistory(
  values: unknown[],
  maxReports = MAX_LOCAL_TUNING_REPORTS,
): PostRunTuningReport[] {
  const reports = values.filter(isPostRunTuningReport).map((report) => ({
    ...report,
    tuningProfileTag: sanitizeTuningProfileTag(
      report.tuningProfileTag ?? DEFAULT_TUNING_PROFILE_TAG,
    ),
  }));
  return toBoundedReportHistory(reports, maxReports);
}
