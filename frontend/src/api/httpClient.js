const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6700/api";
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function getErrorMessage(data, fallback) {
  return data?.message || fallback;
}

export async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    admin = false,
    headers = {},
  } = options;

  const requestHeaders = {
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (admin) {
    requestHeaders["x-api-key"] = ADMIN_API_KEY;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }

  return data;
}
