"use strict";

(function() {
  angular.module("app", ["ngMaterial"])
    .constant("SCOPES", ["https://www.googleapis.com/auth/spreadsheets"])
    .constant("SHEETS_API_DISCOVERY_URL", 'https://sheets.googleapis.com/$discovery/rest?version=v4')
    .run(function ($rootScope) {
      $rootScope.state = "loading";

      angular.element(document).on("gapiLoaded", function () {
        $rootScope.$apply(function () {
          $rootScope.$broadcast("gapiLoaded");
        })
      });
      
    });

  window.gapiLoaded = function () {
    console.log("Google API Loaded");
    angular.element(document).triggerHandler("gapiLoaded");
  }
})();
