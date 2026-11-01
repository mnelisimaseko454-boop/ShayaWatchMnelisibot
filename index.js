import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// YOUR ADMIN ID - Replace with your Telegram ID! Get it from @userinfobot
const ADMIN_ID = 1159481047; // <--- CHANGE THIS! Send /myid to your bot to get your ID

const VIDEOS = [
  "https://youtu.be/8qd-mgCEk7E?si=c5RVb8yA7MntAXge"
];

const MIN_WITHDRAW = 20; // R20 minimum

bot.command('myid', (ctx) => ctx.reply(`Your ID: ${ctx.from.id}`));

bot.start(async (ctx) => {
  try {
    const id = ctx.from.id;
    let { data: user } = await supabase.from('users').select('*').eq('telegram_id', id).single();
    if (!user) {
      const { data } = await supabase.from('users').insert([{ telegram_id: id, username: ctx.from.username || ctx.from.first_name, balance: 0 }]).select().single();
      user = data || { balance: 0 };
    }
    ctx.reply(
      `🔥 Shaya Watch - Earn Watching! 💰\n\n👤 Balance: R${(user.balance||0).toFixed(2)}\n💵 Earn R0.50 per video\n💳 Min Withdraw: R${MIN_WITHDRAW}\n\n📺 Today's Video:\n${VIDEOS[0]}`,
      Markup.inlineKeyboard([
        [Markup.button.url('▶️ Watch Video', VIDEOS[0])],
        [Markup.button.callback('✅ Claim R0.50', 'claim')],
        [Markup.button.callback('💰 Balance', 'balance'), Markup.button.callback('💳 Withdraw', 'withdraw')]
      ])
    );
  } catch(e) {
    ctx.reply(`🔥 LIVE! Video: ${VIDEOS[0]}`, Markup.inlineKeyboard([[Markup.button.url('▶️ Watch Video', VIDEOS[0])]]));
  }
});

bot.action('claim', async (ctx) => {
  try {
    const { data: user } = await supabase.from('users').select('*').eq('telegram_id', ctx.from.id).single();
    const newBal = (user.balance||0)+0.5;
    await supabase.from('users').update({ balance: newBal }).eq('telegram_id', ctx.from.id);
    ctx.reply(`🎉 Claimed! New Balance: R${newBal.toFixed(2)}`, Markup.inlineKeyboard([[Markup.button.callback('💳 Withdraw R'+newBal.toFixed(2), 'withdraw')],[Markup.button.callback('📺 Watch Again', 'claim')]]));
  } catch(e) {
    ctx.reply(`🎉 R0.50 Added!`);
  }
});

bot.action('balance', async (ctx) => {
  const { data: user } = await supabase.from('users').select('*').eq('telegram_id', ctx.from.id).single();
  ctx.reply(`💰 Your Balance: R${(user?.balance||0).toFixed(2)}\nMin Withdraw: R${MIN_WITHDRAW}`);
});

bot.action('withdraw', async (ctx) => {
  const { data: user } = await supabase.from('users').select('*').eq('telegram_id', ctx.from.id).single();
  if ((user.balance||0) < MIN_WITHDRAW) {
    return ctx.reply(`❌ Need R${MIN_WITHDRAW} to withdraw.\nYou have: R${(user.balance||0).toFixed(2)}\nKeep watching! Need R${(MIN_WITHDRAW - (user.balance||0)).toFixed(2)} more.`);
  }
  ctx.reply(`💳 Withdraw R${user.balance.toFixed(2)}\n\nSend your details in this format:\n\nCapitec / TymeBank / eWallet\nAccount: 123456789\nName: Your Name\n\nExample:\nCapitec 1234567890 John Doe\n\nType your details now:`);
  // Next message will be withdrawal details
  bot.on('text', async (ctx2) => {
    if (ctx2.from.id !== ctx.from.id) return;
    const details = ctx2.message.text;
    if (details.length < 10 || details.includes('/start')) return;
    
    await supabase.from('withdrawals').insert([{
      telegram_id: ctx.from.id,
      username: ctx.from.username || ctx.from.first_name,
      amount: user.balance,
      method: 'bank',
      account_details: details,
      status: 'pending'
    }]);
    await supabase.from('users').update({ balance: 0 }).eq('telegram_id', ctx.from.id);
    
    ctx2.reply(`✅ Withdrawal Request Sent!\n\n💵 Amount: R${user.balance.toFixed(2)}\n📋 Details: ${details}\n⏳ Status: Pending (24h)\n\nYou will be paid within 24 hours!`);
    
    // Notify Admin
    try {
      await bot.telegram.sendMessage(ADMIN_ID, `🔔 NEW WITHDRAWAL!\n\nUser: ${ctx.from.username} (${ctx.from.id})\nAmount: R${user.balance}\nDetails: ${details}\n\nTo approve: /approve ${ctx.from.id}`);
    } catch {}
  });
});

bot.command('admin', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply('Not admin');
  const { data: pending } = await supabase.from('withdrawals').select('*').eq('status', 'pending');
  const { data: users } = await supabase.from('users').select('*');
  const totalOwed = users?.reduce((s,u)=>s+(u.balance||0),0)||0;
  ctx.reply(`📊 ADMIN PANEL\n\n👥 Total Users: ${users?.length||0}\n💰 Total Owed: R${totalOwed.toFixed(2)}\n⏳ Pending Withdrawals: ${pending?.length||0}\n\n${pending?.map(w=>`ID ${w.telegram_id} - R${w.amount} - ${w.account_details}`).join('\n')||'No pending'}\n\nCommands:\n/approve ID - Mark as paid`);
});

bot.command('approve', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const userId = ctx.message.text.split(' ')[1];
  await supabase.from('withdrawals').update({ status: 'paid' }).eq('telegram_id', userId).eq('status', 'pending');
  ctx.reply(`✅ Approved withdrawal for ${userId}`);
  try { await bot.telegram.sendMessage(userId, `✅ Your withdrawal of R was PAID! Check your bank! Thank you for using Shaya Watch! 🎉`); } catch {}
});

bot.launch().then(()=>console.log("Bot READY with Withdraw!"));
const app = express();
app.get('/',(req,res)=>res.send('Shaya Watch Live'));
app.listen(process.env.PORT||10000);
