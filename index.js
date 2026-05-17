bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  console.log("🔥 PROMO ATIVADO:", query);

  try {
    bot.sendMessage(chatId, "🔎 Buscando achadinhos...");

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const items = res.data.results;

    if (!items || items.length === 0) {
      return bot.sendMessage(chatId, "❌ Nenhum produto encontrado.");
    }

    const item = items[0];

    const text =
      `🔥 ACHADINHO\n\n` +
      `🛍 ${item.title}\n` +
      `💰 R$ ${item.price}\n` +
      `🔗 ${item.permalink}`;

    if (item.thumbnail) {
      await bot.sendPhoto(chatId, item.thumbnail, { caption: text });
    } else {
      await bot.sendMessage(chatId, text);
    }

  } catch (err) {
    console.log("❌ ERRO PROMO:", err.message);
    bot.sendMessage(chatId, "⚠️ Erro ao buscar produto");
  }
});
