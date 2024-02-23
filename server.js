const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const { getProducts } = require("./cheerio.js");
const format = require("date-fns").format;
const mongoose = require("mongoose");
const { addUser, addProduct } = require("./lib/actions");
const {
  createMediaGroup,
  productsListMsg,
  processEndMsg,
  userProductsMsg,
} = require("./lib/bot");
const {
  timeMessage,
  endProcessMessage,
  startProcessMessage,
  userHandler,
} = require("./helpers");
const User = require("./lib/models/user.js");
const Product = require("./lib/models/product.js");

// const data = require("./data.js");

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

  /* GET USER'S PRODUCT LIST */

  if (msg.data === "mylist") {
    const telegramUserId = msg.from.id;
    const user = await User.findOne({ telegramUserId });
    // console.log(user);
    if (!user) {
      await bot.sendMessage(
        telegramUserId,
        "Ви ще не додавали товарів у свій список. Якщо скористаєтесь опцією 'Список акцій' або 'Фото акцій' ви отримаєте товари із випадкового списку щоб ви могли побачити як працює бот."
      );
      return;
    }

    const products = await Product.find({ owner: user._id });

    await bot.sendMessage(msg.from.id, userProductsMsg(products), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  }

  /* SEARCH PRODUCTS WITH PHOTO */

  if (msg.data === "photo") {
    const userFavoriteProducts = await userHandler({
      bot,
      msg,
      Product,
      User,
    });

    if (!userFavoriteProducts) return;

    setTimeout(async () => {
      const startDate = new Date();

      startProcessMessage({ startDate, msg });

      const fetchedProducts = await getProducts(userFavoriteProducts);

      const actionProducts = fetchedProducts.filter(
        (prod) => prod.value.action
      );

      const mediaGroup = await createMediaGroup(actionProducts);

      const time = timeMessage(startDate);

      await bot.sendMessage(
        msg.from.id,
        processEndMsg({ actionProducts, time, userFavoriteProducts }),
        { parse_mode: "HTML", disable_web_page_preview: true }
      );

      bot.sendMediaGroup(msg.from.id, (media = mediaGroup));

      endProcessMessage({
        startDate,
        userFavoriteProducts,
        actionProducts,
        msg,
      });
    }, 0);
  }

  /* SEARCH PRODUCTS WITH LIST */

  if (msg.data === "list") {
    const userFavoriteProducts = await userHandler({ bot, msg, Product, User });

    if (!userFavoriteProducts) return;

    setTimeout(async () => {
      const startDate = new Date();

      startProcessMessage({ startDate, msg });

      const fetchedProducts = await getProducts(userFavoriteProducts);

      const actionProducts = fetchedProducts.filter(
        (prod) => prod.value.action
      );

      const message = productsListMsg(actionProducts);

      const time = timeMessage(startDate);

      await bot.sendMessage(
        msg.from.id,
        processEndMsg({ actionProducts, time, userFavoriteProducts, message }),
        { parse_mode: "HTML", disable_web_page_preview: true }
      );

      endProcessMessage({
        startDate,
        userFavoriteProducts,
        actionProducts,
        msg,
      });
    }, 0);
  }

  /* ADD PRODUCT */

  if (msg.data === "add") {
    const name = msg.from.first_name;
    const telegramUserId = msg.from.id;

    await addUser({ name, telegramUserId });

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
        const url = `https://www.atbmarket.com/product/${nameMsg.text}`;
        const product = await addProduct({ url, telegramUserId });
        // console.log(product);
        const mediaGroup = await createMediaGroup([{ value: product }]);

        await bot.sendMessage(msg.from.id, `Ви додали наступний товар:`);
        await bot.sendMediaGroup(msg.from.id, (media = mediaGroup));

        console.log(
          `${format(new Date(), "HH:mm:ss")} Product added to ${
            msg.from.first_name
          } user's list`
        );
        console.log(product);
      }
    );
  }

  /* DELETE PRODUCT */

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
