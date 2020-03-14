const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const Telegram = require("telegraf/telegram");
const { resources, upload, meta } = require("ya-disk");

const yaToken = process.env.YA_TOKEN;
const botToken = process.env.BOT_TOKEN;
const telegram = new Telegram(botToken);

// промифицируем обращение к апи для await
const metaGet = (token, path, options) =>
  new Promise((resolve, reject) =>
    meta.get(token, path, options, resolve, reject)
  );
const resourcesCreate = (token, path) =>
  new Promise((resolve, reject) =>
    resources.create(token, path, resolve, reject)
  );

// создание сцены
const uploadScene = new Scene("upload");
uploadScene.enter(ctx => {
  return ctx.reply(
    `Вы можете загрузить файлы весом до 1.5гб каждый.
    Нажмите "прикрепить" - "файл" - "фото или видео"
    Выберете нужные файлы, нажмите отправить и дождитесь загрузки`,
    Markup.keyboard(["Файлы загружены"])
      .oneTime()
      .resize()
      .extra()
  );
});

uploadScene.hears(/Файлы загружены/, ctx => {
  ctx.reply(
    "Готово! Ваш проект отправлен в работу, в ближайшие 2 дня мы пришлем вам результат!"
  );
  return ctx.scene.leave();
});

uploadScene.on(["video", "document"], async ctx => {
  let fileId;
  let filePath;
  let fileName;
  let metaInfo;
  let userExist = false;

  const username = ctx.from.username;

  // Проверяем существует юзер на диске
  try {
    metaInfo = await metaGet(yaToken, `disk:/${username}`, null);
    if (metaInfo.name === username) {
      userExist = true;
    }
  } catch (error) {
      // console.log("Error: metaGet", error);
  }

  // если не существует, то создаем для него папку
  if (!userExist) {
    console.log("userExist", userExist);
    await resourcesCreate(yaToken, `disk:/${username}`);
  }

  // ---

  // Код для видео
  if ("video" in ctx.message) {
    fileId = ctx.message.video.file_id;
    fileName = ctx.message.video.file_unique_id;
    try {
      filePath = await telegram.getFileLink(fileId);
      console.log("filePath", filePath);
    } catch (error) {
      return console.error("Error:", error);
    }
  }
  // когда видео скидывают файлом
  if ("document" in ctx.message) {
    fileId = ctx.message.document.file_id;
    fileName = ctx.message.document.file_name;
    try {
      filePath = await telegram.getFileLink(fileId);
      console.log("filePath", filePath);
    } catch (error) {
      return console.error("Error:", error);
    }
  }
  try {
    upload.remoteFile(
      yaToken,
      filePath,
      `disk:/${username}/${fileName}.mp4`,
      res => console.log("upload.remoteFile", res),
      err => console.error("Error: upload.remoteFile", err)
    );
  } catch (error) {
    return console.error("Error:", error);
  }
  return;
});

module.exports = uploadScene;
