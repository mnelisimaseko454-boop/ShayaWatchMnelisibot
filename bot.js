const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const APP_URL = 'https://shayawatchmnelisibot-4.onrender.com/';
const MINIAPP_LINK = 'https://t.me/ShayaWatchMnelisibot/shayawatch';

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let users = {};
let monetagStats = { total: 0, today: 0, count: 0, lastReset: new Date().toDateString() };

function todayStr(){ return new Date().toDateString(); }
function checkReset(){
  if(monetagStats.lastReset !== todayStr()){
    monetagStats.today = 0;
    monetagStats.lastReset = todayStr();
  }
}

bot.onText(/\/start(?:\s+(.*))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const startParam = match[1] || '';
  let referredBy = null;
  if(startParam.startsWith('ref_')) referredBy = startParam.replace('ref_','');
  
  if(!users[userId]){
    users[userId] = { balance: 0, adsWatched: 0, refEarned: 0, refPending: 0, username: msg.from.username || msg.from.first_name || 'guest', referredBy };
    if(referredBy && users[referredBy]){
      users[referredBy].refPending = (users[referredBy].refPending || 0) + 1;
    }
  }

  bot.sendMessage(chatId, `🎵 *SHAYA WATCH*\n\nWatch ads, earn R0.02 per ad.\nInvite friends, earn R0.50 each.\n\nTap below to OPEN:`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 OPEN SHAYA WATCH', url: MINIAPP_LINK }]
      ]
    }
  });
});

app.get('/api/balance', (req, res) => {
  const userId = String(req.query.userId);
  const u = users[userId] || { balance: 0, adsWatched: 0, refEarned: 0, refPending: 0 };
  res.json(u);
});

app.post('/api/earn', (req, res) => {
  const { userId, username, referredBy, source } = req.body;
  checkReset();
  if(!users[userId]) users[userId] = { balance: 0, adsWatched: 0, refEarned: 0, refPending: 0, username: username||'guest', referredBy };
  users[userId].balance += 0.02;
  users[userId].adsWatched += 1;
  monetagStats.total += 0.005;
  monetagStats.today += 0.005;
  monetagStats.count += 1;

  if(users[userId].adsWatched === 10 && users[userId].referredBy && users[users[userId].referredBy]){
    const refId = users[userId].referredBy;
    users[refId].balance += 0.50;
    users[refId].refEarned = (users[refId].refEarned||0)+1;
    users[refId].refPending = Math.max(0,(users[refId].refPending||0)-1);
  }
  res.json(users[userId]);
});

app.get('/api/monetag-stats', (req,res)=>{
  checkReset();
  res.json(monetagStats);
});

app.post('/api/withdraw', (req, res) => {
  const { userId, method, account, amount } = req.body;
  const u = users[userId];
  if(!u || u.balance < 20.00) return res.json({ success: false, error: 'Need R20.00 minimum' });
  u.balance = 0;
  console.log(`WITHDRAW: ${userId} ${method} ${account} R${amount}`);
  res.json({ success: true, message: 'Withdraw request received! We will pay within 24h.' });
});

// THIS IS THE FIX - Serve index.html at root, not "API running"
app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (req,res)=> res.send('API running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server on '+PORT));

