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
