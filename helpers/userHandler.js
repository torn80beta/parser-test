const userHandler = ({ bot, msg, data }) => {
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

    return user.products.length;
  }

  bot.sendMessage(
    msg.from.id,
    "🤖🔎 Пошук акційних товарів за списком, очикуйте..."
  );
  // console.log(user);
  return user;
};

module.exports = userHandler;
