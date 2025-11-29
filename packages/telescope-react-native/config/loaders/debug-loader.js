// debug-loader.js
module.exports = function (source) {
  console.log('Processing file:', this.resourcePath);
  return source;
};
