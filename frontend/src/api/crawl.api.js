import { request } from "./httpClient";

export function crawlX(url) {
  return request("/crawl/x", {
    method: "POST",
    admin: true,
    body: { url },
  });
}
