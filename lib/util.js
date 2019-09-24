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
      ? ( // a random number from 0 to 15
        a // unless b is 8,
        ^ Math.random() // in which case
        * 16 // a random number from
        >> a / 4 // 8 to 11
      ).toString(16) // in hexadecimal
      : ( // or otherwise a concatenated string:
        [1e7] // 10000000 +
        + -1e3 // -1000 +
        + -4e3 // -4000 +
        + -8e3 // -80000000 +
        + -1e11 // -100000000000,
      ).replace(/[018]/g, b) // replace zeroes, ones, and eights with and then random hex digits
  }
  return b()
}
/* eslint-enable */

module.exports = {
  uuid,
}
