bot.onText(/\/promo(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1]?.trim();

  if (!query) {
    return bot.sendMessage(chatId, "👉 Use: /promo celular");
  }

  console.log("🔥 PROMO ATIVADO:", query);

  try {
    bot.sendMessage(chatId, "🔎 Buscando achadinhos...");

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=5`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const items = res.data.results;

    if (!items || items.length === 0) {
      return bot.sendMessage(chatId, "❌ Nenhum produto encontrado.");
    }

    const top = items.sort((a, b) => a.price - b.price).slice(0, 5);

    for (const item of top) {
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
    }
  } catch (err) {
    console.log("❌ ERRO:", err.response?.status || err.message);
    bot.sendMessage(chatId, "❌ Erro ao buscar produtos agora.");
  }
});
// resto do código acima...

bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  try {

    // código da promoção aqui

  } catch (error) {
    console.log(error);

    bot.sendMessage(chatId, "❌ Erro ao buscar produtos agora.");
  }
});

bot.on("polling_error", (err) => {
  console.error("Polling error:", err.message);
});
