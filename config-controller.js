'use strict';

(function () {
  angular.module("app")
    .controller("ConfigController", function ($scope, $rootScope, gapiService) {
      var configInputs = ["apiClientId", "bookingSheetId", "bookingSheet", "roomsSheetId"];
    
      $rootScope.config = {};
      
      configInputs.forEach(function (field) {
        if (localStorage[field]) {
          $rootScope.config[field] = localStorage[field]
        }
      });
    
      $scope.saveConfig = function () {
        configInputs.forEach(function (field) {
          localStorage[field] = $rootScope.config[field];
        });
        
        gapiService.authorize().then(function () {
          $rootScope.configComplete = true;
        });
      }
    });
})();
