const http = require('http');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());

const APP_URL = 'https://mnelisimaseko454-boop.github.io/ShayaWatchMnelisibot/';
const DB_FILE = './balances.json';
const USER_EARN = 0.10; // User gets R0.10, YOU keep R1.40 profit!
const MIN_WITHDRAW = 10.00; // Min R10 to withdraw

// Load database
let balances = {};
let withdrawRequests = [];
if (fs.existsSync(DB_FILE)) {
  balances = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(balances, null, 2));
}

// Telegram /start
bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id;
  if (!balances[userId]) {
    balances[userId] = { balance: 0, totalEarned: 0, username: msg.from.username || 'user' };
    saveDB();
  }
  bot.sendMessage(msg.chat.id, `🎵 SHAYA WATCH is LIVE!\n\nYour Balance: R${balances[userId].balance.toFixed(2)}\nEarn R${USER_EARN.toFixed(2)} per ad\nMin withdraw: R${MIN_WITHDRAW}\n\nClick below:`, {
    reply_markup: { inline_keyboard: [[{ text: "▶️ OPEN SHAYA WATCH", url: APP_URL }]] }
  });
});

// API: Get balance
app.get('/api/balance', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.json({ balance: 0 });
  if (!balances[userId]) balances[userId] = { balance: 0, totalEarned: 0 };
  res.json(balances[userId]);
});

// API: Add earning
app.post('/api/earn', (req, res) => {
  const { userId, username } = req.body;
  if (!userId) return res.json({ error: 'no user' });
  if (!balances[userId]) balances[userId] = { balance: 0, totalEarned: 0, username: username || 'user' };
  
  balances[userId].balance += USER_EARN;
  balances[userId].totalEarned += USER_EARN;
  balances[userId].username = username || balances[userId].username;
  saveDB();
  res.json(balances[userId]);
});

// API: Request withdrawal
app.post('/api/withdraw', (req, res) => {
  const { userId, method, account, amount } = req.body;
  const user = balances[userId];
  if (!user || user.balance < MIN_WITHDRAW) {
    return res.json({ error: `Need R${MIN_WITHDRAW} minimum. You have R${user ? user.balance.toFixed(2) : '0'}` });
  }
  withdrawRequests.push({ userId, method, account, amount: user.balance, date: new Date().toISOString(), username: user.username });
  user.balance = 0; // Reset after request
  saveDB();
  fs.writeFileSync('./withdrawals.json', JSON.stringify(withdrawRequests, null, 2));
  
  // Notify YOU (owner) on Telegram
  bot.sendMessage(process.env.OWNER_ID || Object.keys(balances)[0], `💰 NEW WITHDRAWAL!\nUser: ${user.username} (${userId})\nAmount: R${amount}\nMethod: ${method}\nAccount: ${account}`);
  
  res.json({ success: true, message: 'Withdrawal request sent! You will be paid within 24h' });
});

// Health
app.get('/', (req, res) => res.send('Bot + API running'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API on ${PORT}`));
console.log('Bot running...');
