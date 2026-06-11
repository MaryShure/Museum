const API_BASE = "http://localhost:4000/api";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export async function getPages() {
  const response = await fetch(`${API_BASE}/pages`, { credentials: "include" });
  return handleResponse(response);
}

export async function getPageBySlug(slug) {
  const response = await fetch(`${API_BASE}/pages/${slug}`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function createPage(payload) {
  const response = await fetch(`${API_BASE}/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  return handleResponse(response);
}

export async function updatePage(id, payload) {
  const response = await fetch(`${API_BASE}/pages/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  return handleResponse(response);
}

export async function deletePage(id) {
  const response = await fetch(`${API_BASE}/pages/${id}`, {
    method: "DELETE",
    credentials: "include",
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
    credentials: "include",
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
    credentials: "include",
  });

  return handleResponse(response);
}

export async function deleteBlock(id) {
  const response = await fetch(`${API_BASE}/blocks/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getCardsGridItems(blockId) {
  const response = await fetch(`${API_BASE}/blocks/${blockId}/items`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function createCardsGridItem(blockId, payload) {
  const response = await fetch(`${API_BASE}/blocks/${blockId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  return handleResponse(response);
}

export async function updateCardsGridItem(blockId, itemId, payload) {
  const response = await fetch(
    `${API_BASE}/blocks/${blockId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    },
  );

  return handleResponse(response);
}

export async function deleteCardsGridItem(blockId, itemId) {
  const response = await fetch(
    `${API_BASE}/blocks/${blockId}/items/${itemId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  return handleResponse(response);
}
