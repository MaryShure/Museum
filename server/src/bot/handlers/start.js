import { Markup } from "telegraf";
import { getBookingDraft } from "../services/api.js";
import {
  getDraftSummaryMessage,
  getWelcomeWithoutTokenMessage,
} from "../services/messages.js";
import { ensureSession, resetSession, STEPS } from "../utils/session.js";

export function registerStartHandler(bot) {
  bot.start(async (ctx) => {
    const payload = ctx.message.text.split(" ").slice(1).join(" ").trim();

    if (!payload) {
      resetSession(ctx);
      await ctx.reply(getWelcomeWithoutTokenMessage());
      return;
    }

    try {
      const draft = await getBookingDraft(payload);
      const session = ensureSession(ctx);

      session.bookingDraft = draft;
      session.customerName = "";
      session.customerPhone = "";
      session.comment = "";
      session.step = STEPS.AWAITING_START_CONFIRMATION;

      await ctx.reply(
        getDraftSummaryMessage(draft),
        Markup.inlineKeyboard([
          [Markup.button.callback("Продолжить", "booking_continue")],
          [Markup.button.callback("Отмена", "booking_cancel")],
        ]),
      );
    } catch (error) {
      resetSession(ctx);
      await ctx.reply(error.message || "Не удалось открыть бронирование.");
    }
  });
}
