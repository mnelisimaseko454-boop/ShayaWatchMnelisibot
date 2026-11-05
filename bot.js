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
let withdrawState = {};

function todayStr(){ return new Date().toDateString(); }
function checkReset(){ if(monetagStats.lastReset !== todayStr()){ monetagStats.today = 0; monetagStats.lastReset = todayStr(); } }
function getUser(userId, from){
  if(!users[userId]) users[userId] = { balance: 0, adsWatched: 0, refEarned: 0, refPending: 0, username: from?.username || from?.first_name || 'guest', referredBy: null };
  return users[userId];
}
function mainKeyboard(){
  return { inline_keyboard: [
    [{ text: '🚀 OPEN SHAYA WATCH', web_app: { url: APP_URL } }],
    [{ text: '💰 BALANCE', callback_data: 'show_balance' }],
    [{ text: '💸 WITHDRAW (Min R20)', callback_data: 'start_withdraw' }],
    [{ text: '🔗 MY REFERRAL LINK', callback_data: 'show_ref' }]
  ]};
}

// START - No videos, no ads in chat
bot.onText(/\/start(?:\s+(.*))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const startParam = match[1] || '';
  let referredBy = null;
  if(startParam.startsWith('ref_')) referredBy = startParam.replace('ref_','');
  let u = getUser(userId, msg.from);
  if(!u.referredBy && referredBy && referredBy !== userId){
    u.referredBy = referredBy;
    if(users[referredBy]) users[referredBy].refPending = (users[referredBy].refPending || 0) + 1;
  }
  bot.sendMessage(chatId, `🎵 *SHAYA WATCH*\n\nWatch ads, earn R0.02 per ad.\nWatch videos + ads inside Mini App.\nInvite friends, earn R0.50 each.\n\nBalance: R${u.balance.toFixed(2)} | Ads: ${u.adsWatched}`, { parse_mode: 'Markdown', reply_markup: mainKeyboard() });
});

bot.onText(/\/balance/, (msg) => {
  const u = getUser(String(msg.from.id), msg.from);
  bot.sendMessage(msg.chat.id, `💰 *Your Balance*\n\nBalance: R${u.balance.toFixed(2)}\nAds Watched: ${u.adsWatched}\nReferrals Paid: ${u.refEarned} | Pending: ${u.refPending}`, { parse_mode: 'Markdown', reply_markup: mainKeyboard() });
});
bot.onText(/\/withdraw/, (msg) => startWithdraw(msg.chat.id, String(msg.from.id)));

bot.on('callback_query', async (q) => {
  const chatId = q.message.chat.id;
  const userId = String(q.from.id);
  const data = q.data;
  const u = getUser(userId, q.from);
  bot.answerCallbackQuery(q.id);

  if(data === 'menu'){
    bot.sendMessage(chatId, `🎵 *SHAYA WATCH MENU*\n\nBalance: R${u.balance.toFixed(2)}`, { parse_mode: 'Markdown', reply_markup: mainKeyboard() });
  }
  if(data === 'show_balance'){
    bot.sendMessage(chatId, `💰 Balance: R${u.balance.toFixed(2)}\nAds: ${u.adsWatched}\nReferrals: ${u.refEarned} paid, ${u.refPending} pending`, { reply_markup: mainKeyboard() });
  }
  if(data === 'show_ref'){
    bot.sendMessage(chatId, `🔗 Your link:\nhttps://t.me/ShayaWatchMnelisibot?start=ref_${userId}\n\nShare it! Friend must watch 10 ads, you get R0.50`, { reply_markup: mainKeyboard() });
  }
  if(data === 'start_withdraw'){ startWithdraw(chatId, userId); }
});

function startWithdraw(chatId, userId){
  const u = getUser(userId);
  if(u.balance < 20){
    bot.sendMessage(chatId, `❌ Need R20 minimum.\nYou have R${u.balance.toFixed(2)}\n\nKeep watching ads!`, { reply_markup: mainKeyboard() });
    return;
  }
  withdrawState[userId] = { step: 'method' };
  bot.sendMessage(chatId, `💸 *WITHDRAW R${u.balance.toFixed(2)}*\n\nReply with your method:\nCapitec / FNB / PayPal / eWallet`, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '❌ CANCEL', callback_data: 'menu' }]] } });
}

bot.on('message', (msg) => {
  if(!msg.text || msg.text.startsWith('/')) return;
  const userId = String(msg.from.id);
  const state = withdrawState[userId];
  if(!state) return;
  const chatId = msg.chat.id;
  const u = getUser(userId, msg.from);

  if(state.step === 'method'){
    state.method = msg.text;
    state.step = 'account';
    bot.sendMessage(chatId, `Got it: ${msg.text}\n\nNow reply with your ${msg.text} account number / details:`);
  } else if(state.step === 'account'){
    state.account = msg.text;
    const amount = u.balance;
    u.balance = 0;
    console.log(`WITHDRAW BOT: ${userId} ${state.method} ${state.account} R${amount}`);
    bot.sendMessage(chatId, `✅ *Withdraw Request Received!*\n\nAmount: R${amount.toFixed(2)}\nMethod: ${state.method}\nAccount: ${state.account}\n\nWe will pay within 24h.`, { parse_mode: 'Markdown', reply_markup: mainKeyboard() });
    delete withdrawState[userId];
  }
});

// API - for Mini App
app.get('/api/balance', (req, res) => {
  const userId = String(req.query.userId);
  const u = users[userId] || { balance: 0, adsWatched: 0, refEarned: 0, refPending: 0 };
  res.json(u);
});
app.post('/api/earn', (req, res) => {
  const { userId, username, referredBy, source } = req.body;
  checkReset();
  if(!users[userId]) users[userId] = { balance: 0, adsWatched: 0, refEarned: 0, refPending: 0, username: username||'guest', referredBy };
  users[userId].balance += 0.02; users[userId].adsWatched += 1;
  monetagStats.total += 0.005; monetagStats.today += 0.005; monetagStats.count += 1;
  if(users[userId].adsWatched === 10 && users[userId].referredBy && users[users[userId].referredBy]){
    const refId = users[userId].referredBy;
    users[refId].balance += 0.50; users[refId].refEarned = (users[refId].refEarned||0)+1; users[refId].refPending = Math.max(0,(users[refId].refPending||0)-1);
  }
  res.json(users[userId]);
});
app.get('/api/monetag-stats', (req,res)=>{ checkReset(); res.json(monetagStats); });
app.post('/api/withdraw', (req, res) => {
  const { userId, method, account, amount } = req.body;
  const u = users[userId];
  if(!u || u.balance < 20.00) return res.json({ success: false, error: 'Need R20.00 minimum' });
  u.balance = 0;
  console.log(`WITHDRAW MINIAPP: ${userId} ${method} ${account} R${amount}`);
  res.json({ success: true, message: 'Withdraw request received! We will pay within 24h.' });
});
app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (req,res)=> res.send('API running'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server on '+PORT));
