const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const WizardScene = require("telegraf/scenes/wizard");

// сцена загрузки
const uploadScene = require("./scenes/upload-scene");

// Handler factoriess
const { enter, leave } = Stage;

// Greeter scene
const greeterScene = new Scene("greeter");
greeterScene.enter(ctx => {
  ctx.session.myData = {};
  return ctx.reply(
    "Привет! Это чат-бот команды Vidness, мы поможем создать тебе крутые видео.",
    Markup.inlineKeyboard([
      Markup.callbackButton("Как работает этот бот?", "howtowork")
    ]).extra()
  );
});

greeterScene.action("howtowork", ctx =>
  ctx.reply(
    `Всё очень просто. Всего несколько шагов:
    1️⃣ Заполните информации о компании
    2️⃣ Снимаете видео своего продукта/услуги
    3️⃣ Пришлите мне файлы
    4️⃣ Заполните краткий бриф
    5️⃣ Выбираете подходящий тариф
    ✅ В течении 2х дней получите готовый результат`,
    Markup.keyboard([
      ["Отлично, приступим"], // Row1 with 1 buttons
      ["Расскажи подробнее"], // Row2 with 1 buttons
      ["Перейти к загрузке файлов"] // Row3 with 1 buttons
    ])
      .oneTime()
      .resize()
      .extra()
  )
);

greeterScene.hears("Отлично, приступим", enter("project"));

greeterScene.leave(() => console.log('greeterScene.leave'));

// Project scene
const projectWizard = new WizardScene(
  "project",
  ctx => {
    ctx.wizard.state.data = {};
    ctx.reply("Напиши название компании");
    return ctx.wizard.next();
  },
  ctx => {
    ctx.wizard.state.data.name = ctx.message.text;
    ctx.reply("Чем занимается компания?");
    return ctx.wizard.next();
  },
  ctx => {
    ctx.wizard.state.data.about = ctx.message.text;
    ctx.reply(`Этого достаточно.
    Перейдём к сути, перед тем как мы будем готовы загрузить видео-файлы,
    Я пришлю краткую инструкцию по съёмке на телефон`);
    console.log(JSON.stringify(ctx.wizard.state.data));
    // return ctx.wizard.next();
    return ctx.scene.enter("upload");
  }
);

projectWizard.leave(() => console.log('projectWizard.leave'))

module.exports = {
  stage: new Stage([greeterScene, projectWizard, uploadScene], { ttl: 10 })
};
