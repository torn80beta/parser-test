async function parseProducts(arr, getProducts) {
  // console.log(arr);
  const fetchedProducts = [];
  for (let i = 0; i < arr.length; ++i) {
    let fetchedProduct = await getProducts(arr[i]);
    fetchedProducts.push(fetchedProduct);
  }

  return fetchedProducts;
}

module.exports = parseProducts;
