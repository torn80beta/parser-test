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
    owner: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

productSchema.post("save", handleMongooseError);

const Product = model("product", productSchema);

module.exports = Product;
