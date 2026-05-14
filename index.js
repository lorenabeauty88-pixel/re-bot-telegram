const TelegramBot = require('node-telegram-bot-api');

// TOKEN do Railway
const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🌸 Rê Recomenda Store ativa! Envie /promo + link');
});

// INSTAGRAM (opcional)
const insta = "https://instagram.com/SEU_USUARIO";

bot.onText(/\/insta/, (msg) => {
  bot.sendMessage(msg.chat.id, insta);
});

// PROMO - BOTÃO DE LOJA
bot.onText(/\/promo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const link = match[1];

  const texto = `
🌸 RÊ RECOMENDA STORE 🌸

💖 Achadinho selecionado pra você

✨ Produto em oferta
🚚 Consulte frete no link
🔒 Compra segura

🛒 Clique no botão abaixo para ver a oferta
`;

  bot.sendMessage(chatId, texto, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🛒 VER OFERTA",
            url: link
          }
        ]
      ]
    }
  });
});

console.log("Bot da loja iniciado");
