import { request } from "./httpClient";

export function listSources() {
  return request("/sources");
}

export function createSource(payload) {
  return request("/sources", {
    method: "POST",
    admin: true,
    body: payload,
  });
}

export function updateSource(id, payload) {
  return request(`/sources/${id}`, {
    method: "PATCH",
    admin: true,
    body: payload,
  });
}

export function deleteSource(id) {
  return request(`/sources/${id}`, {
    method: "DELETE",
    admin: true,
  });
}

export function runSourceNow(id) {
  return request(`/sources/${id}/run`, {
    method: "POST",
    admin: true,
  });
}
