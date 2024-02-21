const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
// const parser = require("./parser.js");
// const getProducts = require("./pw.js");
const { getProducts, addProduct } = require("./cheerio.js");
const format = require("date-fns").format;
const mongoose = require("mongoose");
const addUser = require("./lib/actions/addUser.js");

const data = require("./data.js");

const { DB_KEY } = process.env;

mongoose.set("strictQuery", true);

mongoose
  .connect(DB_KEY)
  .then(() => {
    console.log("Connection to database has been established");
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

const token = process.env.BOT_API_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("callback_query", async (msg) => {
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

    const startDate = new Date();

    console.log(
      `${format(startDate, "HH:mm:ss")} User ${
        msg.from.first_name
      } looking for products by photo...`
    );

    const userFavoriteProducts = user.products;

    setTimeout(async () => {
      const res = await getProducts(userFavoriteProducts);
      // console.log(res);

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
          caption: `✅ <b>${title}</b> \n💲 Звичайна ціна: ${regularPrice} грн \n❗️ Акційна ціна: ${actionPrice} грн \n${
            atbCardPrice !== "null"
              ? "⭐️ Ціна з карткою АТБ: " + atbCardPrice + " грн ⭐️ \n"
              : ""
          }🪪 Код товару: ${productCode} \n🛒 ${url}`,
          parse_mode: "HTML",
        };
      });

      const endDate = new Date();

      const diffTime = Math.abs(endDate - startDate);
      const isMinute =
        format(diffTime, "mm") === "00"
          ? ""
          : `<b>${format(diffTime, "mm")}<b> хвилин. : `;

      const calculateTimeMessage = `${
        isMinute + "<b>" + format(diffTime, "ss") + "</b>" + " секунд"
      }`;

      await bot.sendMessage(
        msg.from.id,
        `${
          actionProducts.length > 0
            ? `Пошук завершено за ${calculateTimeMessage}. \nОброблено товарів: <b>${userFavoriteProducts.length}</b>. Знайдені наступні акційні пропозиції: \n \n `
            : "Пошук завершено, акційних товарів за вашим списком не знайдено 🤷‍♂️"
        }`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );

      bot.sendMediaGroup(msg.from.id, (media = mediaGroup));
      console.log(
        `Process completed for user ${msg.from.first_name} in ${format(
          diffTime,
          "mm:ss"
        )}, ${userFavoriteProducts.length} were processed. ${
          actionProducts.length
        } products found.`
      );
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

    const startDate = new Date();

    console.log(
      `${format(startDate, "HH:mm:ss")} User ${
        msg.from.first_name
      } looking for products by list...`
    );

    const userFavoriteProducts = user.products;

    setTimeout(async () => {
      const res = await getProducts(userFavoriteProducts);
      // console.log(res);

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

          return `✅ <b>${title}</b> \n💲 Звичайна ціна: ${regularPrice} грн \n❗️ Акційна ціна: ${actionPrice} грн \n${
            atbCardPrice !== "null"
              ? "⭐️ Ціна з карткою АТБ: " + atbCardPrice + " грн ⭐️ \n"
              : ""
          }🪪 Код товару: ${productCode} \n🛒 ${url}`;
        })
        .join("\n \n");

      const endDate = new Date();

      const diffTime = Math.abs(endDate - startDate);

      const isMinute =
        format(diffTime, "mm") === "00"
          ? ""
          : `<b>${format(diffTime, "mm")}<b> хвилин. : `;

      const calculateTimeMessage = `${
        isMinute + "<b>" + format(diffTime, "ss") + "</b>" + " секунд"
      }`;

      await bot.sendMessage(
        msg.from.id,
        `${
          actionProducts.length > 0
            ? `Пошук завершено за ${calculateTimeMessage}. \nОброблено товарів: <b>${userFavoriteProducts.length}</b>. Знайдені наступні акційні пропозиції: \n \n ` +
              message
            : "Пошук завершено, акційних товарів за вашим списком не знайдено 🤷‍♂️"
        }`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );

      console.log(
        `Process completed for user ${msg.from.first_name} in ${format(
          diffTime,
          "mm:ss"
        )}, ${userFavoriteProducts.length} were processed. ${
          actionProducts.length
        } products found.`
      );
    }, 0);
  }

  if (msg.data === "add") {
    // bot.sendMessage(msg.from.id, "🤖 Ця функція наразі у розробці");
    // console.log(msg.from);

    const name = msg.from.first_name;
    const telegramUserId = msg.from.id;

    const user = await addUser({ name, telegramUserId });
    console.log(user);
    // if (user.status === 409) {
    //   await bot.sendMessage(msg.from.id, "🤖 Ви вже зареєстровані");
    // }

    const productPrompt = await bot.sendMessage(
      msg.from.id,
      "Введіть посилання на товар який ви хочете додати: ",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );

    bot.onReplyToMessage(
      msg.from.id,
      productPrompt.message_id,
      async (nameMsg) => {
        const url = nameMsg.text;
        console.log(nameMsg);
        // save name in DB if you want to ...
        await bot.sendMessage(
          msg.from.id,
          `Ви додали наступний товар: ${url}!`
        );
      }
    );
  }

  if (msg.data === "delete") {
    console.log(msg.from);
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

/* Media model to send via sendMediaGroup */
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
