'use strict';

(function () {
  angular.module("app")
    .controller("EntryController", function ($scope, $rootScope, utils, sheetsService) {
      $scope.entry = {};
      $scope.entry.date = new Date();
    console.log("hoola");
    
      $scope.addEntry = function () {
        sheetsService.addBookingRow($scope.entry);
      };
    
      $scope.checkRooms = function () {
        sheetsService.availableRooms($scope.entry.date);
      }
    });
})();
