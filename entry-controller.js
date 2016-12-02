'use strict';

(function () {
  angular.module("app")
    .controller("EntryController", function ($scope, $rootScope, utils, sheetsService, $q, $mdToast, $anchorScroll) {
      var ctrl = this;

      $scope.adding = false;
      $scope.roomsLoading = false;

      $scope.clear = function () {
        if (ctrl.form) {
          ctrl.form.$setPristine();
          ctrl.form.$setUntouched();
        }
        $scope.entry = {};
        $scope.entry.date = new Date();
        $scope.entry.source = "[H]"
        $scope.roomList = [];
      }

      $scope.clear();
    
      $scope.addEntry = function () {
        $scope.adding = true;

        sheetsService.addBooking($scope.entry)
          .then(function () {
            $scope.clear();
            $anchorScroll();
            $mdToast.show($mdToast.simple().textContent("Reserva agregada").hideDelay(5000));
          })
          .finally(function () {
            $scope.adding = false;
          });
      };
      
      var checkRoomsRequestId = 0;

      $scope.checkRooms = function () {
        // Store the request ID so that if there are multiple requests only the last is used
        checkRoomsRequestId++;
        var currentRequestId = checkRoomsRequestId;

        $scope.roomList = [];
        $scope.entry.room = null;

        // check rooms only if all data is available
        if (!$scope.entry.number || !$scope.entry.date || !$scope.entry.days) {
          $scope.roomsLoading = false;
          return;
        }

        $scope.roomsLoading = true;
        
        
        sheetsService.availableRooms($scope.entry.number, $scope.entry.date, $scope.entry.days)
          .then(function (response) {
            if (checkRoomsRequestId !== currentRequestId) {
              return;
            }

            $scope.roomList = response.filter(function (x) { return x; });
            if ($scope.roomList.length > 0) {
              $scope.entry.room = $scope.roomList[0];
            }
          }).finally(function () {
            if (checkRoomsRequestId !== currentRequestId) {
              return;
            }

            $scope.roomsLoading = false;
          });
      }


      $scope.updatePrice = function () {
        $scope.entry.priceWithTax = ($scope.entry.priceWithoutTax || 0) * (100 + $rootScope.config.taxPercentage) / 100;
      }


      $scope.showConfig = function () {
        $rootScope.state = "config";
      }
    });
})();
