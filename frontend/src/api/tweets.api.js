import { request } from "./httpClient";

export function listTweets(params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();

  return request(`/tweets${query ? `?${query}` : ""}`);
}

export function importTweets(payload) {
  return request("/tweets/import", {
    method: "POST",
    admin: true,
    body: payload,
  });
}

export function exportTweets() {
  return request("/tweets/export", {
    admin: true,
  });
}

export function deleteTweet(id) {
  return request(`/tweets/${id}`, {
    method: "DELETE",
    admin: true,
  });
}

export function deleteTweets(ids) {
  return request("/tweets/delete-many", {
    method: "POST",
    admin: true,
    body: { ids },
  });
}

export function deleteAllTweets(filters = {}) {
  return request("/tweets/delete-all", {
    method: "POST",
    admin: true,
    body: filters,
  });
}
