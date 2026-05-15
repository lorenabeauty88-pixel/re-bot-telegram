bot.onText(/\/recomenda (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1];

  console.log("COMANDO RECEBIDO:", input);

  bot.sendMessage(chatId, "🔎 Processando link...");

  if (!input.includes("http")) {
    return bot.sendMessage(chatId, "❌ Envie um link do Mercado Livre.");
  }

  const produto = await buscarPorLinkML(input);

  if (!produto) {
    return bot.sendMessage(chatId, "❌ Não consegui ler esse produto. Envie outro link do Mercado Livre.");
  }

  const gif = "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif";

  bot.sendAnimation(chatId, gif);

  bot.sendPhoto(chatId, produto.imagem, {
    caption:
      `🔥 RE RECOMENDA\n\n` +
      `🛍 ${produto.nome}\n` +
      `💰 R$ ${produto.preco}\n` +
      (produto.desconto > 0 ? `🔥 ${produto.desconto}% OFF\n\n` : "\n") +
      `🔗 ${produto.link}`
  });
});
