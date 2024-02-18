const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const parser = require("./parser.js");
const data = require("./data.js");

const token = process.env.BOT_API_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("callback_query", (msg) => {
  // console.log(msg);
  if (msg.data === "mylist") {
    const isRegistered = data.filter((user) => user.userId === msg.from.id);
    if (isRegistered.length === 0) {
      bot.sendMessage(
        msg.from.id,
        "Ви ще не додавали товарів у свій список. Якщо скористаєтесь опцією 'Список акцій' або 'Фото акцій' ви отримаєте товари із випадкового списку щоб ви могли побачити як працює бот."
      );
      return;
    }

    bot.sendMessage(msg.from.id, "🤖 Ця опція наразі у розробці");
  }

  if (msg.data === "photo") {
    let user = data.find((user) => user.userId === msg.from.id);

    if (!user) {
      bot.sendMessage(
        msg.from.id,
        "🤖 Ви ще ніколи не додавали товарів до свого списку, тому вам будуть відображені випадкові товари для ознайомлення..."
      );
      user = data[0];
    }

    if (user.products.length === 0) {
      bot.sendMessage(msg.from.id, "❌ У вашому списку немає товарів");
      return;
    }

    bot.sendMessage(
      msg.from.id,
      "🤖🔎 Пошук акційних товарів за списком, очикуйте..."
    );
    console.log(`User ${msg.from.first_name} looking for products by photo...`);

    const userFavoriteProducts = user.products;

    const getProducts = setTimeout(async () => {
      // const res = await startScraping(userFavoriteProducts);
      const res = await Promise.allSettled(userFavoriteProducts.map(parser));

      // const actionProducts = res.filter(
      //   (prod) => typeof prod.value === "object"
      // );

      const actionProducts = res.filter((prod) => prod.value.action);

      const mediaGroup = await actionProducts.map((prod) => {
        const {
          image,
          title,
          regularPrice,
          actionPrice,
          atbCardPrice,
          url,
          productCode,
        } = prod.value;
        return {
          type: "photo",
          media: image,
          caption: `✅ <b>${title}</b> \n💲 Звичайна ціна: ${regularPrice} грн \n❗️ Акційна ціна: ${actionPrice} \n${
            atbCardPrice !== "null"
              ? "⭐️ Ціна з карткою АТБ: " + atbCardPrice + " грн ⭐️ \n"
              : ""
          }🪪 Код товару: ${productCode} \n🛒 ${url}`,
          parse_mode: "HTML",
        };
      });

      bot.sendMessage(
        msg.from.id,
        `${
          actionProducts.length > 0
            ? "Пошук завершено, знайдені наступні акційні товари: \n \n "
            : "Пошук завершено, акційних товарів за вашим списком не знайдено 🤷‍♂️"
        }`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );

      bot.sendMediaGroup(msg.from.id, (media = mediaGroup));
      return;
    }, 0);
  }

  if (msg.data === "list") {
    let user = data.find((user) => user.userId === msg.from.id);

    if (!user) {
      bot.sendMessage(
        msg.from.id,
        "🤖 Ви ще ніколи не додавали товарів до свого списку, тому вам будуть відображені випадкові товари для ознайомлення..."
      );
      user = data[0];
    }

    if (user.products.length === 0) {
      bot.sendMessage(msg.from.id, "❌ У вашому списку немає товарів");
      return;
    }

    bot.sendMessage(
      msg.from.id,
      "🤖🔎 Пошук акційних товарів за списком, очикуйте..."
    );
    console.log(`User ${msg.from.first_name} looking for products by list...`);

    const userFavoriteProducts = user.products;

    setTimeout(async () => {
      const res = await Promise.allSettled(userFavoriteProducts.map(parser));
      console.log(res);
      const actionProducts = res.filter((prod) => prod.value.action);

      const message = actionProducts
        .map((prod) => {
          const {
            title,
            regularPrice,
            actionPrice,
            atbCardPrice,
            url,
            productCode,
          } = prod.value;

          return `✅ <b>${title}</b> \n💲 Звичайна ціна: ${regularPrice} грн \n❗️ Акційна ціна: ${actionPrice} \n${
            atbCardPrice !== "null"
              ? "⭐️ Ціна з карткою АТБ: " + atbCardPrice + " грн ⭐️ \n"
              : ""
          }🪪 Код товару: ${productCode} \n🛒 ${url}`;
        })
        .join("\n \n");

      bot.sendMessage(
        msg.from.id,
        `${
          actionProducts.length > 0
            ? "Пошук завершено, знайдені наступні акційні товари: \n \n" +
              message
            : "Пошук завершено, акційних товарів за вашим списком не знайдено 🤷‍♂️"
        }`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    }, 0);
  }

  if (msg.data === "add") {
    bot.sendMessage(msg.from.id, "🤖 Ця функція наразі у розробці");
  }

  if (msg.data === "delete") {
    bot.sendMessage(msg.from.id, "🤖 Ця функція наразі у розробці");
  }
});

bot.onText(/\/start/, (msg) => {
  // console.log(msg);
  const welcomeMessage = "Вітаю, " + msg.from.first_name + "! 👋";

  bot.sendMessage(msg.chat.id, welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝  Мій список товарів", callback_data: "mylist" }],
        [
          {
            text: "✅  Додати товар",
            callback_data: "add",
          },
          {
            text: "❌  Видалити товар",
            callback_data: "delete",
          },
        ],
        [
          {
            text: "🛒 Фото акцій",
            callback_data: "photo",
          },
          {
            text: "🛒 Список акцій",
            callback_data: "list",
          },
        ],
      ],
    },
  });
});

// bot.onText(/\/check/, (msg) => {
//   // console.log(msg);
//   bot.sendMessage(
//     msg.chat.id,
//     "🤖🔎 Пошук акційних товарів за вашим списком, очикуйте..."
//   );
//   console.log(`User ${msg.from.first_name} looking for products...`);
//   const user = data.find((user) => user.userId === msg.from.id);

//   if (user.length === 0) {
//     bot.sendMessage(msg.chat.id, "❌ У вашому списку немає товарів");
//     return;
//   }

//   const userFavoriteProducts = user.products;

//   const search = setTimeout(async () => {
//     const res = await startScraping(userFavoriteProducts);

//     const actionProducts = res
//       .filter((prod) => typeof prod.value === "object")
//       .map((prod) => {
//         const { title, regularPrice, actionPrice, atbCardPrice, url, id } =
//           prod.value;
//         return `✅ <b>${title}</b> \n💲 Звичайна ціна: ${regularPrice} грн \n❗️ Акційна ціна: ${actionPrice} \n${
//           atbCardPrice !== "null"
//             ? "⭐️ Ціна з карткою АТБ: " + atbCardPrice + " грн ⭐️ \n"
//             : ""
//         }🪪 Код товару: ${id} \n🛒 ${url}`;
//       })
//       .join(" \n \n ");

//     bot.sendMessage(
//       msg.chat.id,
//       `${
//         actionProducts.length > 0
//           ? "Пошук завершено, знайдені наступні акційні товари: \n \n " +
//             actionProducts
//           : "Пошук завершено, акційних товарів за вашим списком не знайдено 🤷‍♂️"
//       }`,
//       // { parse_mode: "markdown" }
//       { parse_mode: "HTML", disable_web_page_preview: true }
//     );
//   }, 0);
// });

// (media = [
//   {
//     type: "photo",
//     media:
//       "https://media.cnn.com/api/v1/images/stellar/prod/230719152236-04-how-to-stop-the-next-cuban-missile-crisis.jpg?c=16x9&q=h_720,w_1280,c_fill/f_webp",
//     thumbnail:
//       "https://www.atbmarket.com/product/sir-kislomolocnij-350-g-ukrainskij-nezirnij-pet",
//     caption: "test1",
//   },
//   {
//     type: "photo",
//     media:
//       "https://media.cnn.com/api/v1/images/stellar/prod/230719152208-03-how-to-stop-the-next-cuban-missile-crisis.jpg?c=16x9&q=h_720,w_1280,c_fill/f_webp",
//     thumbnail: "",
//     caption: "test2",
//     parse_mode: "HTML",
//     // has_spoiler: true,
//   },
// ])
