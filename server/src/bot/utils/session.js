export const STEPS = {
  IDLE: "idle",
  AWAITING_START_CONFIRMATION: "awaiting_start_confirmation",
  AWAITING_NAME: "awaiting_name",
  AWAITING_PHONE: "awaiting_phone",
  AWAITING_COMMENT: "awaiting_comment",
  AWAITING_FINAL_CONFIRMATION: "awaiting_final_confirmation",
};

export function createEmptySession() {
  return {
    step: STEPS.IDLE,
    bookingDraft: null,
    customerName: "",
    customerPhone: "",
    comment: "",
  };
}

export function ensureSession(ctx) {
  if (!ctx.session) {
    ctx.session = createEmptySession();
  }

  if (!ctx.session.step) {
    ctx.session = createEmptySession();
  }

  return ctx.session;
}

export function resetSession(ctx) {
  ctx.session = createEmptySession();
}
