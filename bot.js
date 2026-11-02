const http = require('http');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const APP_URL = 'https://mnelisimaseko454-boop.github.io/ShayaWatchMnelisibot/';

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎵 Welcome to SHAYA WATCH!\n\nWatch 16 Music Videos & Earn!\n\nClick below to open:", {
    reply_markup: {
      inline_keyboard: [[{ text: "▶️ Open Shaya Watch", web_app: { url: APP_URL } }]]
    }
  });
});

bot.on('polling_error', (err) => console.log(err.message));

// Keep Render alive
http.createServer((req,res) => {
  res.writeHead(200);
  res.end('Bot is running!');
}).listen(process.env.PORT || 10000);

console.log('Bot running...');
