import { request } from "./httpClient";

export function listCrawlRuns(params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();

  return request(`/crawl-runs${query ? `?${query}` : ""}`);
}
