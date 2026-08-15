import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type { EventLevel, EventLog, EventPageMeta } from "@/types";

export type EventFilters = {
  level?: EventLevel;
  environment?: string;
  service?: string;
  date?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type EventPage = {
  events: EventLog[];
  pagination: EventPageMeta;
};

export function listEvents(
  filters: EventFilters = {},
  signal?: AbortSignal,
): Promise<EventPage> {
  const params = new URLSearchParams();
  if (filters.level) params.set("level", filters.level);
  if (filters.environment) params.set("environment", filters.environment);
  if (filters.service) params.set("service", filters.service);
  if (filters.date) params.set("date", filters.date);
  if (filters.search) params.set("search", filters.search);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.pageSize !== undefined) {
    params.set("page_size", String(filters.pageSize));
  }
  const query = params.toString();
  return api<EventPage>(
    `${API_ROUTES.events}${query ? `?${query}` : ""}`,
    { signal },
  );
}