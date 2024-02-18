const puppeteer = require("puppeteer");

(async () => {
  // Launch the browser and open a new blank page
  // const browser = await puppeteer.launch({ headless: "new" });
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(
    "https://www.atbmarket.com/product/sir-kislomolocnij-350-g-ukrainskij-nezirnij-pet"
  );

  // Set screen size
  // await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  // await page.type(".devsite-search-field", "automate beyond recorder");

  // Wait and click on first result
  // const searchResultSelector = ".devsite-result-item-link";
  await page.waitForSelector("#productMain");
  const title = await page.waitForSelector("#productMain h1.page-title");
  // await page.click(".devsite-result-item-link");

  // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector(
  //   "text/Customize and automate"
  // );
  // const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  const fullTitle = await title?.evaluate((el) => el.textContent);

  // Print the full title
  console.log('The title of this blog post is "%s".', fullTitle);

  // console.log(title);
  await browser.close();
})();

// (async () => {
//   // Launch the browser and open a new blank page
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   // Navigate the page to a URL
//   await page.goto("https://developer.chrome.com/");

//   // Set screen size
//   await page.setViewport({ width: 1080, height: 1024 });

//   // Type into search box
//   await page.type(".devsite-search-field", "automate beyond recorder");

//   // Wait and click on first result
//   const searchResultSelector = ".devsite-result-item-link";
//   await page.waitForSelector(searchResultSelector);
//   await page.click(searchResultSelector);

//   // Locate the full title with a unique string
//   const textSelector = await page.waitForSelector(
//     "text/Customize and automate"
//   );
//   const fullTitle = await textSelector?.evaluate((el) => el.textContent);

//   // Print the full title
//   console.log('The title of this blog post is "%s".', fullTitle);

//   await browser.close();
// })();
