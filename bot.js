const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = 'https://mnelisimaseko454-boop.github.io/ShayaWatchMnelisibot/?v=16';

if (!TOKEN) {
  console.log('ERROR: BOT_TOKEN missing in Render Environment!');
}

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.get('/', (req, res) => {
  res.send('ShayaWatch Bot is LIVE - Go to @ShayaWatchMnelisibot');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Web server running on port', PORT));

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎵 *Welcome to Shaya Watch!* \n\nWatch music videos & Earn R0.50 per ad! 💰\n\nClick below to open:", {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎵 Open Shaya Watch - Earn Now", web_app: { url: WEBAPP_URL } }]
      ]
    }
  });
});

console.log('Bot polling started...');
