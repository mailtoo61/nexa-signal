import { useMemo } from 'react';
import type { SessionSummary } from '@nexa/types';

export function useSessionSummary(summary: SessionSummary | null) {
  return useMemo(() => {
    if (!summary) return null;
    return {
      ...summary,
      survivalLabel: `${summary.survivalSeconds}s`,
    };
  }, [summary]);
}
