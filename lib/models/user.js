const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../../helpers");

const productSchema = new Schema(
  {
    productCode: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    telegramUserId: {
      type: String,
      required: true,
    },
    products: {
      type: [productSchema],
      required: true,
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

module.exports = User;
