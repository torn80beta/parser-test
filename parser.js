// const Nightmare = require("nightmare");

async function parser(el, nightmare) {
  // const nightmare = new Nightmare({
  //   // executionTimeout: 1000,
  //   show: false,
  // });
  const { url } = el;
  const selector = "#productMain";
  const result = await nightmare
    .goto(url)
    .wait("#productMain")
    .evaluate((selector) => {
      const isAction = document.querySelector(
        "#productMain data.product-price__bottom"
      );

      if (!isAction) {
        return {
          action: false,
        };
      }

      const title = document.querySelector(
        "#productMain h1.page-title"
      ).innerText;

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
    }, selector)
    .end()
    .catch((err) => {
      console.log("ERROR" + err);
      return err;
    });

  return { ...result, url };
}
module.exports = parser;
