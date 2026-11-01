import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const VIDEOS = [
  "https://youtu.be/8qd-mgCEk7E?si=c5RVb8yA7MntAXge"
];

bot.start(async (ctx) => {
  const id = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  let { data: user } = await supabase.from('users').select('*').eq('telegram_id', id).single();
  if (!user) {
    const { data } = await supabase.from('users').insert([{ telegram_id: id, username, balance: 0 }]).select().single();
    user = data;
  }
  ctx.reply(
    `🔥 Shaya Watch Bot LIVE! 💰\n\nBalance: R${(user.balance || 0).toFixed(2)}\n\nEarn R0.50 per video!\n\nYour Video: ${VIDEOS[0]}`,
    Markup.inlineKeyboard([
      [Markup.button.url('▶️ Watch Video', VIDEOS[0])],
      [Markup.button.callback('✅ Claim R0.50', 'claim')],
      [Markup.button.callback('💰 Balance', 'balance')]
    ])
  );
});

bot.action('claim', async (ctx) => {
  const id = ctx.from.id;
  const { data: user } = await supabase.from('users').select('*').eq('telegram_id', id).single();
  const newBal = (user.balance || 0) + 0.5;
  await supabase.from('users').update({ balance: newBal }).eq('telegram_id', id);
  ctx.reply(`🎉 R0.50 Added! New Balance: R${newBal.toFixed(2)}\n\nWatch again?`, 
    Markup.inlineKeyboard([[Markup.button.url('▶️ Watch Video', VIDEOS[0])],[Markup.button.callback('✅ Claim Again', 'claim')]])
  );
});

bot.action('balance', async (ctx) => {
  const { data: user } = await supabase.from('users').select('*').eq('telegram_id', ctx.from.id).single();
  ctx.reply(`💰 Balance: R${(user?.balance || 0).toFixed(2)}`);
});

bot.launch().then(() => console.log("Bot running! READY FOR /start"));
const app = express();
app.get('/', (req, res) => res.send('Live'));
app.listen(process.env.PORT || 10000);
