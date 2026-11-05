<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>SHAYA WATCH</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script src="https://sad.adsgram.ai/js/sad.min.js"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}
  body{background:#0a0a0a;color:#fff;min-height:100vh;padding:16px;padding-bottom:90px}
  .header{text-align:center;padding:14px 0 6px}
  .logo{font-size:32px;font-weight:900;letter-spacing:1px}
  .logo span{color:#FFD700}
  .sub{color:#aaa;font-size:13px;margin-top:4px}
  .balance-card{background:linear-gradient(135deg,#FFD700,#FF8C00);color:#000;border-radius:20px;padding:20px;margin:16px 0;text-align:center}
  .balance-card small{font-size:13px;font-weight:600;opacity:.7}
  .balance-card h1{font-size:42px;margin:4px 0}
  .stats{display:flex;gap:10px;margin-bottom:16px}
  .stat{flex:1;background:#1a1a1a;border-radius:14px;padding:12px;text-align:center}
  .stat b{font-size:18px;display:block}
  .stat span{font-size:11px;color:#999}
  .video-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
  .video{background:#1a1a1a;border-radius:16px;overflow:hidden}
  .video img{width:100%;height:110px;object-fit:cover;display:block}
  .video div{padding:10px}
  .video p{font-size:13px;font-weight:600;line-height:1.3}
  .video small{color:#999;font-size:11px}
  .watch-btn{width:100%;background:#FFD700;color:#000;border:none;padding:18px;border-radius:16px;font-size:18px;font-weight:900;cursor:pointer;margin-top:6px}
  .watch-btn:disabled{opacity:.5}
  .withdraw-btn{width:100%;background:#222;color:#fff;border:1px solid #333;padding:14px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;margin-top:10px}
  .note{font-size:12px;color:#888;text-align:center;margin-top:12px;line-height:1.5}
  #toast{position:fixed;left:16px;right:16px;bottom:20px;background:#FFD700;color:#000;padding:14px;border-radius:12px;font-weight:800;text-align:center;display:none;z-index:99}
</style>
</head>
<body>

<div class="header">
  <div class="logo">SHAYA <span>WATCH</span></div>
  <div class="sub">Trending SA Videos • Music • Lifestyle • Culture</div>
</div>

<div class="balance-card">
  <small>YOUR BALANCE</small>
  <h1 id="balance">R0.00</h1>
  <small id="watchedText">0 ads watched • R0.02 per ad</small>
</div>

<div class="stats">
  <div class="stat"><b id="totalWatched">0</b><span>Watched</span></div>
  <div class="stat"><b>R50</b><span>Min Withdraw</span></div>
  <div class="stat"><b>R0.02</b><span>Per Ad</span></div>
</div>

<div class="video-grid" id="videos"></div>

<button class="watch-btn" id="watchBtn">▶️ WATCH AD + R0.02</button>
<button class="withdraw-btn" id="withdrawBtn">💳 Withdraw (Min R50)</button>

<p class="note">Watch the full ad to get rewarded.<br>Balance updates instantly. Withdraw via Capitec / Bank / Airtime.</p>
<div id="toast"></div>

<script>
const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();
const user = tg.initDataUnsafe?.user || { id: 123456, first_name: 'Guest', username: 'guest' };
const userId = String(user.id);

// === ADSGRAM CONFIG - YOUR REAL BLOCK ===
const ADSGRAM_BLOCK_ID = "58189";
const AdController = window.Adsgram ? window.Adsgram.init({ blockId: ADSGRAM_BLOCK_ID }) : null;

let balance = 0, totalWatched = 0;

function showToast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',3000); }

async function loadUser(){
  try{
    const r = await fetch(`/api/user/${userId}`);
    const d = await r.json();
    balance=d.balance; totalWatched=d.totalWatched;
    updateUI();
  }catch(e){}
}
function updateUI(){
  document.getElementById('balance').textContent = 'R' + balance.toFixed(2);
  document.getElementById('totalWatched').textContent = totalWatched;
  document.getElementById('watchedText').textContent = `${totalWatched} ads watched • R0.02 per ad`;
}

// Videos - sample
const videos = [
  {title:'Amapiano Mix 2026 - Best of SA', views:'1.2M views', img:'https://picsum.photos/400/250?random=1'},
  {title:'Durban Gqom - Street Vibes', views:'890K views', img:'https://picsum.photos/400/250?random=2'},
  {title:'Soweto Lifestyle Vlog', views:'456K views', img:'https://picsum.photos/400/250?random=3'},
  {title:'Joburg Hip Hop Cypher', views:'234K views', img:'https://picsum.photos/400/250?random=4'},
  {title:'Cape Town Culture Tour', views:'189K views', img:'https://picsum.photos/400/250?random=5'},
  {title:'Mamelodi Dance Challenge', views:'312K views', img:'https://picsum.photos/400/250?random=6'},
];
document.getElementById('videos').innerHTML = videos.map(v=>`<div class="video"><img src="${v.img}"><div><p>${v.title}</p><small>${v.views}</small></div></div>`).join('');

// WATCH AD
document.getElementById('watchBtn').addEventListener('click', async ()=>{
  const btn = document.getElementById('watchBtn');
  btn.disabled = true; btn.textContent = 'Loading Ad...';
  try{
    if(!AdController){ throw new Error('Adsgram not loaded'); }
    const result = await AdController.show();
    console.log('Adsgram result:', result);
    // User watched full ad - claim reward
    const res = await fetch('/api/claim-reward', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId, username: user.username, firstName: user.first_name })
    });
    const data = await res.json();
    if(data.success){
      balance = data.user.balance; totalWatched = data.user.totalWatched;
      updateUI();
      showToast('✅ +R0.02 Added! Balance: R' + balance.toFixed(2));
      if(tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } else {
      showToast(data.message || 'Already credited');
    }
  }catch(e){
    console.log('Ad error', e);
    showToast('Ad not ready, try again in a few seconds');
  }
  btn.disabled = false; btn.textContent = '▶️ WATCH AD + R0.02';
});

document.getElementById('withdrawBtn').addEventListener('click', async ()=>{
  if(balance < 50){ showToast('Need R50 to withdraw. Keep watching!'); return; }
  const method = prompt('Withdraw method? Type: Capitec / Bank / Airtime');
  const details = prompt('Enter your number / account details:');
  if(!method || !details) return;
  const res = await fetch('/api/withdraw', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, amount: balance, method, details }) });
  const data = await res.json();
  showToast(data.message);
  if(data.success){ balance = data.user.balance; updateUI(); }
});

loadUser();
</script>
</body>
</html>
