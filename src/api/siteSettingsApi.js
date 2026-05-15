const API_BASE = "http://localhost:4000/api";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export async function getSiteSettings() {
  const response = await fetch(`${API_BASE}/site-settings`);
  return handleResponse(response);
}

export async function updateSiteSettings(payload) {
  const response = await fetch(`${API_BASE}/site-settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}
