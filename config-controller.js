'use strict';

(function () {
  angular.module("app")
    .controller("ConfigController", function ($scope, $rootScope, gapiService) {
      $rootScope.config = {};
      if (localStorage.config) {
        $rootScope.config = JSON.parse(localStorage.config);
      }
    
      $scope.saveConfig = function () {
        if ($rootScope.config.remember) {
          localStorage.config = JSON.stringify($rootScope.config);
        }
        
        gapiService.authorize().then(function () {
          $rootScope.configComplete = true;
        });
      }
    });
})();
