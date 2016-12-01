"use strict";

(function () {
  angular.module("app")
    .factory("gapiService", function ($rootScope, $q, SCOPES, SHEETS_API_DISCOVERY_URL) {
      var gapiService = {};
      
      gapiService.authorize = authorize;
    
      // These fuunctions are impplemented after the API is loaded
      var gapiValueFunctions = ["append", "get", "batchGet", "batchUpdate"];
      
      return gapiService;
      
      ////////////////////////////////
      
      /* Authorize the sheets API */
      function authorize() {
        var deferred = $q.defer();
        
        gapi.auth.authorize(
          { client_id: $rootScope.config.apiClientId, scope: SCOPES, immediate: false }
        ).then(loadSheetsApi).then(function (response) {
          deferred.resolve(response);
        }, function (response) {
          deferred.reject(response);
        });
        
        return deferred.promise;
      }

      /* Load the sheets client library. Returns a promise */
      function loadSheetsApi() {
        return gapi.client.load(SHEETS_API_DISCOVERY_URL).then(implementFunctions);
      }
    
      function implementFunctions () {
        var gapiValueBase = gapi.client.sheets.spreadsheets.values
        
        gapiValueFunctions.forEach(function (fnName) {
          gapiService[fnName] = function () {
            var deferred = $q.defer();

            gapiValueBase[fnName].apply(gapiValueBase, arguments).then(function (response) {
              deferred.resolve(response)
            }, function (response) {
              deferred.reject (response);
            });

            return deferred.promise;
          }
        });
      }
    });
})();
