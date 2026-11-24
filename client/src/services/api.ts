// API service for dashboard data
// Uses Vite proxy to /api routes on the server

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Types matching server analytics responses
export interface AnalyticsSummary {
  totalRequests: number;
  successRate: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgLatencyMs: number;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
  avgTtfbMs: number | null;
  requestTypeCounts: { chat: number; embedding: number };
  estimatedCostSavings: number;
  pinnedRequests: number;
  pinHonoredRequests: number;
  firstRequestAt: string | null;
  lifetimeTotalRequests: number;
}

export interface ByPlatformItem {
  platform: string;
  providerId: string;
  endpoint: string;
  requests: number;
  successRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number | null;
  avgTtfbMs: number | null;
  errorCount: number;
  avgTokensPerSecond: number | null;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export interface ByModelItem {
  platform: string;
  providerId: string;
  endpoint: string;
  modelId: string;
  displayName: string;
  requests: number;
  successRate: number;
  avgLatencyMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  pinnedRequests: number;
  estimatedCost: number;
}

export interface TimelineItem {
  timestamp: string;
  requests: number;
  successCount: number;
  failureCount: number;
  inputTokens: number;
  outputTokens: number;
}

export interface ErrorDistribution {
  byCategory: Array<{ category: string; count: number }>;
  byPlatform: Array<{ platform: string; providerId: string; endpoint: string; count: number }>;
  detailed: Array<{ platform: string; modelId: string; errorCategory: string; count: number }>;
}

export interface RecentError {
  id: number;
  platform: string;
  providerId: string;
  endpoint: string;
  modelId: string;
  error: string;
  latencyMs: number | null;
  createdAt: string;
  keyLabel: string | null;
  attemptCount: number;
}

export interface RecentRequest {
  id: number;
  platform: string;
  modelId: string;
  requestedModel: string | null;
  requestType: string;
  status: 'success' | 'error' | 'canceled';
  inputTokens: number;
  outputTokens: number;
  latencyMs: number | null;
  error: string | null;
  clientIp: string | null;
  clientUserAgent: string | null;
  clientAgent: string | null;
  createdAt: string;
  keyLabel: string | null;
  attemptCount: number;
}

export interface SearchAnalytics {
  searches: number;
  successRate: number;
  avgLatencyMs: number;
  byProvider: Array<{ provider: string; searches: number; successRate: number; avgLatencyMs: number }>;
}

export type CompareMode = 'savings' | 'latency' | 'requests' | 'success';

// Flat per-metric compare result returned by /api/analytics/compare.
// current/previous are the metric values themselves (e.g. total requests, success rate),
// not nested objects — one call per metric mode.
export interface CompareResult {
  current: number;
  previous: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  context?: {
    currentTotalRequests: number;
    previousTotalRequests: number;
    currentEstimatedCostSavings: number;
    previousEstimatedCostSavings: number;
    currentAvgLatencyMs: number;
    previousAvgLatencyMs: number;
    currentSuccessCount: number;
    previousSuccessCount: number;
  };
}

// Dashboard API functions
export async function getAnalyticsSummary(range: string = '7d'): Promise<AnalyticsSummary> {
  return fetchJson<AnalyticsSummary>(`/analytics/summary?range=${range}`);
}

export async function getAnalyticsCompare(
  range: string = '7d',
  mode: CompareMode = 'requests',
): Promise<CompareResult> {
  return fetchJson<CompareResult>(`/api/analytics/compare?range=${range}&mode=${mode}`);
}

export async function getByPlatform(range: string = '7d'): Promise<ByPlatformItem[]> {
  return fetchJson<ByPlatformItem[]>(`/analytics/by-platform?range=${range}`);
}

export async function getByModel(range: string = '7d'): Promise<ByModelItem[]> {
  return fetchJson<ByModelItem[]>(`/analytics/by-model?range=${range}`);
}

export async function getTimeline(range: string = '7d', interval: 'hour' | 'day' = 'day'): Promise<TimelineItem[]> {
  return fetchJson<TimelineItem[]>(`/analytics/timeline?range=${range}&interval=${interval}`);
}

export async function getErrorDistribution(range: string = '7d'): Promise<ErrorDistribution> {
  return fetchJson<ErrorDistribution>(`/analytics/error-distribution?range=${range}`);
}

export async function getRecentErrors(range: string = '7d', limit: number = 10): Promise<RecentError[]> {
  return fetchJson<RecentError[]>(`/analytics/errors?range=${range}&limit=${limit}`);
}

export async function getRecentRequests(range: string = '7d', limit: number = 20): Promise<{ total: number; rows: RecentRequest[] }> {
  return fetchJson<{ total: number; rows: RecentRequest[] }>(`/analytics/requests?range=${range}&limit=${limit}`);
}

export async function getSearchAnalytics(range: string = '7d'): Promise<SearchAnalytics> {
  return fetchJson<SearchAnalytics>(`/analytics/search?range=${range}`);
}

// Health check
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return fetchJson<{ status: string; timestamp: string }>(`${API_BASE}/health`);
}