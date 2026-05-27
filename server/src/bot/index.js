import "dotenv/config";
import { Telegraf, session } from "telegraf";

import { registerStartHandler } from "./handlers/start.js";
import { registerTextHandler } from "./handlers/text.js";
import { registerActionHandler } from "./handlers/actions.js";
import { registerCancelHandler } from "./handlers/cancel.js";
import { createEmptySession } from "./utils/session.js";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

if (!process.env.API_BASE) {
  throw new Error("API_BASE is not set");
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(
  session({
    defaultSession: () => createEmptySession(),
  }),
);

registerStartHandler(bot);
registerActionHandler(bot);
registerTextHandler(bot);
registerCancelHandler(bot);

bot.catch(async (error, ctx) => {
  console.error("Bot error:", error);

  try {
    await ctx.reply(
      "Произошла ошибка. Попробуйте начать заново через сайт или командой /cancel.",
    );
  } catch (replyError) {
    console.error("Failed to send bot error message:", replyError);
  }
});

bot.launch();
console.log("Telegram bot started");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
