// 因为webpack也用到，所以这里还是保持js写

function getRandomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.getRandomIntInRange = getRandomIntInRange;
