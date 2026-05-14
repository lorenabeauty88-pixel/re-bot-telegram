bot.onText(/\/promo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const texto = match[1];

  bot.sendMessage(chatId, texto);
});
