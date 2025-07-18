const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const { getProducts } = require("./parser.js");
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
  searchMessageHandler,
  urlHandler,
  chunkProducts,
  parseProducts,
} = require("./helpers");
const User = require("./lib/models/user.js");
const Product = require("./lib/models/product.js");

/* TPM DATA */
const tpm_data = require("./data.js");

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
  /* GET USER'S PRODUCT LIST */

  if (msg.data === "mylist") {
    const telegramUserId = msg.from.id;
    const user = await User.findOne({ telegramUserId });

    if (!user) {
      await bot.sendMessage(
        telegramUserId,
        "🤖 Ви ще не додавали товарів у свій список. Якщо скористаєтесь опцією 'Список акцій' або 'Фото акцій' ви отримаєте товари із випадкового списку щоб ви могли побачити як працює бот."
      );
      return;
    }

    const products = await Product.find({ owner: user._id }).sort({
      title: "asc",
    });

    if (products.length === 0) {
      await bot.sendMessage(msg.from.id, "🤖 У вашому списку немає товарів.");

      return;
    }

    await bot.sendMessage(
      msg.from.id,
      `🤖 Кількість товарів у вашому списку: <b>${products.length}</b>.`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }
    );

    const messageParts = Math.ceil(products.length / 20);

    for (let i = 0; i < messageParts; i++) {
      const start = i * 2 * 10;
      const end = start + 20;
      const partialList = products.slice(start, end);

      await bot.sendMessage(msg.from.id, userProductsMsg(partialList, start), {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    }
  }

  /* SEARCH PRODUCTS WITH PHOTO */

  if (msg.data === "photo") {
    let userFavoriteProducts = await searchMessageHandler({
      bot,
      msg,
      Product,
      User,
    });

    /*  TEST start */
    // let userFavoriteProducts = tpm_data[2].products;
    // console.log(userFavoriteProducts.length);
    /*  TEST end */

    if (!userFavoriteProducts || userFavoriteProducts.length === 0) {
      await bot.sendMessage(msg.from.id, "🤖 У вашому списку немає товарів.");

      return;
    }

    setTimeout(async () => {
      const startDate = new Date();

      startProcessMessage({ startDate, msg, searchBy: "photo" });

      const chunkedProducts = await chunkProducts(userFavoriteProducts);
      // console.log("chunkedProducts:", chunkedProducts);

      const chunkedActionProducts = await parseProducts(
        chunkedProducts,
        getProducts
      );
      // console.log("actionProducts:", chunkedActionProducts);

      userFavoriteProducts = chunkedActionProducts.flat();

      const actionProducts = userFavoriteProducts.filter(
        (prod) => prod.value.action
      );

      const time = timeMessage(startDate);

      await bot.sendMessage(
        msg.from.id,
        processEndMsg({ actionProducts, time, userFavoriteProducts }),
        { parse_mode: "HTML", disable_web_page_preview: true }
      );

      const messageParts = Math.ceil(actionProducts.length / 10);

      for (let i = 0; i < messageParts; i++) {
        const start = i * 10;
        const end = start + 10;
        const partialList = actionProducts.slice(start, end);

        const mediaGroup = await createMediaGroup(partialList);

        await bot.sendMediaGroup(msg.from.id, (media = mediaGroup));
      }

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
    const userFavoriteProducts = await searchMessageHandler({
      bot,
      msg,
      Product,
      User,
    });

    if (!userFavoriteProducts) return;

    setTimeout(async () => {
      const startDate = new Date();

      startProcessMessage({ startDate, msg, searchBy: "list" });

      const fetchedProducts = await getProducts(userFavoriteProducts);

      const actionProducts = fetchedProducts.filter(
        (prod) => prod.value.action
      );

      const time = timeMessage(startDate);

      await bot.sendMessage(
        msg.from.id,
        processEndMsg({
          actionProducts,
          time,
          userFavoriteProducts,
        }),
        { parse_mode: "HTML", disable_web_page_preview: true }
      );

      const messageParts = Math.ceil(actionProducts.length / 10);

      for (let i = 0; i < messageParts; i++) {
        const start = i * 10;
        const end = start + 10;
        const partialList = actionProducts.slice(start, end);

        const message = productsListMsg(partialList);

        await bot.sendMessage(msg.from.id, message, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      }

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
      '🤖 Щоб додати товар до вашого списку, знайдіть його <a href="https://www.atbmarket.com/">на сайті АТБ</a> , скопіюйте посилання з адресного рядка і відправте його у відповідь на це повідомлення. ',
      {
        reply_markup: {
          force_reply: true,
        },
        parse_mode: "HTML",
      }
    );

    await bot.onReplyToMessage(
      msg.from.id,
      productPrompt.message_id,
      async (nameMsg) => {
        console.log(
          `${format(new Date(), "HH:mm:ss")} User${
            msg.from.first_name
          } trying to add product: ${nameMsg.text}`
        );

        const url = await urlHandler(nameMsg.text);
        const product = await addProduct({ url, telegramUserId });

        if (!url || product.status !== 201) {
          await bot.sendMessage(
            msg.from.id,
            `❌ Посилання не валідне! Перевірте і спробуйте ще раз.`
          );
          return;
        }

        const mediaGroup = await createMediaGroup([{ value: product.value }]);

        await bot.sendMessage(msg.from.id, `✅ Ви додали наступний товар:`);
        await bot.sendMediaGroup(msg.from.id, (media = mediaGroup));

        console.log(
          `${format(new Date(), "HH:mm:ss")} Product added to ${
            msg.from.first_name
          } user's list`
        );
      }
    );
  }

  /* DELETE PRODUCT */

  if (msg.data === "delete") {
    const user = await User.findOne({ telegramUserId: msg.from.id });

    if (!user) {
      bot.sendMessage(msg.from.id, "🤖 У вашому списку немає товарів.");
      return;
    }

    const prompt = await bot.sendMessage(
      msg.from.id,
      "🤖 Введіть код товару який ви хочете видалити: ",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );

    await bot.onReplyToMessage(msg.from.id, prompt.message_id, async (msg) => {
      const productToUpdate = await Product.findOne({
        productCode: msg.text,
      });

      if (!productToUpdate) {
        await bot.sendMessage(
          msg.from.id,
          "❌ Такого товару не знайдено. Перевірте код і наявність цього товару у вашому списку і спробуйте ще раз."
        );
        return;
      }

      await productToUpdate.owner.pull({
        _id: user._id,
      });
      await productToUpdate.save();

      if (productToUpdate.owner.length === 0) {
        await Product.deleteOne({ _id: productToUpdate._id });
      }

      await bot.sendMessage(msg.from.id, `✅ Товар успішно видалено.`);
    });
  }
});

bot.onText(/\/start/, (msg) => {
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
