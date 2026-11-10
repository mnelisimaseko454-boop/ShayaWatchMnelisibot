const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'db.json');
let db = { users: {} };
if (fs.existsSync(DB_FILE)) { try { db = JSON.parse(fs.readFileSync(DB_FILE)); } catch(e){} }
function save(){ fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function getUser(userId){
  userId = String(userId);
  if(!db.users[userId]){
    db.users[userId] = {
      userId, username: "", firstName: "",
      balance: 0, coins: 0,
      totalWatched: 0,
      referrals: 0, referralEarnings: 0,
      referredBy: null, referralCounted: false,
      withdrawals: []
    };
  }
  return db.users[userId];
}

// === GET USER - for index.html loadUser() ===
app.get('/api/user/:userId', (req, res) => {
  const u = getUser(req.params.userId);
  res.json({ balance: u.balance, coins: u.coins, totalWatched: u.totalWatched, referrals: u.referrals, referralEarnings: u.referralEarnings });
});

// === CLAIM REWARD - R0.02 + 10 COINS per ad ===
app.post('/api/claim-reward', (req, res) => {
  const { userId, username, firstName, referredBy } = req.body;
  if(!userId) return res.json({ success: false, message: 'No userId' });
  const u = getUser(userId);
  u.username = username || u.username;
  u.firstName = firstName || u.firstName;

  // Referral - first time only
  if(referredBy && referredBy !== String(userId) && !u.referredBy){
    u.referredBy = referredBy;
  }

  u.balance = Math.round((u.balance + 0.02) * 100) / 100;
  u.coins += 10;
  u.totalWatched += 1;

  // Referral bonus: when referred user hits 10 ads, referrer gets R0.50 + 50 Coins
  if(u.referredBy && !u.referralCounted && u.totalWatched >= 10){
    u.referralCounted = true;
    const ref = getUser(u.referredBy);
    ref.balance = Math.round((ref.balance + 0.50) * 100) / 100;
    ref.coins += 50;
    ref.referrals += 1;
    ref.referralEarnings = Math.round((ref.referralEarnings + 0.50) * 100) / 100;
  }

  save();
  res.json({ success: true, user: { balance: u.balance, coins: u.coins, totalWatched: u.totalWatched } });
});

// === SYNC COINS - from localStorage ===
app.post('/api/coins', (req, res) => {
  const { userId, coins } = req.body;
  if(!userId) return res.json({ success: false });
  const u = getUser(userId);
  // Only take higher value, to avoid overwriting with old phone data
  if(typeof coins === 'number' && coins > u.coins) u.coins = coins;
  save();
  res.json({ success: true, coins: u.coins });
});

// === WITHDRAW - R50 OR 50000 Coins ===
app.post('/api/withdraw', (req, res) => {
  const { userId, amount, coins, method, details } = req.body;
  const u = getUser(userId);

  // Pay with Coins (50000 Coins = R50)
  if(coins && coins >= 50000){
    if(u.coins < 50000) return res.json({ success: false, message: 'Not enough coins. You have ' + u.coins });
    u.coins -= 50000;
    u.withdrawals.push({ type: 'coins', coins: 50000, amount: 50, method, details, date: new Date().toISOString(), status: 'pending' });
    save();
    return res.json({ success: true, message: '✅ Withdraw R50 (50000 Coins) requested! Paid via ' + method, user: { balance: u.balance, coins: u.coins } });
  }

  // Pay with Cash
  if(u.balance < 50) return res.json({ success: false, message: `Need R50. You have R${u.balance.toFixed(2)}` });
  const pay = amount || u.balance;
  u.balance = 0; // withdraw all
  u.withdrawals.push({ type: 'cash', amount: pay, method, details, date: new Date().toISOString(), status: 'pending' });
  save();
  res.json({ success: true, message: `✅ Withdraw R${pay.toFixed(2)} requested! Paid via ${method}`, user: { balance: u.balance, coins: u.coins } });
});

// === ADMIN: See all users / withdrawals ===
app.get('/api/admin/users', (req, res) => {
  res.json(Object.values(db.users));
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
module.exports = app;
