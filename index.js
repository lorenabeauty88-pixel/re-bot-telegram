const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Mensagem mais persuasiva (copy de vendas)
function buildCaption(title, desc) {
  return `
🔥 OFERTA IMPERDÍVEL 🔥

💖 ${title}

📝 ${desc || "Produto selecionado com desconto especial por tempo limitado!"}

⚡ Garanta antes que acabe!
📦 Envio e disponibilidade podem mudar rapidamente

🌸 RÊ RECOMENDA 🌸
`;
}

// comando /promo
bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];

  try {
    const res = await axios.get(https://api.microlink.io/?url=${url});
    const data = res.data.data;

    const title = data.title || "Produto em oferta";
    const image = data.image?.url;
    const desc = data.description || "";

    const caption = buildCaption(title, desc);

    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛒 VER OFERTA AGORA", url }]
        ]
      }
    };

    if (image) {
      await bot.sendPhoto(chatId, image, { caption, ...options });
    } else {
      await bot.sendMessage(chatId, caption, options);
    }

  } catch (err) {
    console.log(err);
    bot.sendMessage(chatId, "⚠️ Não consegui montar a oferta. Tente outro link.");
  }
});

// mensagem inicial
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `
🌸 Bem-vindo ao RÊ RECOMENDA 🌸

Envie um link assim:
👉 /promo https://amzn.to/xxxx

Eu transformo em oferta automática 🔥
`);
});
