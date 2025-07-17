const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const pLimit = require("p-limit");

async function fetchHtmlWithPuppeteer(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
  );

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const content = await page.content();

  await browser.close();

  return content;
}

async function parser({ url, isUserListElement }) {
  try {
    const html = await fetchHtmlWithPuppeteer(url);
    const $ = cheerio.load(html);

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

    let atbCardPrice =
      atbCardPriceSelector === "NaN" || !isUserListElement
        ? null
        : atbCardPriceSelector;

    const response = {
      action: true,
      title,
      image,
      regularPrice,
      actionPrice,
      atbCardPrice,
      productCode: code,
      url,
    };

    return response;
  } catch (error) {
    console.error("Parser error:", error.message);
    return { action: false, error };
  }
}

const getProducts = async (arr) => {
  const resp = await Promise.allSettled(
    arr.map(async (el) => {
      try {
        const r = await parser({ url: el.url, isUserListElement: true });
        return r;
      } catch (error) {
        console.log("false");
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
