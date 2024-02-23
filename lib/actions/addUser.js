const User = require("../models/user.js");

const addUser = async function ({ name, telegramUserId }) {
  try {
    const newUser = await User.create({
      name,
      telegramUserId,
    });

    return { status: 201, data: newUser };
  } catch (error) {
    const { message, status } = error;
    // console.log(message, status);
    return { message, status };
  }
};

module.exports = addUser;
