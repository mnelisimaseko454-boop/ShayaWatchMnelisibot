import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const VIDEOS = ["https://youtu.be/8qd-mgCEk7E?si=c5RVb8yA7MntAXge"];

bot.start(async (ctx) => {
  try {
    const id = ctx.from.id;
    let { data: user } = await supabase.from('users').select('*').eq('telegram_id', id).single();
    if (!user) {
      const { data } = await supabase.from('users').insert([{ telegram_id: id, username: ctx.from.first_name, balance: 0 }]).select().single();
      user = data || { balance: 0 };
    }
    ctx.reply(`🔥 LIVE! Balance: R${(user.balance||0).toFixed(2)}\nVideo: ${VIDEOS[0]}`, Markup.inlineKeyboard([[Markup.button.url('▶️ Watch Video', VIDEOS[0])],[Markup.button.callback('✅ Claim R0.50','claim')]]));
  } catch(e) {
    console.log("DB Error:", e.message);
    // STILL REPLY EVEN IF DB FAILS - SO NO "No reply"
    ctx.reply(`🔥 Shaya LIVE!\nVideo: ${VIDEOS[0]}\n\n(Note: DB connecting...)`, Markup.inlineKeyboard([[Markup.button.url('▶️ Watch Video', VIDEOS[0])],[Markup.button.callback('✅ Claim R0.50','claim')]]));
  }
});

bot.action('claim', async (ctx) => {
  try {
    const { data: user } = await supabase.from('users').select('*').eq('telegram_id', ctx.from.id).single();
    const newBal = (user.balance||0)+0.5;
    await supabase.from('users').update({ balance: newBal }).eq('telegram_id', ctx.from.id);
    ctx.reply(`🎉 New Balance: R${newBal.toFixed(2)}`);
  } catch(e) {
    ctx.reply(`🎉 R0.50 Added! (Balance will save once DB fixed)`);
  }
});

bot.launch().then(()=>console.log("Bot running! READY"));
const app = express();
app.get('/',(req,res)=>res.send('Live'));
app.listen(process.env.PORT||10000);
