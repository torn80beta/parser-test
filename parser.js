const Nightmare = require("nightmare");
const favoriteProducts = require("./favorite-products");

const URL =
  "https://www.atbmarket.com/product/maska-dla-volossa-1l-kallos-pro-tox-cannabis-z-olieu-nasinna-konopli-keratta-vitamkompl";

const URL2 =
  "https://www.atbmarket.com/product/sokolad-300g-molocnij-milka-z-nacinkou-zi-smakom-vanili-ta-pecivom-oreo";

const urls = [URL, URL2];

// const selector = "#productMain";
// const selector = "#productMain data.product-price__top";
const regularPriceSelector = "#productMain data.product-price__bottom";
const actionPriceSelector = "#productMain data.product-price__top";
const actionMarker = "#productMain data.product-price__bottom";
const headerSelector = "#productMain h1.page-title";
const actionProducts = [];

// console.log(favoriteProducts);

const parser = async ({ url, id }) => {
  const nightmare = Nightmare();
  const selector = "#productMain";
  // console.log("обработка страницы, ", id);

  try {
    const result = await nightmare
      .goto(url)
      .wait("body")
      .evaluate((selector) => {
        const isAction = document.querySelector(
          "#productMain data.product-price__bottom"
        );
        // console.log(isAction);
        if (isAction) {
          const title = document.querySelector(
            "#productMain h1.page-title"
          ).innerText;

          const regularPrice = document.querySelector(
            "#productMain data.product-price__bottom"
          ).innerText;

          const actionPrice = document.querySelector(
            "#productMain data.product-price__top"
          ).innerText;

          let atbCardPrice = document.querySelector(
            "#productMain data.atbcard-sale__price-top"
          );

          if (atbCardPrice) {
            atbCardPrice = atbCardPrice.innerText;
          }

          // console.log(
          //   `Got action product: ${title}\n regular price: ${regularPrice}\n action price: ${actionPrice}\n ATB card price: ${atbCardPrice}`
          // );

          const response = {
            title: `${title}`,
            regularPrice: `${regularPrice}`,
            actionPrice: `${actionPrice}`,
            atbCardPrice: `${atbCardPrice}`,
          };

          return response;
        }

        throw new Error("");
      }, selector)
      .end()
      .then((res) => {
        // console.log("GOT ACTION PRODUCT!!!: ", res);
        return Promise.resolve(res);
      });

    return { ...result, url, id };
  } catch (error) {
    console.error("Search failed:", error.message);
    return error.message;
  }
};

const startScraping = async (arr) => {
  // setInterval(async () => {
  try {
    const results = await Promise.allSettled(arr.map(parser));
    console.log("All instances finished:", results);
    return results;
    // return JSON.stringify(results, null, 2);
  } catch (error) {
    console.error("An error occurred:", error);
    return error.message;
  }
  // }, 60000);
};

module.exports = startScraping;