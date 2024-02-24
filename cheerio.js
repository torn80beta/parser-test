const axios = require("axios");
const cheerio = require("cheerio");

const axiosOptions = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0",
    cookie:
      "lang=uk; _sessionfront=fl5kdrhrblppptts7tc8bfn6su; _csrf-shop=44b20d6acfaa67652dc9f9d3696dc79ef1bff20548bb47dee5fed67e5313eb70a%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22_csrf-shop%22%3Bi%3A1%3Bs%3A32%3A%226yIUVrJfaIlOsdMSrrxNVFSno_-yPm0k%22%3B%7D; _ms=c8635b32-4563-42cf-9b2c-6e6a7b48a489; cf_clearance=wSEQD9uYJYJra7IOuZrT905FTWhAwo3OJnexJ.Ec4mQ-1708721078-1.0-AVpX47qODJEJ7PlXjQlFrYV7TiflWyZ0l33ZxWJv457SbBSYfxuq8P+H8C1bCEEy/kF9qEqIl9dmkzlgtFLvxUk=; viewedprod=a%3A2%3A%7Bi%3A0%3Bs%3A6%3A%22120333%22%3Bi%3A1%3Bs%3A6%3A%22153675%22%3B%7D",
  },
};

async function parser({ url, isUserListElement }) {
  try {
    const html = await axios.get(url, axiosOptions).catch((error) => {
      console.error(error.message);
      return error;
    });

    const $ = cheerio.load(html.data);

    const isAction = $("#productMain data.product-price__bottom span").text();

    if (!isAction && isUserListElement) {
      return {
        action: false,
      };
    }

    const title = $("h1.page-title").text();
    const image = $("#productMain picture img").attr("src");
    const code = $("#productMain .custom-tag__text strong").text();

    const regularPrice = isAction
      ? $("#productMain data.product-price__bottom span").text()
      : parseFloat(
          $("#productMain data.product-price__top").text().trim()
        ).toFixed(2);

    const actionPrice =
      isAction && isUserListElement
        ? parseFloat(
            $("#productMain data.product-price__top").text().trim()
          ).toFixed(2)
        : null;

    // const actionPrice = actionPriceSelector ? actionPriceSelector : null;

    const atbCardPriceSelector = $(
      "#productMain data.atbcard-sale__price-top span"
    ).text();

    let atbCardPrice;

    if (!atbCardPriceSelector || !isUserListElement) {
      atbCardPrice = null;
    } else {
      atbCardPrice = atbCardPriceSelector;
    }

    const response = {
      action: true,
      title: `${title}`,
      image: `${image}`,
      regularPrice: `${regularPrice}`,
      actionPrice: `${actionPrice}`,
      atbCardPrice: `${atbCardPrice}`,
      productCode: code,
    };

    return { ...response, url };
  } catch (error) {
    console.log(error.message);
  }
}

const getProducts = async (arr) => {
  const resp = await Promise.allSettled(
    arr.map(async (el) => {
      try {
        const r = await parser({ url: el.url, isUserListElement: true });
        return r;
      } catch (error) {
        return { action: false, error };
      }
    })
  );
  // console.log(resp);
  return resp;
};

const getSingleProduct = async (url) => {
  try {
    const r = await parser({ url, isUserListElement: false });
    return r;
  } catch (error) {
    return { action: false, error };
  }
};

module.exports = { getProducts, getSingleProduct };
