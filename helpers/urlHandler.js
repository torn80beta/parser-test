const urlHandler = async (url) => {
  const prefix = "https://www.atbmarket.com/product/";
  if (!url.startsWith(prefix)) {
    return false;
  }

  const index = url.indexOf("?");
  if (index !== -1) {
    const normalizedUrl = url.slice(0, index);

    return normalizedUrl;
  }

  return url;
};

module.exports = urlHandler;
