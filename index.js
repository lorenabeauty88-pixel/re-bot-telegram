const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(
    msg.chat.id,
    "🌸 Bot funcionando 🚀\n\nUse:\n/promo link"
  );

});

bot.onText(/\/promo (.+)/, async (msg, match) => {

  const chatId = msg.chat.id;
  const url = match[1];

  try {

   const res = await axios.get(`https://api.microlink.io/?url=${url`}0;

    const data = res.data.data;

    const title = data.title || "Produto";
    const image = data.image?.url;

    if (image) {

      await bot.sendPhoto(chatId, image, {
        caption: 🛒 ${title}
      });

    } else {

      await bot.sendMessage(chatId, 🛒 ${title});

    }

  } catch (err) {

    console.log(err);

    bot.sendMessage(
      chatId,
      "Erro ao gerar oferta."
    );

  }

});
