'use strict';

(function () {
  angular.module("app")
    .controller("EntryController", function ($scope, $rootScope, utils, sheetsService) {
      $scope.entry = {};
      $scope.entry.date = Date.now();
    
      $scope.addEntry = function () {
        sheetsService.addBookingRow($scope.entry);
      };
    
      $scope.checkRooms = function () {
        console.log(entry.date);
        sheetsService.availableRooms(entry.date);
      }
    });
})();
