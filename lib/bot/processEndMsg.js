const processEndMsg = ({
  actionProducts,
  time,
  userFavoriteProducts,
  message = "",
}) => {
  const msg = `${
    actionProducts.length > 0
      ? `Пошук завершено за ${time}. \nОброблено товарів: <b>${userFavoriteProducts.length}</b>. Знайдені наступні акційні пропозиції: \n \n ` +
        message
      : "Пошук завершено, акційних товарів за вашим списком не знайдено 🤷‍♂️"
  }`;

  return msg;
};

module.exports = processEndMsg;
