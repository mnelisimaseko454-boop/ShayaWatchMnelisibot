const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const APP_URL = 'https://mnelisimaseko454-boop.github.io/ShayaWatchMnelisibot/';

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🎵 SHAYA WATCH is LIVE!\n\nBalance: Watch ads to earn R0.50 each\n\nClick button below:", {
    reply_markup: {
      inline_keyboard: [[{ text: "▶️ OPEN SHAYA WATCH", url: APP_URL }]]
    }
  });
});

http.createServer((req,res)=>res.end('Bot running')).listen(process.env.PORT||10000);
console.log('Bot running...');
