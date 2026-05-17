const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

console.log("🔥 BOT INICIADO");

// remove webhook antigo (MUITO IMPORTANTE)
bot.deleteWebHook().then(() => {
  console.log("🧹 Webhook removido");
});

// debug mensagens
bot.on("message", (msg) => {
  console.log("📩 CHEGOU MENSAGEM:", msg.text);
});

// start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🌸 Bot funcionando!");
});

// promo
bot.onText(/\/promo (.+)/, async (msg, match) => {
  const query = match[1];

  const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;
  const res = await axios.get(url);

  const item = res.data.results[0];

  if (!item) return bot.sendMessage(msg.chat.id, "Nada encontrado");

  bot.sendMessage(
    msg.chat.id,
    `🔥 ${item.title}\n💰 R$ ${item.price}\n🔗 ${item.permalink}`
  );
});
bot.on("message", (msg) => {
  console.log("📩 CHEGOU MENSAGEM:", msg.text);
});
