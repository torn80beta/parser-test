const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const pLimit = require("p-limit");

const CONCURRENCY_LIMIT = 10;

async function fetchHtmlWithPage(page, url) {
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  /* Anti bot protection test start */

  // await page.setExtraHTTPHeaders({
  //   "Accept-Language": "en-US,en;q=0.9,uk;q=0.8",
  //   Referer: "https://www.google.com/",
  // });

  // await page.setViewport({ width: 1366, height: 768 });

  /* Anti bot protection test end */

  const serverResponse = await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  if (!serverResponse || !serverResponse.ok()) {
    throw new Error(`Page load failed: ${serverResponse?.status()} ${url}`);
  }

  await page.waitForSelector("#productMain", { timeout: 5000 });

  return await page.content();
}
async function parser(page, { url, isUserListElement }) {
  try {
    const html = await fetchHtmlWithPage(page, url);
    const $ = cheerio.load(html);

    const isAction = $("#productMain data.product-price__bottom span")
      .text()
      .trim();
    const isAtbCardPrice = $("#productMain data.atbcard-sale__price-top span")
      .text()
      .trim();

    if (!isAction && !isAtbCardPrice && isUserListElement) {
      return { action: false };
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

    const atbCardPrice =
      atbCardPriceSelector === "NaN" || !isUserListElement
        ? null
        : atbCardPriceSelector;

    return {
      action: true,
      title,
      image,
      regularPrice,
      actionPrice,
      atbCardPrice,
      productCode: code,
      url,
    };
  } catch (error) {
    console.error("Parser error:", error.message);
    return { action: false, error };
  }
}

async function getProducts(arr) {
  const browser = await puppeteer.launch({
    // headless: false, //anti bot protection test
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const limit = pLimit(CONCURRENCY_LIMIT);

  const results = await Promise.allSettled(
    arr.map((el) =>
      limit(async () => {
        const page = await browser.newPage();
        try {
          const result = await parser(page, {
            url: el.url,
            isUserListElement: true,
          });
          // console.log(result);
          return result;
        } catch (error) {
          return { action: false, error };
        } finally {
          await page.close();
        }
      })
    )
  );

  await browser.close();

  // console.log(results);

  return results;
}

async function getSingleProduct(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  const result = await parser(page, {
    url,
    isUserListElement: false,
  });

  await page.close();
  await browser.close();

  return result;
}

module.exports = { getProducts, getSingleProduct, CONCURRENCY_LIMIT };
