'use strict';

(function () {
  angular.module("app")
    .factory("sheetsService", function (utils, $rootScope, SCOPES, SHEETS_API_DISCOVERY_URL) {
      var sheetsService = {};

      sheetsService.authorize = authorize;
      sheetsService.addBookingRow = addBookingRow;
      sheetsService.availableRooms = availableRooms;

      return sheetsService;

      /////////////////////////////////////////////

      /* Authorize the sheets API */
      function authorize() {
        return gapi.auth.authorize(
          { client_id: $rootScope.config.apiClientId, scope: SCOPES, immediate: false }
        ).then(loadSheetsApi);
      }

      /* Load the sheets client library. Returns a promise */
      function loadSheetsApi() {
        return gapi.client.load(SHEETS_API_DISCOVERY_URL);
      }

      /* Add a booking row with the data passed */
      function addBookingRow(data) {
        gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: $rootScope.config.bookingSheetId,
          range: $rootScope.config.bookingSheet + '!A1:D1',
          values: [convertToBookingRow(data)]

        }).then(function(response) {
          console.log(response);

        }, function(response) {
          utils.error(response.result.error.message);

        });
      }

      function convertToBookingRow(data) {
        return [
          data.name,
          utils.toSheetsDate(data.date),
          data.days,
          data.bed
        ];
      }
    
      /* Check available rooms for a particular date */
      function availableRooms(date) {
        return getColumn(date);
      }
    
      function getSheetName(date) {
        return (utils.getMonthName(date) + utils.getShortYear(date));
      }
  
      function getColumn(date) {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: $rootScope.config.roomsSheetId,
            range: getSheetName(date) + '!A1:CC1',
            valueRenderOption: "UNFORMATTED_VALUE"
          }).then(function(response) {
            console.log(response);
          });
      }
    });
})();
