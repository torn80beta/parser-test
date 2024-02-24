const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../../helpers");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    telegramUserId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

module.exports = User;
