"use strict";

(function() {
  angular.module("app", [])
    .run(function ($rootScope) {
      $rootScope.configComplete = false;
    });
})();
