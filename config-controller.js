'use strict';

(function () {
  angular.module("app")
    .controller("ConfigController", function ($scope, $rootScope, gapiService) {
      $scope.savingConfig = false;

      $rootScope.config = {};
      if (localStorage.config) {
        $rootScope.config = JSON.parse(localStorage.config);

        console.log("a")
        // Attempt to authorize directly
        $scope.$on("gapiLoaded", function () {
          console.log("b")
          gapiService.authorize(true)
            .then(function () {
              console.log("resolve")
              $rootScope.state = "entry";
            }).catch(function () {
              console.log("reject")
              $rootScope.state = "config";
            });
        });
      }
    
      $scope.saveConfig = function () {
        $scope.savingConfig = true;

        if ($rootScope.config.remember) {
          localStorage.config = JSON.stringify($rootScope.config);
        }
        
        gapiService.authorize()
          .then(function () {
            $rootScope.state = "entry";
          }).finally(function () {
            $scope.savingConfig = false;
          });
      }
    });
})();
