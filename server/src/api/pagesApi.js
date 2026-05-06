const API_BASE = "http://localhost:4000/api";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export async function getPages() {
  const response = await fetch(`${API_BASE}/pages`);
  return handleResponse(response);
}

export async function getPageBySlug(slug) {
  const response = await fetch(`${API_BASE}/pages/${slug}`);
  return handleResponse(response);
}

export async function createPage(payload) {
  const response = await fetch(`${API_BASE}/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deletePage(id) {
  const response = await fetch(`${API_BASE}/pages/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

export async function createBlock(payload) {
  const response = await fetch(`${API_BASE}/blocks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateBlock(id, payload) {
  const response = await fetch(`${API_BASE}/blocks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteBlock(id) {
  const response = await fetch(`${API_BASE}/blocks/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}
