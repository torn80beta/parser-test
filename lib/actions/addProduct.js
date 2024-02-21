const { getSingleProduct } = require("../../cheerio.js");

const addProduct = async (url) => {
  try {
    const product = await getSingleProduct(url);
    return product;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = addProduct;
