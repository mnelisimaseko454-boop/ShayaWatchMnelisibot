// index.js - Shaya Watch Mnelisi - FINAL with Adsgram bot-57165
import { Telegraf, Markup } from 'telegraf'
import express from 'express'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const BLOCK_ID = 'bot-57165'

const app = express()
app.use(express.json())

app.get('/api/adsgram-reward', async (req, res) => {
  const userId = req.query.userId || req.query.user_id
  console.log('Ad watched by:', userId)
  if (userId) {
    try {
      let { data: user } = await supabase.from('ai_lovers_users').select('*').eq('telegram_id', userId).single()
      if (user) {
        await supabase.from('ai_lovers_users').update({ balance: (user.balance || 0) + 0.5 }).eq('telegram_id', userId)
        bot.telegram.sendMessage(userId, `✅ +R0.50! Balance: R${(user.balance + 0.5).toFixed(2)}`, Markup.inlineKeyboard([[Markup.button.callback('📺 Watch Again', 'watch_ad')]]))
      }
    } catch (e) { console.log(e) }
  }
  res.send('OK')
})

bot.start(async (ctx) => {
  let { data: user } = await supabase.from('ai_lovers_users').select('*').eq('telegram_id', ctx.from.id).single()
  if (!user) {
    await supabase.from('ai_lovers_users').insert({ telegram_id: ctx.from.id, username: ctx.from.username, first_name: ctx.from.first_name, balance: 0 })
    user = { balance: 0 }
  }
  ctx.reply(`🔥 Welcome to Shaya Watch Bot 💰\n\nEarn R0.50 per Ad\nBalance: R${(user.balance||0).toFixed(2)}`, Markup.inlineKeyboard([
    [Markup.button.callback('📺 Watch Ad + Earn R0.50', 'watch_ad')],
    [Markup.button.callback('💰 Balance', 'balance')]
  ]))
})

bot.action('watch_ad', async (ctx) => {
  const adLink = `https://adsgram.ai/show?blockId=${BLOCK_ID}&userId=${ctx.from.id}`
  ctx.reply(`📺 Watch 15 sec to earn R0.50:`, Markup.inlineKeyboard([
    [Markup.button.url('▶️ WATCH AD NOW', adLink)],
    [Markup.button.callback('✅ I Watched', 'check_reward')]
  ]))
})

bot.action('check_reward', async (ctx) => { ctx.reply('⏳ Reward coming in 1 min if you watched full ad!') })
bot.action('balance', async (ctx) => {
  let { data: user } = await supabase.from('ai_lovers_users').select('*').eq('telegram_id', ctx.from.id).single()
  ctx.reply(`💰 Balance: R${(user?.balance||0).toFixed(2)}\nMin withdrawal R50`)
})

bot.launch()
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Live on ${PORT} Block ${BLOCK_ID}`))
