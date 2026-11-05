// bot.js - SHAYA WATCH Telegram Bot
const { Telegraf, Markup } = require('telegraf');

function createBot(token, deps) {
  const bot = new Telegraf(token);
  const { getUser } = deps;

  const WEBAPP_URL = 'https://shayawatchmnelisibot-4.onrender.com/';

  bot.start((ctx) => {
    const user = getUser(ctx.from.id);
    user.username = ctx.from.username || '';
    user.firstName = ctx.from.first_name || '';
    return ctx.reply(
      `🔥 *Welcome to SHAYA WATCH* 🔥\n\n` +
      `Trending videos, music, lifestyle & culture from SA creators.\n\n` +
      `💰 Watch ads → Earn R0.02 per ad\n` +
      `💳 Min Withdraw: R50\n` +
      `👤 Balance: R${user.balance.toFixed(2)}\n\n` +
      `Tap below to open the app 👇`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('▶️ Open SHAYA WATCH', WEBAPP_URL)],
          [Markup.button.callback('💰 My Balance', 'balance')],
          [Markup.button.callback('ℹ️ How it works', 'how')]
        ])
      }
    );
  });

  bot.action('balance', (ctx) => {
    const user = getUser(ctx.from.id);
    ctx.reply(`💰 *Your Balance*\n\nBalance: R${user.balance.toFixed(2)}\nTotal Watched: ${user.totalWatched}\nTotal Earned: R${user.totalEarned.toFixed(2)}\n\nMin Withdraw: R50`, { parse_mode: 'Markdown' });
  });

  bot.action('how', (ctx) => {
    ctx.reply(
      `ℹ️ *How SHAYA WATCH Works*\n\n` +
      `1. Open the Mini App\n` +
      `2. Tap WATCH AD\n` +
      `3. Watch the full ad\n` +
      `4. Get R0.02 instantly\n` +
      `5. Withdraw at R50 via Capitec / Bank / Airtime\n\n` +
      `No limit - watch as much as you want!`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('balance', (ctx) => {
    const user = getUser(ctx.from.id);
    ctx.reply(`Balance: R${user.balance.toFixed(2)} | Watched: ${user.totalWatched}`);
  });

  bot.command('app', (ctx) => {
    ctx.reply('Open SHAYA WATCH:', Markup.inlineKeyboard([[Markup.button.webApp('▶️ Open App', WEBAPP_URL)]]));
  });

  bot.on('text', (ctx) => {
    ctx.reply('Tap below to open SHAYA WATCH 👇', Markup.inlineKeyboard([[Markup.button.webApp('▶️ Open SHAYA WATCH', WEBAPP_URL)]]));
  });

  return bot;
}

module.exports = { createBot };
