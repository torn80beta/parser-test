const { getSingleProduct } = require("../../cheerio.js");
const Product = require("../models/product.js");
const User = require("../models/user.js");

const addProduct = async ({ url, telegramUserId }) => {
  try {
    const user = await User.findOne({ telegramUserId });
    // console.log(user._id);

    const product = await getSingleProduct(url);
    // console.log(product);

    const { productCode, title, image } = product;
    const newProduct = await Product.create({
      productCode,
      url,
      title,
      image,
      owner: user._id,
    });
    console.log(newProduct);
    // return { status: 201, data: product };
    return product;
  } catch (error) {
    const { message, status } = error;
    console.log(message, status);
    return { message, status };
  }
};

module.exports = addProduct;
