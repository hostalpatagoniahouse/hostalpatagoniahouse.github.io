'use strict';

(function () {
  angular.module("app")
    .controller("EntryController", function ($scope, $rootScope, utils, sheetsService, $q, $mdToast, $anchorScroll, $mdDialog) {
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
        $scope.entry.source = "H"
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

      $scope.canCheckRooms = function () {
        return ($scope.entry.number && $scope.entry.date && $scope.entry.days);
      }
      
      var checkRoomsRequestId = 0;

      $scope.checkRooms = function () {
        // Store the request ID so that if there are multiple requests only the last is used
        checkRoomsRequestId++;
        var currentRequestId = checkRoomsRequestId;

        $scope.roomList = [];
        $scope.entry.room = null;

        // check rooms only if all data is available
        if (!$scope.canCheckRooms()) {
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
          }).finally(function () {
            if (checkRoomsRequestId !== currentRequestId) {
              return;
            }

            $scope.roomsLoading = false;
          });
      }


      $scope.updatePrice = function () {
        $scope.entry.priceWithTax = Math.round(($scope.entry.priceWithoutTax || 0) * (100 + $rootScope.config.taxPercentage) / 100);
      }


      $scope.showConfig = function () {
        $rootScope.state = "config";
      }

      $scope.import = function (event) {
        $mdDialog.show({
          templateUrl: "/import-dialog.tmpl.html",
          targetEvent: event,
          controller: "ImportDialogController"
        }).then(function (importedEntry) {
          $scope.clear();
          $scope.entry = importedEntry;

          $scope.checkRooms();
          if ($scope.entry.priceWithoutTax) {
            $scope.updatePrice();
          }

          $mdToast.show($mdToast.simple().textContent("Datos importados"));
        }).catch(function (error) {

          if (error) {
            $mdToast.show($mdToast.simple().textContent("No se puede importar los datos"));
          }
        });
      }
    });
})();
