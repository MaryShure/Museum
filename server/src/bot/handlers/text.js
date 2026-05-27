import { Markup } from "telegraf";
import {
  getAskCommentMessage,
  getAskPhoneMessage,
  getFinalConfirmationMessage,
  getUnknownStateMessage,
} from "../services/messages.js";
import {
  isValidName,
  isValidPhone,
  normalizeComment,
  normalizePhone,
} from "../services/validators.js";
import { ensureSession, STEPS } from "../utils/session.js";

export function registerTextHandler(bot) {
  bot.on("text", async (ctx) => {
    const session = ensureSession(ctx);
    const text = ctx.message.text.trim();

    if (text === "/cancel") {
      return;
    }

    if (session.step === STEPS.AWAITING_NAME) {
      if (!isValidName(text)) {
        await ctx.reply("Пожалуйста, отправьте корректное имя.");
        return;
      }

      session.customerName = text;
      session.step = STEPS.AWAITING_PHONE;

      await ctx.reply(getAskPhoneMessage(text));
      return;
    }

    if (session.step === STEPS.AWAITING_PHONE) {
      if (!isValidPhone(text)) {
        await ctx.reply(
          "Пожалуйста, отправьте корректный номер телефона в формате +375... или с кодом оператора.",
        );
        return;
      }

      session.customerPhone = normalizePhone(text);
      session.step = STEPS.AWAITING_COMMENT;

      await ctx.reply(getAskCommentMessage());
      return;
    }

    if (session.step === STEPS.AWAITING_COMMENT) {
      session.comment = normalizeComment(text);
      session.step = STEPS.AWAITING_FINAL_CONFIRMATION;

      await ctx.reply(
        getFinalConfirmationMessage(session),
        Markup.inlineKeyboard([
          [Markup.button.callback("Подтвердить бронь", "booking_confirm")],
          [Markup.button.callback("Начать заново", "booking_restart")],
          [Markup.button.callback("Отмена", "booking_cancel")],
        ]),
      );
      return;
    }

    await ctx.reply(getUnknownStateMessage());
  });
}
