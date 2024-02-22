const User = require("../models/user.js");
// const { httpError } = require("../../helpers");

const addUser = async function ({ name, telegramUserId }) {
  try {
    // const user = await User.findOne({ telegramUserId });

    // if (user) {
    //   throw httpError(409, "User already exists");
    // }

    const newUser = await User.create({
      name,
      telegramUserId,
    });

    return { status: 201, data: newUser };
  } catch (error) {
    const { message, status } = error;
    // console.log(message, status);
    return { message, status };
    // throw new Error(`Failed to create node: ${error.message}`);
  }
};

module.exports = addUser;
