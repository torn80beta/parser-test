const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const startScraping = require("./parser.js");
const favoriteProducts = require("./favorite-products");

const token = process.env.BOT_API_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  var Hi = "hi";
  if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
    bot.sendMessage(msg.from.id, "Hello,  " + msg.from.first_name + " 👋");
  }

  // var check = "check";
  // if (msg.text.toString().toLowerCase().includes(check)) {
  //   // const products = async (arr) => {
  //   //   const res = await startScraping(arr);
  //   //   return res;
  //   // };
  //   // const actionProducts = products(favoriteProducts);
  //   // bot.sendMessage(msg.chat.id, `${actionProducts}`);

  //   bot.sendMessage(msg.chat.id, "Hope to see you around again , Bye");
  // }

  var markup = "markup";
  if (msg.text.toString().toLowerCase().indexOf(markup) === 0) {
    bot.sendMessage(
      msg.chat.id,
      '<b>bold</b> \n <i>italic</i> \n <em>italic with em</em> \n <a href="http://www.example.com/">inline URL</a> \n <code>inline fixed-width code</code> \n <pre>pre-formatted fixed-width code block</pre>',
      { parse_mode: "HTML" }
    );
  }

  var location = "location";
  if (msg.text.toString().toLowerCase().indexOf(location) === 0) {
    bot.sendLocation(msg.chat.id, 44.97108, -104.27719);
    bot.sendMessage(msg.chat.id, "Here is the point");
  }
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome", {
    reply_markup: {
      keyboard: [["Hi!", "Location"], ["Markup"]],
      // ["Check"],
    },
  });
});

bot.onText(/\/check/, async (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🤖🔎 Ищу акционные товары из вашего списка, ожидайте..."
  );

  const res = await startScraping(favoriteProducts);

  const actionProducts = res
    .filter((prod) => prod.value !== "")
    .map((prod) => {
      const { title, regularPrice, actionPrice, atbCardPrice, url } =
        prod.value;
      return `✅ <b>${title}</b> \n 🔷Обычная цена: ${regularPrice} грн. \n ⚠️Цена по акции: ${actionPrice} \n ${
        atbCardPrice !== "null"
          ? "🔥Цена с карточкой АТБ: " + atbCardPrice + "грн.\n"
          : ""
      }🛒 ${url}`;
    })
    .join(" \n \n ");

  // console.log(actionProducts);
  bot.sendMessage(
    msg.chat.id,
    `Найдены следующие акционные товары: \n \n ${
      actionProducts.length > 0
        ? actionProducts
        : "Акционных продуктов не найдено 🤷‍♂️"
    }`,
    { parse_mode: "HTML" }
  );
});
