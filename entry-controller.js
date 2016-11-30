'use strict';

(function () {
  angular.module("app")
    .controller("EntryController", function ($scope, $rootScope, utils, sheetsService) {
      $scope.entry = {};
    
      $scope.addEntry = function () {
        sheetsService.addBookingRow(getFormattedEntry());
      };
    
      function getFormattedEntry() {
        var formattedEntry = angular.copy($scope.entry);
        formattedEntry.date = utils.toSheetsDate(Date.now());
        
        return formattedEntry;
      }
    });
})();
