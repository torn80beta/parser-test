const createMediaGroup = async (products) => {
  try {
    const mediaGroup = await products.map((prod) => {
      const {
        image,
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

      return {
        type: "photo",
        media: image,
        caption: `✅ <b>${title}</b> \n💲 Звичайна ціна: ${regularPrice} грн ${isActionPrice} ${isAtbCardPrice} \n🪪 Код товару: ${productCode} \n🛒 ${url}`,
        parse_mode: "HTML",
      };
    });

    return mediaGroup;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = createMediaGroup;
