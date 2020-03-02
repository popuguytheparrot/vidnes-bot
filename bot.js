const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const { resources, upload } = require('ya-disk')
const { promisify } = require('util');

const bot = new Telegraf(process.env.BOT_TOKEN)
const telegram = new Telegram(process.env.BOT_TOKEN)

bot.use((ctx) => {
  console.log(ctx.message)
})

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.start((ctx) => ctx.reply('Welcome'))
bot.on(['video', 'document'], async (ctx) => {
    let fileId;
    let filePath;
    let fileName;
    const username = ctx.from.username
    await resources.create(process.env.YA_TOKEN, username)
    if('video' in ctx.message) {
        fileId = ctx.message.video.file_id
        fileName = ctx.message.video.file_unique_id
        filePath = await telegram.getFileLink(fileId)
    }
    if('document' in ctx.message) {
        fileId = ctx.message.document.file_id
        fileName = ctx.message.document.file_name
        filePath = await telegram.getFileLink(fileId)
    }
    upload.remoteFile(process.env.YA_TOKEN, filePath, `disk:/${username}/${fileName}.mp4`)

})


bot.launch()
console.log('bot listen')
