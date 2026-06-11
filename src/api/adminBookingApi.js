const API_BASE = "http://localhost:4000/api";

async function handleResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || "API request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

const jsonRequest = (url, options = {}) =>
  fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

const plainRequest = (url, options = {}) =>
  fetch(url, {
    credentials: "include",
    ...options,
  });

export async function getExcursionTypes() {
  const response = await plainRequest(`${API_BASE}/excursion-types`);
  return handleResponse(response);
}

export async function createExcursionType(payload) {
  const response = await jsonRequest(`${API_BASE}/excursion-types`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getAdminExcursionSlots(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = search
    ? `${API_BASE}/admin/excursion-slots?${search}`
    : `${API_BASE}/admin/excursion-slots`;

  const response = await plainRequest(url);
  return handleResponse(response);
}

export async function createAdminExcursionSlot(payload) {
  const response = await jsonRequest(`${API_BASE}/admin/excursion-slots`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateAdminExcursionSlot(slotId, payload) {
  const response = await jsonRequest(
    `${API_BASE}/admin/excursion-slots/${slotId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  return handleResponse(response);
}

export async function deleteAdminExcursionSlot(slotId) {
  const response = await plainRequest(
    `${API_BASE}/admin/excursion-slots/${slotId}`,
    {
      method: "DELETE",
    },
  );
  return handleResponse(response);
}

export async function getAdminBookings(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = search
    ? `${API_BASE}/admin/bookings?${search}`
    : `${API_BASE}/admin/bookings`;

  const response = await plainRequest(url);
  return handleResponse(response);
}

export async function updateAdminBooking(bookingId, payload) {
  const response = await jsonRequest(
    `${API_BASE}/admin/bookings/${bookingId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  return handleResponse(response);
}

export async function getAdminBookingDrafts(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = search
    ? `${API_BASE}/admin/booking-drafts?${search}`
    : `${API_BASE}/admin/booking-drafts`;

  const response = await plainRequest(url);
  return handleResponse(response);
}
