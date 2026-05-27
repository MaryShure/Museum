const API_BASE = "http://localhost:4000/api";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export async function getExcursionTypes() {
  const response = await fetch(`${API_BASE}/excursion-types`);
  return handleResponse(response);
}

export async function createExcursionType(payload) {
  const response = await fetch(`${API_BASE}/excursion-types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getExcursionSlots(params) {
  const search = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/excursion-slots?${search}`);
  return handleResponse(response);
}

export async function createBookingDraft(payload) {
  const response = await fetch(`${API_BASE}/booking-drafts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function createManualBooking(payload) {
  const response = await fetch(`${API_BASE}/bookings/manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}
