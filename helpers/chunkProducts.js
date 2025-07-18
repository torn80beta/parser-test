const { CONCURRENCY_LIMIT } = require("../parser.js");

async function chunkProducts(data) {
  let tmpProducts = data;
  const chunked = [];

  for (let i = 0; i < tmpProducts.length; i += CONCURRENCY_LIMIT) {
    chunked.push(tmpProducts.slice(i, i + CONCURRENCY_LIMIT));
  }

  return chunked;
}

module.exports = chunkProducts;
