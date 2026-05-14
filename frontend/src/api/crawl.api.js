const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6700/api";
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

export async function crawlX(url) {
  const response = await fetch(`${API_BASE_URL}/crawl/x`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ADMIN_API_KEY,
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Crawl failed");
  }

  return data;
}
