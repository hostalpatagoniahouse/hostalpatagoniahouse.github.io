'use strict';

(function () {
  angular.module("app")
    .controller("EntryController", function ($scope, $rootScope, utils, sheetsService) {
      $scope.roomList = [];
      $scope.entry = {};
      $scope.entry.date = new Date();
    
      $scope.addEntry = function () {
        sheetsService.addBookingRow($scope.entry);
      };
    
      $scope.checkRooms = function () {
        sheetsService.availableRooms($scope.entry.number, $scope.entry.date, $scope.entry.days).then(function (response) {
          $scope.roomList = response.filter(function (x) { return x; });
          if ($scope.roomList.length > 0) {
            $scope.entry.room = $scope.roomList[0];
          } else {
            $scope.entry.room = null;
          }
          console.log("Loaded rooms!");
        });
      }
    });
})();
