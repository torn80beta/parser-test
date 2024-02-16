const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const startScraping = require("./parser.js");
const data = require("./favorite-products");

const token = process.env.BOT_API_TOKEN;

const bot = new TelegramBot(token, { polling: true });

// bot.on("message", (msg) => {
//   var Hi = "hi";
//   if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
//     console.log(msg.from);
//     bot.sendMessage(msg.from.id, "Hello,  " + msg.from.first_name + " 👋");
//   }

//   var markup = "markup";
//   if (msg.text.toString().toLowerCase().indexOf(markup) === 0) {
//     bot.sendMessage(
//       msg.chat.id,
//       '<b>bold</b> \n <i>italic</i> \n <em>italic with em</em> \n <a href="http://www.example.com/">inline URL</a> \n <code>inline fixed-width code</code> \n <pre>pre-formatted fixed-width code block</pre>',
//       { parse_mode: "HTML" }
//     );
//   }

//   var location = "location";
//   if (msg.text.toString().toLowerCase().indexOf(location) === 0) {
//     bot.sendLocation(msg.chat.id, 44.97108, -104.27719);
//     bot.sendMessage(msg.chat.id, "Here is the point");
//   }
// });

bot.on("callback_query", (msg) => {
  console.log(msg);
  if (msg.data === "register") {
    const isRegistered = data.filter((user) => user.userId === msg.from.id);
    if (isRegistered.length > 0) {
      bot.sendMessage(
        msg.from.id,
        "Вы уже зарегистрированы, " + msg.from.first_name
      );
      return;
      // data.users.push(msg.from.id);
    }

    data.push({
      userId: msg.from.id,
      first_name: msg.from.first_name,
      products: [],
    });

    bot.sendMessage(
      msg.from.id,
      "Спасибо за регистрацию,  " +
        msg.from.first_name +
        ", теперь вы можете использовать бота!"
    );
  }

  if (msg.data === "check") {
    bot.sendMessage(
      msg.from.id,
      "🤖🔎 Ищу акционные товары из вашего списка, ожидайте..."
    );
    console.log(`Поиск товаров для пользователя ${msg.from.first_name}`);
    const user = data.find((user) => user.userId === msg.from.id);

    if (user.length === 0) {
      bot.sendMessage(msg.from.id, "❌ Вы не авторизованы");
      return;
    }

    const userFavoriteProducts = user.products;

    const search = setTimeout(async () => {
      const res = await startScraping(userFavoriteProducts);

      const actionProducts = res
        .filter((prod) => typeof prod.value === "object")
        .map((prod) => {
          const { title, regularPrice, actionPrice, atbCardPrice, url, id } =
            prod.value;
          return `✅ <b>${title}</b> \n💲 Обычная цена: ${regularPrice} грн \n❗️ Цена по акции: ${actionPrice} \n${
            atbCardPrice !== "null"
              ? "⭐️ Цена с карточкой АТБ: " + atbCardPrice + " грн ⭐️ \n"
              : ""
          }🪪 id товара: ${id} \n🛒 ${url}`;
        })
        .join(" \n \n ");

      bot.sendMessage(
        msg.from.id,
        `${
          actionProducts.length > 0
            ? "Найдены следующие акционные товары: \n \n " + actionProducts
            : "Акционных товаров не найдено 🤷‍♂️"
        }`,
        // { parse_mode: "markdown" }
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    }, 0);

    // bot.sendPhoto(
    //   msg.from.id,
    //   "Эта кнопка еще в разработке, воспользуйтесь пожалуйста командой /check в меню."

    //   // '<b>bold</b> \n <i>italic</i> \n <em>italic with em</em> \n <a href="http://www.example.com/">inline URL</a> \n <code>inline fixed-width code</code> \n <pre>pre-formatted fixed-width code block</pre>',
    //   // { parse_mode: "HTML" }
    // );
  }
});

bot.onText(/\/start/, (msg) => {
  console.log(msg);
  const welcomeMessage = "Добро пожаловать, " + msg.from.first_name + "! 👋";

  bot.sendMessage(msg.chat.id, welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Регистрация!", callback_data: "register" },
          // { text: "Проверить акционные товары", callback_data: "check" },
        ],
        [{ text: "Проверить акционные товары.", callback_data: "check" }],
      ],
      // keyboard: [["Hi!", "Location"], ["Markup"]],
    },
  });
});

bot.onText(/\/check/, (msg) => {
  // console.log(msg);
  bot.sendMessage(
    msg.chat.id,
    "🤖🔎 Ищу акционные товары из вашего списка, ожидайте..."
  );
  console.log(`Поиск товаров для пользователя ${msg.from.first_name}`);
  const user = data.find((user) => user.userId === msg.from.id);

  if (user.length === 0) {
    bot.sendMessage(msg.chat.id, "❌ Вы не авторизованы");
    return;
  }

  const userFavoriteProducts = user.products;

  const search = setTimeout(async () => {
    const res = await startScraping(userFavoriteProducts);

    const actionProducts = res
      .filter((prod) => typeof prod.value === "object")
      .map((prod) => {
        const { title, regularPrice, actionPrice, atbCardPrice, url, id } =
          prod.value;
        return `✅ <b>${title}</b> \n💲 Обычная цена: ${regularPrice} грн \n❗️ Цена по акции: ${actionPrice} \n${
          atbCardPrice !== "null"
            ? "⭐️ Цена с карточкой АТБ: " + atbCardPrice + " грн ⭐️ \n"
            : ""
        }🪪 id товара: ${id} \n🛒 ${url}`;
      })
      .join(" \n \n ");

    bot.sendMessage(
      msg.chat.id,
      `${
        actionProducts.length > 0
          ? "Найдены следующие акционные товары: \n \n " + actionProducts
          : "Акционных товаров не найдено 🤷‍♂️"
      }`,
      // { parse_mode: "markdown" }
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
  }, 0);
});
