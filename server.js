const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 10000;

// === TIKTOK VERIFICATION ===
app.get('/tiktok-developers-site-verification', (req, res) => {
  res.type('text/plain').send('tiktok-developers-site-verification=nhiUP3zTOtgqUGHaI8D2iDGjxn67xe9k');
});

// === MONETAG VERIFICATION - SHAYA WATCH BOT ===
app.get('/sw.js', (req, res) => {
  res.type('application/javascript').send(`self.options = { "domain": "3nbf4.com", "zoneId": 12190939 }
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')`);
});

app.get('/service-worker.min.js', (req, res) => {
  res.type('application/javascript').send(`self.options = { "domain": "3nbf4.com", "zoneId": 12190939 }
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')`);
});
// === END MONETAG ===

app.get('/', (req,res)=>{
  res.send(`<html><head><title>Shaya Watch Bot</title></head><body>
  <h1>Shaya Watch Bot Live</h1>
  <p><a href="/terms">Terms</a> | <a href="/privacy">Privacy</a></p>
  <p>Open @ShayaWatchMnelisibot on Telegram to earn</p>
  </body></html>`);
});

app.get('/terms', (req,res)=>{ res.send('<h1>Terms - Shaya Watch Bot</h1><p>Watch ads for rewards. Must be 13+. Contact @ShayaWatchMnelisibot</p>'); });
app.get('/privacy', (req,res)=>{ res.send('<h1>Privacy - Shaya Watch Bot</h1><p>We collect Telegram ID, balance. Monetag may collect device info for ads.</p>'); });
app.get('/callback', (req,res)=>{ res.send('Callback OK'); });

app.listen(PORT, ()=> console.log('Live on '+PORT));
