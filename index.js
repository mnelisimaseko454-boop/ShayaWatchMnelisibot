import { Telegraf, Markup } from 'telegraf';
import express from 'express';
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.start((ctx) => {
  console.log("Got /start");
  ctx.reply(`🔥 Shaya LIVE!\n\nYour video:\nhttps://youtu.be/8qd-mgCEk7E?si=c5RVb8yA7MntAXge`, Markup.inlineKeyboard([[Markup.button.url('▶️ Watch Video', 'https://youtu.be/8qd-mgCEk7E?si=c5RVb8yA7MntAXge')],[Markup.button.callback('✅ Claim R0.50', 'watch')]]));
});
bot.action('watch', (ctx) => ctx.reply('🎉 R0.50 Added!'));
bot.launch().then(() => console.log("Bot running! READY FOR /start"));
const app = express();
app.get('/', (req, res) => res.send('Bot Live'));
app.listen(process.env.PORT || 10000, () => console.log("Server live"));
