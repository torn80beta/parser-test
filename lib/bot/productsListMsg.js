const productsListMsg = (actionProducts) => {
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

  return message;
};

module.exports = productsListMsg;
