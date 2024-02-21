const { getSingleProduct } = require("../actions/getSingleProduct.js");

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
