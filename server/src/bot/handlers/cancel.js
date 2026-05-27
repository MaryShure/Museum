import { resetSession } from "../utils/session.js";
import { getCancelledMessage } from "../services/messages.js";

export function registerCancelHandler(bot) {
  bot.command("cancel", async (ctx) => {
    resetSession(ctx);
    await ctx.reply(getCancelledMessage());
  });
}
