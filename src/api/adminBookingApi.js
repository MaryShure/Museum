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

export async function getAdminExcursionSlots(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = search
    ? `${API_BASE}/admin/excursion-slots?${search}`
    : `${API_BASE}/admin/excursion-slots`;

  const response = await fetch(url);
  return handleResponse(response);
}

export async function createAdminExcursionSlot(payload) {
  const response = await fetch(`${API_BASE}/admin/excursion-slots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateAdminExcursionSlot(slotId, payload) {
  const response = await fetch(`${API_BASE}/admin/excursion-slots/${slotId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteAdminExcursionSlot(slotId) {
  const response = await fetch(`${API_BASE}/admin/excursion-slots/${slotId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

export async function getAdminBookings(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = search
    ? `${API_BASE}/admin/bookings?${search}`
    : `${API_BASE}/admin/bookings`;

  const response = await fetch(url);
  return handleResponse(response);
}

export async function updateAdminBooking(bookingId, payload) {
  const response = await fetch(`${API_BASE}/admin/bookings/${bookingId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getAdminBookingDrafts(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = search
    ? `${API_BASE}/admin/booking-drafts?${search}`
    : `${API_BASE}/admin/booking-drafts`;

  const response = await fetch(url);
  return handleResponse(response);
}
