const userHandler = async ({ bot, msg, Product, User }) => {
  const user = await User.findOne({ telegramUserId: msg.from.id });
  if (!user) {
    await bot.sendMessage(
      msg.from.id,
      "🤖 Ви ще ніколи не додавали товарів до свого списку, тому вам будуть відображені випадкові товари для ознайомлення..."
    );
    // return;
  }

  // const userId = user ? { owner: user._id } : { telegramUserId: "5146306180" };
  const userId = user
    ? { owner: user._id }
    : { owner: "65d88faba601143e00fd9342" };
  // console.log(userId);

  const userFavoriteProducts = await Product.find(userId);

  if (userFavoriteProducts.length === 0) {
    await bot.sendMessage(msg.from.id, "❌ У вашому списку немає товарів");

    return;
  }

  await bot.sendMessage(
    msg.from.id,
    "🤖🔎 Пошук акційних товарів за списком, очикуйте..."
  );

  return userFavoriteProducts;
};

module.exports = userHandler;
