const TelegramBot = require('node-telegram-bot-api');
const BOT_TOKEN = process.env.BOT_TOKEN || "PUT_YOUR_BOT_TOKEN_HERE";
const WEB_APP_URL = process.env.WEB_APP_URL || "PUT_YOUR_RENDER_URL_HERE";

function startBot(){
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });

  bot.onText(/\/start(.*)/, (msg, match) => {
    const startParam = (match[1] || "").trim();
    const refLink = `https://t.me/ShayaWatchMnelisibot?start=ref_${msg.from.id}`;
    bot.sendMessage(msg.chat.id,
`🔥 SHAYA WATCH 🇿🇦

Earn by watching ads + videos!

✅ 1 Ad = R0.02 + 10 🪙 Profit Coins
✅ 1000 Coins = R1
✅ 50000 Coins = R50
✅ Withdraw at R50 or 50000 Coins

🎬 20 Trending SA Videos
🔗 Referral: R0.50 + 50 Coins per friend

Tap below to open 👇\n\nYour referral link:\n${refLink}`, {
      reply_markup: { inline_keyboard: [[{ text: "🚀 OPEN SHAYA WATCH", web_app: { url: WEB_APP_URL + (startParam ? `?start=${startParam}` : "") } }]] }
    });
  });

  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id,
`HOW IT WORKS:

1. Tap OPEN SHAYA WATCH
2. Tap WATCH AD - watch full ad
3. Get +R0.02 + 10 Coins instantly
4. Tap CONVERT to turn 1000 Coins = R1 cash
5. At R50 or 50000 Coins, tap WITHDRAW
6. Share your link, get R0.50 + 50 Coins per friend

Pay: Capitec / Bank / Airtime / USDT`);
  });

  bot.onText(/\/balance/, (msg) => {
    bot.sendMessage(msg.chat.id, "Open the app to see your balance + coins 👇", {
      reply_markup: { inline_keyboard: [[{ text: "🚀 OPEN SHAYA WATCH", web_app: { url: WEB_APP_URL } }]] }
    });
  });

  console.log("Telegram Bot started...");
  return bot;
}
module.exports = startBot;
