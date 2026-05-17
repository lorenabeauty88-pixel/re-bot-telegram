const TelegramBot = require("node-telegram-bot-api");

console.log("🔥 INICIANDO BOT...");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ TOKEN NÃO ENCONTRADO");
  process.exit(1);
}

try {
  const bot = new TelegramBot(token, {
    polling: {
      interval: 1000,
      autoStart: true
    }
  });

  console.log("🤖 BOT CONECTADO COM POLLING");

  bot.on("polling_error", (err) => {
    console.log("❌ POLLING ERROR:", err.message);
  });

  bot.on("message", (msg) => {
    console.log("📩 RECEBIDO:", msg.text);

    bot.sendMessage(msg.chat.id, "🔥 BOT FUNCIONANDO");
  });

} catch (e) {
  console.log("❌ ERRO AO INICIAR BOT:", e.message);
}
