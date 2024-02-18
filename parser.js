const Nightmare = require("nightmare");

const parser = async ({ url }) => {
  const nightmare = Nightmare({
    // executionTimeout: 1000,
    show: false,
  });
  const selector = "#productMain";
  const result = await nightmare
    .goto(url)
    .wait(selector)
    // .wait("body")
    .evaluate(
      (selector) =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            const isAction = document.querySelector(
              "#productMain data.product-price__bottom"
            );
            if (isAction) {
              const title = document.querySelector(
                "#productMain h1.page-title"
              ).innerText;

              const image = document.querySelector(
                "#productMain picture img"
              ).src;

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
              resolve(response);
            } else {
              reject({
                action: false,
              });
            }
          }, 0);
        }),
      selector
    )
    .end()
    .catch((err) => {
      // console.log(err);
      return err;
    });

  return { ...result, url };
};

// const parserOld = async ({ url }) => {
//   const nightmare = Nightmare({
//     show: false,
//   });
//   const selector = "#productMain";

//   try {
//     const result = await nightmare
//       .goto(url)
//       .wait("body")
//       .evaluate(
//         (selector) =>
//           new Promise((resolve, reject) => {
//             setTimeout(() => {
//               const isAction = document.querySelector(
//                 "#productMain data.product-price__bottom"
//               );
//               // console.log(isAction);
//               if (isAction) {
//                 const title = document.querySelector(
//                   "#productMain h1.page-title"
//                 ).innerText;

//                 const image = document.querySelector(
//                   "#productMain picture img"
//                 ).src;

//                 const code = document.querySelector(
//                   "#productMain .custom-tag__text strong"
//                 ).innerText;

//                 const regularPrice = document.querySelector(
//                   "#productMain data.product-price__bottom"
//                 ).innerText;

//                 const actionPrice = document.querySelector(
//                   "#productMain data.product-price__top"
//                 ).innerText;

//                 let atbCardPrice = document.querySelector(
//                   "#productMain data.atbcard-sale__price-top"
//                 );

//                 if (atbCardPrice) {
//                   atbCardPrice = atbCardPrice.innerText;
//                 }

//                 const response = {
//                   action: true,
//                   title: `${title}`,
//                   image: `${image}`,
//                   regularPrice: `${regularPrice}`,
//                   actionPrice: `${actionPrice}`,
//                   atbCardPrice: `${atbCardPrice}`,
//                   productCode: code,
//                 };

//                 resolve(response);
//               } else {
//                 reject();
//               }
//             }, 0);
//           }),
//         selector
//       )
//       .end((res) => {
//         console.log("process completed");
//         return res;
//       })
//       .then((res) => {
//         console.log("GOT ACTION PRODUCT!!!: ", res);
//         return res;
//       });
//     return { ...result, url };
//   } catch (error) {
//     // console.error("Search failed:", error.message);
//     return error.message;
//   }
// };

// const startScraping = async (arr) => {
//   // try {
//   const results = await Promise.allSettled(arr.map(parser));
//   console.log("All instances finished:", results);
//   console.log(
//     "Search finished, ",
//     results.filter((prod) => typeof prod.value === "object").length,
//     " products found."
//     // results
//   );
//   return results;
//   // } catch (error) {
//   //   console.error("An error occurred:", error);
//   //   return error.message;
//   // }
// };

module.exports = parser;
