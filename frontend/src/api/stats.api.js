import { request } from "./httpClient";

export function getStatsOverview() {
  return request("/stats/overview");
}
