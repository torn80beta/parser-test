const Nightmare = require("nightmare");
const favoriteProducts = require("./favorite-products");

const nightmare = Nightmare();

const URL =
  "https://www.atbmarket.com/product/maska-dla-volossa-1l-kallos-pro-tox-cannabis-z-olieu-nasinna-konopli-keratta-vitamkompl";

const URL2 =
  "https://www.atbmarket.com/product/sokolad-300g-molocnij-milka-z-nacinkou-zi-smakom-vanili-ta-pecivom-oreo";

// const selector = "#productMain";
// const selector = "#productMain data.product-price__top";
const regularPriceSelector = "#productMain data.product-price__bottom";
const actionPriceSelector = "#productMain data.product-price__top";
const actionMarker = "#productMain data.product-price__bottom";
const headerSelector = "#productMain h1.page-title";
const actionProducts = [];

// console.log(favoriteProducts);

const parser = async (url) => {
  const selector = "#productMain";
  const result = await nightmare
    .goto(url)
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

        return `Got action product: ${title}\n regular price: ${regularPrice}\n action price: ${actionPrice}`;
      }
      // return "No action";
      throw new Error("No action");
    }, selector)
    .end()
    .then((text) => {
      console.log(text);
    })
    .catch((error) => {
      console.error("Search failed:", error.message);
    });
};

async function main() {
  // setTimeout(() => {
  parser(URL2);
  // }, 0);

  setTimeout(() => {
    parser(URL);
  }, 5000);
}

main();

// parser(URL);

// parser(URL2);

// nightmare
//   .goto(URL)
//   .evaluate((selector) => {
//     const isAction = document.querySelector(
//       "#productMain data.product-price__bottom"
//     );
//     if (isAction) {
//       // actionProducts.push({
//       //   title: `${
//       //     document.querySelector("#productMain h1.page-title").innerText
//       //   }`,
//       //   price: `${
//       //     document.querySelector("#productMain data.product-price__bottom")
//       //       .innerText
//       //   }`,
//       // });

//       const title = document.querySelector(
//         "#productMain h1.page-title"
//       ).innerText;
//       const regularPrice = document.querySelector(
//         "#productMain data.product-price__bottom"
//       ).innerText;
//       const actionPrice = document.querySelector(
//         "#productMain data.product-price__top"
//       ).innerText;

//       return `Got action product: ${title}\n regular price: ${regularPrice}\n action price: ${actionPrice}`;
//     }
//     // if (selector) {
//     //   actionProducts.push({
//     //     title: `${document.querySelector(headerSelector).innerText}`,
//     //     price: `${document.querySelector(actionMarker).innerText}`,
//     //   });
//     // }
//     // console.log(actionProducts);
//     // return document.querySelector(selector).innerHTML;
//     throw new Error("No action");
//   }, selector)
//   .end()
//   .then((text) => {
//     // actionProducts.push(text);
//     // console.log(actionProducts);
//     console.log(text);
//   })
//   .catch((error) => {
//     // if (error) {
//     //   console.error("GOT ERROR!!!");
//     // }
//     console.error("Search failed:", error.message);
//   });
