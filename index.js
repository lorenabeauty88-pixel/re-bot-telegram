const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];

  try {
    const res = await axios.get(https://api.microlink.io/?url=${url});
    const data = res.data.data;

    const title = data.title || "Produto em oferta";
    const image = data.image?.url;
    const desc = data.description || "";

    const caption = `
🌸 RÊ RECOMENDA PRO 🌸

💖 ${title}

📝 ${desc}

🛒 Clique no botão para ver a oferta
`;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛒 VER OFERTA", url }]
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
    bot.sendMessage(chatId, "⚠️ Não consegui montar o card. Tente outro link.");
  }
});
