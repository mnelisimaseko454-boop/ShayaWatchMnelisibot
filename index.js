import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PORT = process.env.PORT || 10000;

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.log("Missing env vars!");
}

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// YOUR VIDEOS - Add more links here later
const VIDEOS = [
  "https://youtu.be/8qd-mgCEk7E?si=c5RVb8yA7MntAXge",
  "https://youtu.be/8qd-mgCEk7E?si=c5RVb8yA7MntAXge" // You can add 4 more different links here
];

bot.start(async (ctx) => {
  const telegram_id = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;

  // Create user if not exists
  let { data: user } = await supabase.from('users').select('*').eq('telegram_id', telegram_id).single();
  
  if (!user) {
    const { data } = await supabase.from('users').insert([{ telegram_id, username, balance: 0 }]).select().single();
    user = data;
  }

  await ctx.reply(
    `🔥 Welcome to Shaya Watch Bot 💰\n\nEarn R0.50 per video!\n\nBalance: R${(user.balance || 0).toFixed(2)}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📺 Watch Video + Earn R0.50', 'watch_ad')],
      [Markup.button.callback('💰 Balance', 'balance')]
    ])
  );
});

bot.action('watch_ad', async (ctx) => {
  const telegram_id = ctx.from.id;
  const randomVideo = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];

  // Save watch time
  await supabase.from('users').update({ last_watch: new Date().toISOString() }).eq('telegram_id', telegram_id);

  await ctx.reply(
    `📺 Watch this video (15 sec) to earn R0.50:\n\n${randomVideo}\n\n👇 After watching, click Claim:`,
    Markup.inlineKeyboard([
      [Markup.button.callback('✅ I Watched - Claim R0.50', 'check_reward')]
    ])
  );
});

bot.action('check_reward', async (ctx) => {
  const telegram_id = ctx.from.id;
  const { data: user } = await supabase.from('users').select('*').eq('telegram_id', telegram_id).single();

  if (!user || !user.last_watch) {
    return ctx.reply("Click Watch Video first!");
  }

  const diffSec = (new Date() - new Date(user.last_watch)) / 1000;

  if (diffSec < 15) {
    return ctx.reply(`⏳ Watch full video! Wait ${Math.ceil(15 - diffSec)} sec more, then try again.`);
  }

  const newBalance = (user.balance || 0) + 0.50;
  await supabase.from('users').update({ balance: newBalance, last_watch: null }).eq('telegram_id', telegram_id);

  await ctx.reply(
    `🎉 R0.50 Added! New Balance: R${newBalance.toFixed(2)}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📺 Watch Another Video', 'watch_ad')],
      [Markup.button.callback('💰 Balance', 'balance')]
    ])
  );
});

bot.action('balance', async (ctx) => {
  const { data: user } = await supabase.from('users').select('*').eq('telegram_id', ctx.from.id).single();
  ctx.reply(`💰 Your Balance: R${(user?.balance || 0).toFixed(2)}\n\nKeep watching to earn more!`);
});

bot.launch().then(() => console.log("Bot running!"));

// Keep Render alive
const app = express();
app.get('/', (req, res) => res.send('ShayaWatch Bot Live!'));
app.listen(PORT, () => console.log(`Server on ${PORT}`));
