'use strict';

(function () {
  angular.module("app")
    .controller("ConfigController", function ($scope, $rootScope, sheetsService) {
      var configInputs = ["apiClientId", "bookingSheetId", "bookingSheet"];
    
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
        
        console.log("before");
        sheetsService.authorize().then(function () {
          console.log("here");
          $rootScope.$apply("configComplete = true;");
        });
      }
    });
})();
