const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const token = process.env.BOT_TOKEN;
const OWNER_ID = '1159481047';
const bot = new TelegramBot(token, { polling: true });
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Monetag Push - sw.js - CORRECT ZONE 12197812
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`self.options = { "domain": "5gvci.com", "zoneId": 12197812 };
self.lary = "";
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');`);
});

const APP_URL = 'https://shayawatchmnelisibot-4.onrender.com/';
const USER_EARN = 0.02;
const REF_BONUS = 0.50;
const REF_REQUIRED_ADS = 10;
const MIN_WITHDRAW = 20.00;
const DB_FILE = './balances.json';
const WD_FILE = './withdrawals.json';
let balances = {};
let withdrawRequests = [];
if (fs.existsSync(DB_FILE)) { try { balances = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e){} }
if (fs.existsSync(WD_FILE)) { try { withdrawRequests = JSON.parse(fs.readFileSync(WD_FILE, 'utf8')); } catch(e){} }
function saveDB() { fs.writeFileSync(DB_FILE, JSON.stringify(balances, null, 2)); }
function saveWD() { fs.writeFileSync(WD_FILE, JSON.stringify(withdrawRequests, null, 2)); }

bot.onText(/\/start(?:\s+(.+))?/, (msg, match) => {
  const userId = String(msg.from.id);
  const param = match[1] || '';
  let referredBy = null;
  if (param.startsWith('ref_')) { referredBy = param.replace('ref_', ''); if (referredBy === userId) referredBy = null; }
  if (!balances[userId]) {
    balances[userId] = { balance: 0, totalEarned: 0, username: msg.from.username || msg.from.first_name || 'user', adsWatched: 0, referredBy: referredBy, referralPaid: false, referrals: [] };
    if (referredBy && balances[referredBy]) { balances[referredBy].referrals.push(userId); }
    saveDB();
    if (referredBy) { bot.sendMessage(referredBy, `👤 New referral! @${msg.from.username || msg.from.first_name} joined via your link. You'll get R${REF_BONUS} when they watch ${REF_REQUIRED_ADS} ads!`); }
  }
  bot.sendMessage(msg.chat.id, `🎵 SHAYA WATCH\n\nBalance: R${balances[userId].balance.toFixed(2)}\nEarn R${USER_EARN}/ad\nRefer friends: R${REF_BONUS} per friend (after they watch ${REF_REQUIRED_ADS} ads)\n\n🔗 Your referral link:\nhttps://t.me/ShayaWatchMnelisibot?start=ref_${userId}\n\nClick to open:`, { reply_markup: { inline_keyboard: [[{ text: "▶️ OPEN SHAYA WATCH", web_app: { url: APP_URL } }]] } }

});

app.get('/api/balance', (req, res) => {
  const userId = String(req.query.userId || '');
  const data = balances[userId] || { balance: 0, totalEarned: 0, adsWatched: 0, referrals: [] };
  let refEarned = 0; let refPending = 0;
  (data.referrals || []).forEach(refId => { const refUser = balances[refId]; if (refUser && refUser.adsWatched >= REF_REQUIRED_ADS) refEarned++; else refPending++; });
  res.json({ ...data, refEarned, refPending, refBonus: REF_BONUS, refRequired: REF_REQUIRED_ADS });
});

app.get('/api/monetag-stats', (req, res) => {
  res.json({ total: 0, today: 0, count: 0 });
});

app.post('/api/earn', (req, res) => {
  const userId = String(req.body.userId || '');
    // OWNER CANNOT EARN - Protects from Monetag self-click ban
  if (userId === OWNER_ID) {
    return res.json({ balance: 0, totalEarned: 0, adsWatched: 0, referrals: [], ownerBlocked: true, message: 'Owner test mode - no earning' });
  }
  const username = req.body.username || 'user';
  const referredBy = req.body.referredBy || null;
  if (!userId) return res.json({ error: 'no user' });
  if (!balances[userId]) {
    balances[userId] = { balance: 0, totalEarned: 0, username, adsWatched: 0, referredBy, referralPaid: false, referrals: [] };
    if (referredBy && balances[referredBy] && referredBy !== userId) { balances[referredBy].referrals = balances[referredBy].referrals || []; if (!balances[referredBy].referrals.includes(userId)) balances[referredBy].referrals.push(userId); }
  }
  balances[userId].balance += USER_EARN;
  balances[userId].totalEarned += USER_EARN;
  balances[userId].adsWatched = (balances[userId].adsWatched || 0) + 1;
  balances[userId].username = username;
  if (balances[userId].adsWatched === REF_REQUIRED_ADS && balances[userId].referredBy && !balances[userId].referralPaid) {
    const referrerId = String(balances[userId].referredBy);
    if (balances[referrerId]) { balances[referrerId].balance += REF_BONUS; balances[referrerId].totalEarned += REF_BONUS; balances[userId].referralPaid = true; saveDB(); bot.sendMessage(referrerId, `🎉 Referral bonus! Your friend @${username} watched ${REF_REQUIRED_ADS} ads. You earned R${REF_BONUS}!`); bot.sendMessage(userId, `✅ You helped your friend earn R${REF_BONUS}! Keep watching to earn more!`); }
  }
  saveDB(); res.json(balances[userId]);
});

app.post('/api/withdraw', (req, res) => {
  const userId = String(req.body.userId || '');
  const { method, account } = req.body;
  const user = balances[userId];
  if (!user || user.balance < MIN_WITHDRAW) return res.json({ error: `Need R${MIN_WITHDRAW}. You have R${user ? user.balance.toFixed(2) : '0'}` });
  const amount = user.balance;
  withdrawRequests.push({ userId, username: user.username, method, account, amount, date: new Date().toISOString() });
  saveWD(); user.balance = 0; saveDB();
  bot.sendMessage(OWNER_ID, `💰 WITHDRAWAL\nUser: @${user.username} (${userId})\nAmount: R${amount.toFixed(2)}\nMethod: ${method}\nAccount: ${account}`);
  res.json({ success: true, message: `Withdrawal R${amount.toFixed(2)} requested! Paid in 24h` });
});

bot.onText(/\/paid (.+)/, (msg, match) => { if (String(msg.from.id) !== OWNER_ID) return; bot.sendMessage(match[1], `✅ Paid! Check account.`); });

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.send(`API running. Users: ${Object.keys(balances).length}`);
});

app.listen(process.env.PORT || 10000, () => console.log('API running'));
