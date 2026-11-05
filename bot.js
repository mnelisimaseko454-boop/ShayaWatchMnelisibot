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

const VIDS = ["y4h7YEGo5-I","Yi8Lcry8IzY","bvl39nmaOYU","K9Ge-bBCPjM","rpeMjYRQgxU","1pNf7Sl9w8E","9B3vAyeF6lU","nkE3yC5PQRE","KRYyPCKPTsw","GqKzS6Bn8UQ","qIl1MbWiCXA","8NeY9z6Q5vA","e4w8Bv2Q9kL","xFYQQPAOz7Y","YVkUvmDQ3HY","j5a0jTc9S10"];

// Real video files - upload these to GitHub in videos/ folder
const VIDEO_FILES = [
  { file: './videos/video1.mp4', caption: '🎬 Video 1 - Boat | Watch & Earn R0.02' },
  { file: './videos/video2.mp4', caption: '🎬 Video 2 - Sabadala | Watch & Earn R0.02' },
  { file: './videos/video3.mp4', caption: '🎬 Video 3 - Hut | Watch & Earn R0.02' },
];

function todayStr(){ return new Date().toDateString(); }
function checkReset(){ if(monetagStats.lastReset !== todayStr()){ monetagStats.today = 0; monetagStats.lastReset = todayStr(); } }
function getUser(userId, from){
  if(!users[userId]) users[userId] = { balance: 0, adsWatched: 0, refEarned: 0, refPending: 0, username: from?.username || from?.first_name || 'guest', referredBy: null };
  return users[userId];
}
function mainKeyboard(){
  return { inline_keyboard: [
    [{ text: '🚀 OPEN SHAYA WATCH', web_app: { url: APP_URL } }],
    [{ text: '🎬 VIDEOS + ADS', callback_data: 'show_videos' }, { text: '💰 BALANCE', callback_data: 'show_balance' }],
    [{ text: '💸 WITHDRAW (Min R20)', callback_data: 'start_withdraw' }],
    [{ text: '🔗 MY REFERRAL LINK', callback_data: 'show_ref' }]
  ]};
}
function giveReward(userId, from){
  const u = getUser(userId, from);
  u.balance += 0.02; u.adsWatched += 1;
  checkReset(); monetagStats.total += 0.005; monetagStats.today += 0.005; monetagStats.count += 1;
  if(u.adsWatched === 10 && u.referredBy && users[u.referredBy]){
    const refId = u.referredBy;
    users[refId].balance += 0.50; users[refId].refEarned = (users[refId].refEarned||0)+1; users[refId].refPending = Math.max(0,(users[refId].refPending||0)-1);
  }
  return u;
}

// START
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
  bot.sendMessage(chatId, `🎵 *SHAYA WATCH*\n\nWatch ads, earn R0.02 per ad.\nWatch videos + ads in Bot OR Mini App.\nInvite friends, earn R0.50 each.\n\nBalance: R${u.balance.toFixed(2)} | Ads: ${u.adsWatched}`, { parse_mode: 'Markdown', reply_markup: mainKeyboard() });
});

bot.onText(/\/videos/, (msg) => sendVideos(msg.chat.id, 0));
bot.onText(/\/balance/, (msg) => {
  const u = getUser(String(msg.from.id), msg.from);
  bot.sendMessage(msg.chat.id, `💰 *Your Balance*\n\nBalance: R${u.balance.toFixed(2)}\nAds Watched: ${u.adsWatched}\nReferrals Paid: ${u.refEarned} | Pending: ${u.refPending}`, { parse_mode: 'Markdown', reply_markup: mainKeyboard() });
});
bot.onText(/\/withdraw/, (msg) => startWithdraw(msg.chat.id, String(msg.from.id)));

// SEND REAL VIDEO FILE IN BOT CHAT - PLAYS INSIDE CHAT
async function sendVideos(chatId, index = 0){
  if(index >= VIDEO_FILES.length){
    bot.sendMessage(chatId, '✅ Thats all videos for now! More coming soon.', { reply_markup: mainKeyboard() });
    return;
  }
  const v = VIDEO_FILES[index];
  try {
    await bot.sendVideo(chatId, v.file, {
      caption: `${v.caption}\n\n1. Watch the video above 👆\n2. Tap CLAIM to get R0.02`,
      reply_markup: { inline_keyboard: [
        [{ text: '💰 CLAIM R0.02', callback_data: `claim_video_${index}` }],
        [{ text: '🛍️ OPEN OFFER +R0.02', callback_data: 'claim_offer' }],
        [{ text: '▶️ NEXT VIDEO', callback_data: `next_video_${index+1}` }],
        [{ text: '📱 OPEN IN MINI APP', web_app: { url: APP_URL } }]
      ]}
    });
  } catch(e) {
    console.log('Video send failed, fallback to thumbnail', e.message);
    // Fallback if MP4 not uploaded yet - send YouTube thumbnail + Mini App link
    const ytId = VIDS[index] || VIDS[0];
    bot.sendMessage(chatId, `${v.caption}\n\nVideo file not found on server yet. Tap below to watch in Mini App.`, {
      reply_markup: { inline_keyboard: [
        [{ text: '▶️ WATCH IN MINI APP', web_app: { url: APP_URL } }],
        [{ text: '💰 CLAIM R0.02', callback_data: `claim_video_${index}` }]
      ]}
    });
  }
}

// CALLBACKS
bot.on('callback_query', async (q) => {
  const chatId = q.message.chat.id;
  const userId = String(q.from.id);
  const data = q.data;
  const u = getUser(userId, q.from);
  bot.answerCallbackQuery(q.id);

  if(data === 'menu'){
    bot.sendMessage(chatId, `🎵 *SHAYA WATCH MENU*\n\nBalance: R${u.balance.toFixed(2)}`, { parse_mode: 'Markdown', reply_markup: mainKeyboard() });
  }
  if(data === 'show_videos'){ sendVideos(chatId, 0); }
  if(data === 'show_balance'){
    bot.sendMessage(chatId, `💰 Balance: R${u.balance.toFixed(2)}\nAds: ${u.adsWatched}\nReferrals: ${u.refEarned} paid, ${u.refPending} pending`, { reply_markup: mainKeyboard() });
  }
  if(data === 'show_ref'){
    bot.sendMessage(chatId, `🔗 Your link:\nhttps://t.me/ShayaWatchMnelisibot?start=ref_${userId}\n\nShare it! Friend must watch 10 ads, you get R0.50`, { reply_markup: mainKeyboard() });
  }
  if(data.startsWith('claim_video_') || data === 'claim_offer'){
    const updated = giveReward(userId, q.from);
    bot.sendMessage(chatId, `✅ +R0.02 Added!\nNew Balance: R${updated.balance.toFixed(2)}\nAds: ${updated.adsWatched}`, { reply_markup: mainKeyboard() });
  }
  if(data.startsWith('next_video_')){
    const nextIndex = parseInt(data.split('_')[2]);
    sendVideos(chatId, nextIndex);
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
  bot.sendMessage(chatId, `💸 *WITHDRAW R${u.balance.toFixed(2)}*\n\nReply with your method:\nCapitec / FNB / PayPal / eWallet\n\nOr tap Cancel`, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '❌ CANCEL', callback_data: 'menu' }]] } });
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

// API
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
