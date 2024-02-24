const userProductsMsg = (products, start) => {
  if (products.length === 0) {
    return "У вашому списку наразі немає товарів 🤷‍♂️";
  }

  const message = products
    .map(({ title, url, productCode }, index) => {
      return `${
        index + 1 + start
      } ✅ <b>${title}</b> \n🪪 Код товару: ${productCode} \n🛒 ${url}`;
    })
    .join("\n \n");

  return `${message}`;
};

module.exports = userProductsMsg;
