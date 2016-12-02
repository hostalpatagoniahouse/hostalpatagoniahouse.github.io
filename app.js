"use strict";

(function() {
  angular.module("app", ["ngMaterial"])
    .constant("SCOPES", ["https://www.googleapis.com/auth/spreadsheets"])
    .constant("SHEETS_API_DISCOVERY_URL", 'https://sheets.googleapis.com/$discovery/rest?version=v4')
    .run(function ($rootScope) {
      $rootScope.state = "loading";

      angular.element(document).on("gapiLoaded", function () {
        $rootScope.$broadcast("gapiLoaded");
      });
      
    });

  console.log("setup")
  window.gapiLoaded = function () {
    console.log("gapi loaded")
    angular.element(document).triggerHandler("gapiLoaded");
  }
})();
