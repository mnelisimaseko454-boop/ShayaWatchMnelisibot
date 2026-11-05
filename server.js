// server.js - SHAYA WATCH - Adsgram Version
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createBot } = require('./bot');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN;

// --- Simple DB (JSON file) ---
const DB_FILE = path.join(__dirname, 'db.json');
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {}
  return { users: {} };
}
function saveDB(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
let db = loadDB();

function getUser(userId) {
  userId = String(userId);
  if (!db.users[userId]) {
    db.users[userId] = { id: userId, balance: 0, totalWatched: 0, totalEarned: 0, lastRewardAt: 0, username: '', firstName: '' };
    saveDB(db);
  }
  return db.users[userId];
}
function addBalance(userId, amount, reason) {
  const user = getUser(userId);
  user.balance = Math.round((user.balance + amount) * 100) / 100;
  user.totalEarned = Math.round((user.totalEarned + amount) * 100) / 100;
  user.totalWatched += 1;
  user.lastRewardAt = Date.now();
  saveDB(db);
  console.log(`+R${amount} to ${userId} - ${reason} - new balance R${user.balance}`);
  return user;
}

// --- Serve Mini App ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- API: Get user ---
app.get('/api/user/:id', (req, res) => {
  const user = getUser(req.params.id);
  res.json(user);
});

// --- API: Claim from frontend (after Adsgram show() succeeds) ---
app.post('/api/claim-reward', (req, res) => {
  const { userId, username, firstName } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const user = getUser(userId);
  if (username) user.username = username;
  if (firstName) user.firstName = firstName;
  // Prevent double-click spam: 5 sec cooldown
  if (Date.now() - user.lastRewardAt < 5000) {
    return res.json({ success: false, message: 'Wait a bit', user });
  }
  const updated = addBalance(userId, 0.02, 'adsgram-frontend');
  saveDB(db);
  res.json({ success: true, reward: 0.02, user: updated });
});

// --- API: Adsgram Server Callback ---
// Adsgram calls: /api/adsgram-reward?user_id=[userId]
// This is the Reward URL you set in Adsgram dashboard
app.get('/api/adsgram-reward', (req, res) => {
  const userId = req.query.user_id || req.query.userId || req.query.userid;
  console.log('Adsgram callback:', req.query);
  if (!userId) return res.status(400).send('missing user_id');
  // Don't double-credit if frontend already claimed within 10 sec
  const user = getUser(userId);
  if (Date.now() - user.lastRewardAt < 10000) {
    return res.send('OK - already credited');
  }
  addBalance(userId, 0.02, 'adsgram-callback');
  res.send('OK');
});

// --- API: Withdraw request ---
app.post('/api/withdraw', (req, res) => {
  const { userId, amount, method, details } = req.body;
  const user = getUser(userId);
  if (user.balance < 50) return res.json({ success: false, message: 'Minimum withdrawal is R50. Keep watching!' });
  if (amount > user.balance) return res.json({ success: false, message: 'Not enough balance' });
  user.balance = Math.round((user.balance - amount) * 100) / 100;
  saveDB(db);
  // TODO: Send to admin via bot
  console.log(`WITHDRAW: User ${userId} - R${amount} via ${method} - ${details}`);
  res.json({ success: true, message: `Withdrawal of R${amount} requested. We will pay within 24h.`, user });
});

// --- Start Bot ---
let bot = null;
if (BOT_TOKEN) {
  bot = createBot(BOT_TOKEN, { getUser });
  // Webhook for Render
  app.use(bot.webhookCallback('/bot' + BOT_TOKEN));
  console.log('Bot webhook ready at /bot' + BOT_TOKEN);
} else {
  console.log('WARNING: No BOT_TOKEN set');
}

app.listen(PORT, () => {
  console.log(`SHAYA WATCH running on port ${PORT}`);
  console.log(`Adsgram Block ID: 58189`);
  if (BOT_TOKEN && bot) {
    const webhookUrl = `https://shayawatchmnelisibot-4.onrender.com/bot${BOT_TOKEN}`;
    bot.telegram.setWebhook(webhookUrl).then(() => console.log('Webhook set:', webhookUrl)).catch(e => console.log('Webhook error:', e.message));
  }
});
