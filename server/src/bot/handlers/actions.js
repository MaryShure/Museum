import { Markup } from "telegraf";
import { createBooking } from "../services/api.js";
import {
  getAskNameMessage,
  getCancelledMessage,
  getSuccessMessage,
  getUnknownStateMessage,
} from "../services/messages.js";
import { ensureSession, resetSession, STEPS } from "../utils/session.js";

export function registerActionHandler(bot) {
  bot.action("booking_continue", async (ctx) => {
    const session = ensureSession(ctx);

    if (!session.bookingDraft) {
      await ctx.answerCbQuery();
      await ctx.reply(getUnknownStateMessage());
      return;
    }

    session.step = STEPS.AWAITING_NAME;

    await ctx.answerCbQuery();
    await ctx.reply(getAskNameMessage());
  });

  bot.action("booking_cancel", async (ctx) => {
    resetSession(ctx);
    await ctx.answerCbQuery("Отменено");
    await ctx.reply(getCancelledMessage());
  });

  bot.action("booking_confirm", async (ctx) => {
    const session = ensureSession(ctx);

    if (
      !session.bookingDraft ||
      !session.customerName ||
      !session.customerPhone
    ) {
      await ctx.answerCbQuery();
      await ctx.reply(getUnknownStateMessage());
      return;
    }

    try {
      const result = await createBooking({
        public_token: session.bookingDraft.public_token,
        telegram_user_id: ctx.from?.id ?? null,
        customer_name: session.customerName,
        customer_phone: session.customerPhone,
        comment: session.comment || "",
      });

      await ctx.answerCbQuery("Бронь создана");
      await ctx.reply(getSuccessMessage(result));
      resetSession(ctx);
    } catch (error) {
      await ctx.answerCbQuery();
      await ctx.reply(error.message || "Не удалось подтвердить бронь.");
    }
  });

  bot.action("booking_restart", async (ctx) => {
    const session = ensureSession(ctx);

    if (!session.bookingDraft) {
      resetSession(ctx);
      await ctx.answerCbQuery();
      await ctx.reply(getUnknownStateMessage());
      return;
    }

    session.customerName = "";
    session.customerPhone = "";
    session.comment = "";
    session.step = STEPS.AWAITING_NAME;

    await ctx.answerCbQuery("Начинаем заново");
    await ctx.reply(getAskNameMessage());
  });
}
