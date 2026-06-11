const API_BASE = "http://localhost:4000/api";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export async function login(payload) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function logout() {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getMe() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });

  return handleResponse(response);
}
