/* eslint-disable no-bitwise */
/**
 * Generate uuid v4 string
 * From gist: // From https://gist.github.com/jed/982883
 * <3
 *
 * @return {String}
 */
function uuid() {
  function b(a) {
    return a // if the placeholder was passed, return
      ? (a ^ (Math.random() * (16 >> (a / 4)))).toString(16)
      : ( // or otherwise a concatenated string:
        [10000000] // 1e7 +
        + -1000 // -1e3 +
        + -4000 // -4e3 +
        + -80000000 // -8e3 +
        + -100000000000 // -1e11,
      ).replace(/[018]/g, b) // replace zeroes, ones, and eights with and then random hex digits
  }
  return b()
}
/* eslint-enable */

module.exports = {
  uuid,
}
