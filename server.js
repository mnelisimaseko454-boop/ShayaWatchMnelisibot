// === MONETAG VERIFICATION FOR SHAYA WATCH BOT ===
app.get('/sw.js', (req, res) => {
  res.type('application/javascript').send(`
self.options = { "domain": "3nbf4.com", "zoneId": 12190939 }
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')
  `);
});

// Monetag also checks this path
app.get('/service-worker.min.js', (req, res) => {
  res.type('application/javascript').send(`
self.options = { "domain": "3nbf4.com", "zoneId": 12190939 }
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')
  `);
});
