import type { AnalyticsEventName } from '@nexa/types';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  timestamp: number;
  payload?: Record<string, string | number | boolean>;
}

export function track(event: AnalyticsEvent): void {
  void event;
}
