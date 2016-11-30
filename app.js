"use strict";

(function() {
  angular.module("app", ["ngMaterial"])
    .constant("SCOPES", ["https://www.googleapis.com/auth/spreadsheets"])
    .constant("SHEETS_API_DISCOVERY_URL", 'https://sheets.googleapis.com/$discovery/rest?version=v4')
    .run(function ($rootScope) {
      $rootScope.configComplete = false;
    });
})();
