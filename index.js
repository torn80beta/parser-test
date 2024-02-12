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

const parser = async ({ url }) => {
  const nightmare = Nightmare();
  const selector = "#productMain";

  try {
    const result = await nightmare
      .goto(url)
      .wait("body")
      .evaluate((selector) => {
        const isAction = document.querySelector(
          "#productMain data.product-price__bottom"
        );
        console.log(isAction);
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

          console.log(
            `Got action product: ${title}\n regular price: ${regularPrice}\n action price: ${actionPrice}`
          );

          const response = {
            title: `${title}`,
            regularPrice: `${regularPrice}`,
            actionPrice: `${actionPrice}`,
          };

          return response;
        }

        throw new Error("No action");
      }, selector)
      .end()
      .then((res) => {
        // console.log("GOT ACTION PRODUCT!!!: ", res);
        return Promise.resolve(res);
      });

    return { ...result, url };
  } catch (error) {
    // console.error("Search failed:", error.message);
    return error.message;
  }
};

const startScraping = async (arr) => {
  // setInterval(async () => {
  try {
    const results = await Promise.allSettled(arr.map(parser));
    console.log("All instances finished:", results);
  } catch (error) {
    console.error("An error occurred:", error);
  }
  // }, 60000);
};

startScraping(favoriteProducts);
