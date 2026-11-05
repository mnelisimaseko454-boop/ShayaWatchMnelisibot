app.get('/sw.js', (req, res) => {
  res.type('application/javascript');
  res.send(`self.options = { "domain": "3nbf4.com", "zoneId": 12190939 }
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')`);
});
