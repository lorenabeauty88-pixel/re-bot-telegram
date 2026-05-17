bot.onText(/\/promo (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  try {
    bot.sendMessage(chatId, "🔎 Buscando os melhores achadinhos...");

    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url);

    const items = res.data.results;

    if (!items || items.length === 0) {
      return bot.sendMessage(chatId, "❌ Nenhum produto encontrado.");
    }

    const top = items.slice(0, 5);

    for (const item of top) {
      const title = item.title || "Sem título";
      const price = item.price ? `R$ ${item.price}` : "Preço não disponível";
      const link = item.permalink || "";
      const image = item.thumbnail || "";

      let message =
        `🔥 *ACHADINHO ENCONTRADO*\n\n` +
        `🛍 ${title}\n` +
        `💰 ${price}\n` +
        `🔗 ${link}`;

      // manda imagem + texto (estilo profissional)
      if (image) {
        await bot.sendPhoto(chatId, image, {
          caption: message
        });
      } else {
        await bot.sendMessage(chatId, message);
      }
    }

  } catch (err) {
    console.log("ERRO:", err.message);
    bot.sendMessage(chatId, "⚠️ Erro ao buscar produtos. Tente novamente.");
  }
});
