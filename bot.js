const Telegraf = require("telegraf");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const session = require("telegraf/session");

const { resources, upload, meta } = require("ya-disk");

// сцены
const { stage } = require("./src/scenes");


const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);


//bot.use(ctx => {
//  console.log(ctx.message);
// });

//bot.catch((err, ctx) => {
//console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
//});

bot.use(session());
bot.use(stage.middleware());


bot.command("start", ctx => ctx.scene.enter('greeter'));

bot.launch();
console.log("bot listen");
