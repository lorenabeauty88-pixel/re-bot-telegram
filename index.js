const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("❌ BOT_TOKEN não encontrado");
  process.exit(1);
}

// 🔥 IMPORTANTE: evita conflito 409
const bot = new TelegramBot(token, {
  polling: {
    interval: 2000,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

console.log("🔥 BOT ESTÁVEL ONLINE");
