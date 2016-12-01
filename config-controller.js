'use strict';

(function () {
  angular.module("app")
    .controller("ConfigController", function ($scope, $rootScope, gapiService) {
      $rootScope.config = localStorage.config || {};
    
      $scope.saveConfig = function () {
        if ($rootScope.config.remember) {
          localStorage.config = $rootScope.config;
        }
        
        gapiService.authorize().then(function () {
          $rootScope.configComplete = true;
        });
      }
    });
})();
