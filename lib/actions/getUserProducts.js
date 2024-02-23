const User = require("../models/user.js");
const Product = require("../models/product.js");

const getUserProducts = async ({ telegramUserId, bot }) => {
  try {
    const user = await User.findOne({ telegramUserId });
    // console.log(user);
    if (!user) {
      await bot.sendMessage(
        telegramUserId,
        "Ви ще не додавали товарів у свій список. Якщо скористаєтесь опцією 'Список акцій' або 'Фото акцій' ви отримаєте товари із випадкового списку щоб ви могли побачити як працює бот."
      );
      return;
    }

    const userFavoriteProducts = await Product.find({ owner: user._id });
    // console.log(userFavoriteProducts);

    return userFavoriteProducts;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getUserProducts;
