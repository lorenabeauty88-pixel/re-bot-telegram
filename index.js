bot.onText(/\/promo (.+)/, (msg, match) => {
  console.log("🔥 PROMO FOI CHAMADO");
  bot.sendMessage(msg.chat.id, "FUNCIONOU O COMANDO PROMO");
});
