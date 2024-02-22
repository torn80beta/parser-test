const format = require("date-fns").format;

const startProcessMessage = ({ startDate, msg }) => {
  console.log(
    `${format(startDate, "HH:mm:ss")} User ${
      msg.from.first_name
    } looking for products by list...`
  );
};

const endProcessMessage = ({
  startDate,
  userFavoriteProducts,
  actionProducts,
  msg,
}) => {
  console.log(
    `${format(new Date(), "HH:mm:ss")} Process completed for user ${
      msg.from.first_name
    } in ${format(Math.abs(new Date() - startDate), "mm:ss")}, ${
      userFavoriteProducts.length
    } were processed. ${actionProducts.length} products found.`
  );
};

module.exports = { startProcessMessage, endProcessMessage };
