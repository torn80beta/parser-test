const searchMessageHandler = async ({ bot, msg, Product, User }) => {
  const user = await User.findOne({ telegramUserId: msg.from.id });
  if (!user) {
    await bot.sendMessage(
      msg.from.id,
      "🤖 Ви ще ніколи не додавали товарів до свого списку, тому вам будуть відображені випадкові товари для ознайомлення..."
    );
  }

  const userId = user
    ? { owner: user._id }
    : { owner: "65dc54077ed416f76714ef0d" };

  const userFavoriteProducts = await Product.find(userId).sort({
    title: "asc",
  });

  if (userFavoriteProducts.length === 0) {
    await bot.sendMessage(msg.from.id, "❌ У вашому списку немає товарів");

    return;
  }

  await bot.sendMessage(
    msg.from.id,
    `🔎 Пошук акційних товарів за списком, очикуйте... \nКількість товарів у вашому списку: <b>${
      userFavoriteProducts.length
    }</b> \nПриблизний час обробки вашого списку: ${Math.floor(
      userFavoriteProducts.length / 1.9
    )} сек.`,
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }
  );

  return userFavoriteProducts;
};

module.exports = searchMessageHandler;
