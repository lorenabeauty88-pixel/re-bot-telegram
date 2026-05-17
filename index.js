const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log("BOT ONLINE TESTE");

bot.on("message", (msg) => {
  console.log("RECEBI:", msg.text);

  bot.sendMessage(
    msg.chat.id,
    "🔥 FUNCIONANDO 100% - RECEBI SUA MENSAGEM"
  );
});
