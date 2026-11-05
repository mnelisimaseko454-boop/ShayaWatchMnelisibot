const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 10000;

// === MONETAG PUSH - SHAYA WATCH BOT - Zone 12190939 ===
app.get('/sw.js', (req, res) => {
  res.type('application/javascript');
  res.send(`self.options = { "domain": "3nbf4.com", "zoneId": 12190939 }
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')`);
});

app.get('/service-worker.min.js', (req, res) => {
  res.type('application/javascript');
  res.send(`self.options = { "domain": "3nbf4.com", "zoneId": 12190939 }
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')`);
});

// === SERVE YOUR FIXED index.html (Monetag) ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/terms', (req,res)=>{ res.send('<h1>Terms - Shaya Watch Bot</h1><p>Watch ads for rewards. Must be 13+.</p>'); });
app.get('/privacy', (req,res)=>{ res.send('<h1>Privacy - Shaya Watch Bot</h1><p>We collect Telegram ID, balance. Monetag may collect device info for ads.</p>'); });

// === KEEP YOUR APIs HERE ===
// /api/balance, /api/earn, /api/withdraw, /api/monetag-stats

app.listen(PORT, ()=> console.log('Shaya Watch Live on '+PORT));

