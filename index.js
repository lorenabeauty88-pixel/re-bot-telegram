const axios = require("axios");

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

    if (image) {
      await bot.sendPhoto(chatId, image, {
        caption,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛒 VER OFERTA", url }]
          ]
        }
      });
    } else {
      await bot.sendMessage(chatId, caption, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛒 VER OFERTA", url }]
          ]
        }
      });
    }

  } catch (err) {
    bot.sendMessage(chatId, "⚠️ Não consegui montar o card. Tente outro link.");
  }
});
