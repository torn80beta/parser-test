const format = require("date-fns").format;

const timeMessage = (startDate) => {
  const endDate = new Date();

  const diffTime = Math.abs(endDate - startDate);
  const isMinute =
    format(diffTime, "mm") === "00"
      ? ""
      : `<b>${format(diffTime, "mm")}<b> хвилин. : `;

  const calculateTimeMessage = `${
    isMinute + "<b>" + format(diffTime, "ss") + "</b>" + " секунд"
  }`;

  return calculateTimeMessage;
};

module.exports = timeMessage;
