const { getSingleProduct } = require("../../cheerio.js");
const Product = require("../models/product.js");
const User = require("../models/user.js");

const addProduct = async ({ url, telegramUserId }) => {
  try {
    const user = await User.findOne({ telegramUserId });

    const product = await getSingleProduct(url);

    const { productCode, title, image } = product;

    const isProductExist = await Product.findOne({ productCode });

    if (!isProductExist) {
      const newProduct = await Product.create({
        productCode,
        url,
        title,
        image,
        owner: user._id,
      });
      console.log(`Product created: ${newProduct}`);
      return { value: product, status: 201 };
      // return { status: 201, data: newProduct };
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { productCode: productCode },
      {
        $addToSet: { owner: user._id },
      },
      { new: true }
    );
    console.log(`Product updated: ${updatedProduct}`);
    return { value: product, status: 201 };
    // return { status: 201, data: updatedProduct };
  } catch (error) {
    const { message, status } = error;
    console.log(`Error message: ${message} \nStatus: ${status}`);
    return { message, status };
  }
};

module.exports = addProduct;
