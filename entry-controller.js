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
        console.log($scope.entry.date);
        sheetsService.availableRooms($scope.entry.date);
      }
    });
})();
