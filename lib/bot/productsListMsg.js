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

      const isActionPrice =
        actionPrice !== "null" ? `\n❗️ Акційна ціна: ${actionPrice} грн` : "";

      const isAtbCardPrice =
        atbCardPrice !== "null"
          ? `\n⭐️ Ціна з карткою АТБ: ${atbCardPrice} грн ⭐️`
          : "";

      return `✅ <b>${title}</b> \n💲 Звичайна ціна: ${regularPrice} грн ${isActionPrice} ${isAtbCardPrice} \n🪪 Код товару: ${productCode} \n🛒 ${url}`;
    })
    .join("\n \n");

  return message;
};

module.exports = productsListMsg;
