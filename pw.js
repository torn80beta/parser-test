const playwright = require("playwright");

const parser = async ({ url }) => {
  const browser = await playwright.firefox.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    await page.goto(url);
  } catch (error) {
    console.log(error.message);
    await browser.close();
    return error.message;
  }

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
  await browser.close();
  return { ...productMain, url };

  // await page.waitForTimeout(100); // wait
};
const getProducts = async (arr) => {
  const resp = await Promise.allSettled(
    arr.map(async (el) => {
      try {
        const r = await parser(el);
        return r;
      } catch (error) {
        return { action: false, error };
      }
    })
  );
  return resp;
};

module.exports = getProducts;
