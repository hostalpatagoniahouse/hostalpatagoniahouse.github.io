'use strict';

window.utils = (function() {
  var utils = {};
  
  utils.toSheetsDate = toSheetsDate;
  utils.fromSheetsDate = fromSheetsDate;
  utils.error = error;
  utils.getAlphabet = getAlphabet;
  
  var epoch = new Date(1899,11,30);
  var msPerDay = 8.64e7;
  
  return utils;
  
  //////////////////////////
  
  /* To convert a javascript timestamp to a google sheets epoch date */
  function toSheetsDate(d) {
    return (d - epoch) / msPerDay;
  }
  
  /* And the opposite */
  function fromSheetsDate(d) {
    return (d * msPerDay) + epoch;
  }
  
  /* Handle an error */
  function error(message) {
    console.log('Error: ' + message);
  }
  
  /* Return the nth alphabet (uppercase). For n = 1 returns A */
  function getAlphabet(n) {
    return String.formCharCode(64 + n);
  }
})();
