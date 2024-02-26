const User = require("../models/user.js");

const deleteProduct = async ({ productCode, telegramUserId }) => {
  try {
    const user = await User.findOne({ productCode });
    // console.log(user);
  } catch (error) {
    console.log(error);
  }
};

module.exports = deleteProduct;
