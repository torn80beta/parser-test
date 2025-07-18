async function chunkProducts(data) {
  let tmpProducts = data;
  const chunked = [];

  for (let i = 0; i < tmpProducts.length; i += 10) {
    chunked.push(tmpProducts.slice(i, i + 10));
  }

  return chunked;
}

module.exports = chunkProducts;
