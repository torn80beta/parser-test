const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

// const axiosOptions = {
//   headers: {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0",
//     cookie:
//       "lang=uk; _sessionfront=fl5kdrhrblppptts7tc8bfn6su; _csrf-shop=44b20d6acfaa67652dc9f9d3696dc79ef1bff20548bb47dee5fed67e5313eb70a%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22_csrf-shop%22%3Bi%3A1%3Bs%3A32%3A%226yIUVrJfaIlOsdMSrrxNVFSno_-yPm0k%22%3B%7D; _ms=c8635b32-4563-42cf-9b2c-6e6a7b48a489; cf_clearance=wSEQD9uYJYJra7IOuZrT905FTWhAwo3OJnexJ.Ec4mQ-1708721078-1.0-AVpX47qODJEJ7PlXjQlFrYV7TiflWyZ0l33ZxWJv457SbBSYfxuq8P+H8C1bCEEy/kF9qEqIl9dmkzlgtFLvxUk=; viewedprod=a%3A2%3A%7Bi%3A0%3Bs%3A6%3A%22120333%22%3Bi%3A1%3Bs%3A6%3A%22153675%22%3B%7D",
//   },
// };

const axiosOptions = {
  headers: {
    "User-Agent":
      // "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    cookie:
      "lang=uk; _sessionfront=fl5kdrhrblppptts7tc8bfn6su; _csrcf_clearance=kGDa5gT1osaViIJvKa1q.evPz.CYj_dUBarj8EM5GYQ-1752576781-1.2.1.1-DCCsGNT53mfULjfhF97PJm69Z59EqSGZIJLNLhq49Vw77OxXUdWtzwKMIehbNqaE5uIRlOPf_rAVPYOX.hGiZd1hyuEYV1CvIqcGmjOrhZHxJ4CEqDLEWsMrhTKxfMZ5MKa7dzEbQIy2mlwVxxRpEy8zsOj.KH_3.B0WmZowY7sisMAGACpCaPUBWsn7r.4FIa91XVOPX5MJQXdvhpmx3K_3trSDxMM7Sc7.fhQ_1bY; _ms=4ae81f4e-5001-4044-bcf9-7a2f04ec1d49; _sessionfront=e3f63mm92gbtavoqqefs8v5pa9; _csrf-shop=65a97d75e1ca7e182c2a0edb38f13cc5241f0367c64f1b5563ef1aa93f06e84fa%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22_csrf-shop%22%3Bi%3A1%3Bs%3A32%3A%22ITeQIPnM1iqtnz8NnoX-oe--3d13C0Fp%22%3B%7D; lang=ukf-shop=44b20d6acfaa67652dc9f9d3696dc79ef1bff20548bb47dee5fed67e5313eb70a%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22_csrf-shop%22%3Bi%3A1%3Bs%3A32%3A%226yIUVrJfaIlOsdMSrrxNVFSno_-yPm0k%22%3B%7D; _ms=c8635b32-4563-42cf-9b2c-6e6a7b48a489; cf_clearance=wSEQD9uYJYJra7IOuZrT905FTWhAwo3OJnexJ.Ec4mQ-1708721078-1.0-AVpX47qODJEJ7PlXjQlFrYV7TiflWyZ0l33ZxWJv457SbBSYfxuq8P+H8C1bCEEy/kF9qEqIl9dmkzlgtFLvxUk=; viewedprod=a%3A2%3A%7Bi%3A0%3Bs%3A6%3A%22120333%22%3Bi%3A1%3Bs%3A6%3A%22153675%22%3B%7D",
  },
};

axios.defaults.withCredentials = true;

// const axiosOptions = {
//   headers: {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
//     accept:
//       "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//     "accept-language":
//       "ru-UA,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk-UA;q=0.6,uk;q=0.5,ru-RU;q=0.4",
//     "cache-control": "max-age=0",
//     priority: "u=0, i",
//     "sec-ch-ua":
//       '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": '"Windows"',
//     "sec-fetch-dest": "document",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "none",
//     "sec-fetch-user": "?1",
//     "upgrade-insecure-requests": "1",
//     cookie:
//       "lang=uk; _sessionfront=hbim8pt0g1kjk84nnhtob2lu0o; _csrf-shop=67a5ce0a0ab0643e78322b6380ec35f626be03e2bcfe54dd43c241685b25206fa; banner=987%2C881%2C1047%2C911%2C951",
//   },
// };

async function parser({ url, isUserListElement }) {
  try {
    const html = await axios.get(url, axiosOptions).catch((error) => {
      console.error(error);
      return error;
    });

    const $ = cheerio.load(html.data);

    const isAction = $("#productMain data.product-price__bottom span")
      .text()
      .trim();

    const isAtbCardPrice = $("#productMain data.atbcard-sale__price-top span")
      .text()
      .trim();

    if (!isAction && !isAtbCardPrice && isUserListElement) {
      return {
        action: false,
      };
    }

    const title = $("h1.page-title").text();
    const image = $("#productMain picture img").attr("src");
    const code = $("#productMain .custom-tag__text strong").text();

    const regularPrice = isAction
      ? parseFloat(
          $("#productMain data.product-price__bottom span").text().trim()
        ).toFixed(2)
      : parseFloat(
          $("#productMain data.product-price__top").text().trim()
        ).toFixed(2);

    const actionPrice =
      isAction && isUserListElement
        ? parseFloat(
            $("#productMain data.product-price__top").text().trim()
          ).toFixed(2)
        : null;

    const atbCardPriceSelector = parseFloat(
      $("#productMain data.atbcard-sale__price-top span").text().trim()
    ).toFixed(2);

    let atbCardPrice;

    if (atbCardPriceSelector === "NaN" || !isUserListElement) {
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
    // console.log(error.message, error.status);
    return error.status;
  }
}

const getProducts = async (arr) => {
  const resp = await Promise.allSettled(
    arr.map(async (el) => {
      try {
        const r = await parser({ url: el.url, isUserListElement: true });
        return r;
      } catch (error) {
        console.log(`false`);
        return { action: false, error };
      }
    })
  );

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
