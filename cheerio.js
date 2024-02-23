const axios = require("axios");
const cheerio = require("cheerio");

const axiosOptions = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    cookie:
      "banner=593%2C879%2C873%2C867%2C589%2C639%2C889%2C895%2C885%2C%2C893%2C819%2C897%2C725%2C881%2C905%2C779%2C777%2C585%2C901; cf_clearance=UdaUUmzWnh9VLPE2qvGTqdkndMjbZW8lv.881aOCDro-1708359799-1.0-Aex2wDjJcN8r2rAUsq6kt/IevG3Uh0oUiNzZqbsiqUwq6zaIzsrRqiBJL48nGYlTqwPoD+PFzxuZt6QhoFkoABg=; _ms=ff03af6a-958e-406b-ae56-8e7871540789; sc=B26823EB-AF73-4707-1814-A3958115B79A; viewedprod=a%3A8%3A%7Bi%3A0%3Bs%3A6%3A%22180491%22%3Bi%3A1%3Bs%3A6%3A%22163562%22%3Bi%3A2%3Bs%3A6%3A%22170481%22%3Bi%3A3%3Bs%3A6%3A%22126024%22%3Bi%3A4%3Bs%3A5%3A%2251558%22%3Bi%3A5%3Bs%3A6%3A%22131776%22%3Bi%3A6%3Bs%3A6%3A%22162198%22%3Bi%3A7%3Bs%3A6%3A%22162654%22%3B%7D; lang=uk; birthday=true; natbdelivery=0; nstore_id=1262; _sessionfront=udmk9a1olcssiq4ft2r3q9umf8; _csrf-shop=6322513010f5eb12c2433e67b55aae0ceefcebc2a4066bcd16a49e847e858affa%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22_csrf-shop%22%3Bi%3A1%3Bs%3A32%3A%22XYP-weIIU1ElDJXRbvH7RkgoeMUjwWqA%22%3B%7D",
  },
};

async function parser({ url, isUserListElement }) {
  const html = await axios.get(url, axiosOptions).catch((error) => {
    console.error(error);
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
