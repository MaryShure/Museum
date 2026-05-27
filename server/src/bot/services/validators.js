export function isValidName(value) {
  return typeof value === "string" && value.trim().length >= 2;
}

export function normalizePhone(value) {
  return String(value || "")
    .replace(/[^\d+]/g, "")
    .trim();
}

export function isValidPhone(value) {
  const normalized = normalizePhone(value);
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 10;
}

export function normalizeComment(value) {
  const text = String(value || "").trim();
  if (!text || text === "-") return "";
  return text;
}
