'use strict';

(function() {
  angular.module("app")
    .factory("utils", function () {
      var utils = {};
  
      utils.toSheetsDate = toSheetsDate;
      utils.fromSheetsDate = fromSheetsDate;
      utils.error = error;
      utils.getColumnLetter = getColumnLetter;
      utils.getMonthName = getMonthName;
      utils.getShortYear = getShortYear;

      var epoch = new Date(1899,11,30);
      var msPerDay = 8.64e7;

      return utils;

      //////////////////////////

      /* To convert a javascript timestamp to a google sheets epoch date */
      function toSheetsDate(d) {
        return Math.floor((d - epoch) / msPerDay);
      }

      /* And the opposite */
      function fromSheetsDate(d) {
        return (d * msPerDay) + epoch;
      }

      /* Handle an error */
      function error(message) {
        console.log('Error: ' + message);
      }

      /* Return the nth column letter in a spreadsheet, starting from n=0 */
      function getColumnLetter(n) {
        var lastLetter = String.fromCharCode(65 + (n % 26));
        var remaining = Math.floor(n / 26) - 1;
        
        if (remaining < 0) {
          return lastLetter;
        } else {
          return getColumnLetter(remaining) + lastLetter;
        }
      }
    
      /* Get spanish month name from date */
      function getMonthName(date) {
        var monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        return monthNames[date.getMonth()];
      }
      
      /* Get last two digits of the year from date */
      function getShortYear(date) {
        return parseInt(date.getFullYear().toString().substr(2,2), 10);
      }
    });
})();
