const playwright = require("playwright");
// async function main() {
//   const browser = await playwright.chromium.launch({
//     headless: true, // set this to true
//   });

//   const page = await browser.newPage();
//   await page.goto("https://finance.yahoo.com/world-indices");
//   const market = await page.$eval("#YDC-Lead-Stack-Composite", (headerElm) => {
//     const data = [];
//     const listElms = headerElm.getElementsByTagName("li");
//     Array.from(listElms).forEach((elm) => {
//       data.push(elm.innerText.split("\n"));
//     });
//     return data;
//   });

//   console.log("Market Composites--->>>>", market);
//   await page.waitForTimeout(5000); // wait
//   await browser.close();
// }

// main();

// async function mostActive() {
//   const browser = await playwright.chromium.launch({
//     headless: true, // set this to true
//   });

//   const page = await browser.newPage();
//   await page.goto("https://finance.yahoo.com/most-active?count=100");
//   const mostActive = await page.$eval(
//     "#fin-scr-res-table tbody",
//     (tableBody) => {
//       let all = [];
//       for (let i = 0, row; (row = tableBody.rows[i]); i++) {
//         let stock = [];
//         for (let j = 0, col; (col = row.cells[j]); j++) {
//           stock.push(row.cells[j].innerText);
//         }
//         all.push(stock);
//       }
//       return all;
//     }
//   );

//   console.log("Most Active", mostActive);
//   await page.waitForTimeout(30000); // wait
//   await browser.close();
// }

// mostActive();

const parser = async ({ url }) => {
  const browser = await playwright.firefox.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url);

  const productMain = await page.$eval("#productMain", (productMain) => {
    const isAction = document.querySelector(
      "#productMain data.product-price__bottom"
    );

    if (!isAction) {
      return {
        action: false,
      };
    }
    const title = document.querySelector("h1.page-title").innerText;

    const image = document.querySelector("#productMain picture img").src;

    const code = document.querySelector(
      "#productMain .custom-tag__text strong"
    ).innerText;

    const regularPrice = document.querySelector(
      "#productMain data.product-price__bottom"
    ).innerText;

    const actionPrice = document.querySelector(
      "#productMain data.product-price__top"
    ).innerText;

    const atbCardPriceSelector = document.querySelector(
      "#productMain data.atbcard-sale__price-top"
    );

    const atbCardPrice = atbCardPriceSelector
      ? atbCardPriceSelector.innerText
      : null;

    const response = {
      action: true,
      title: `${title}`,
      image: `${image}`,
      regularPrice: `${regularPrice}`,
      actionPrice: `${actionPrice}`,
      atbCardPrice: `${atbCardPrice}`,
      productCode: code,
    };

    return response;
  });

  // console.log({ ...productMain, url });
  // await page.waitForTimeout(100); // wait
  await browser.close();
};

// const res = await Promise.allSettled(
//   userFavoriteProducts.map(async (el) => {
//     const nightmare = new Nightmare({});
//     const resp = await parser(el, nightmare);
//     await nightmare.end();
//     // console.log(resp);
//     return resp;
//   })
// );

// const data = require("./data.js");

// const favProd = data[1].products;

const getProducts = async (arr) => {
  const resp = await arr.map(async (el) => {
    const r = await parser(el);
    return r;
  });
  // console.log(resp);
  return resp;
};

// getProducts(favProd);

module.exports = parser;
