const Product = require("../models/product.js");

const getUserProducts = async (userId) => {
  console.log(userId);
  try {
    const userFavoriteProducts = await Product.find({ owner: userId });
    // console.log(userFavoriteProducts);

    return userFavoriteProducts;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getUserProducts;
