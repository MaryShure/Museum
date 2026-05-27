const API_BASE = process.env.API_BASE;

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

export async function getBookingDraft(token) {
  const response = await fetch(`${API_BASE}/api/booking-drafts/${token}`);
  return handleResponse(response);
}

export async function createBooking(payload) {
  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}
