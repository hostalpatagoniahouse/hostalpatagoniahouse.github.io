'use strict';

window.sheets = (function () {
  var sheets = {};
  
  sheets.authorize = authorize;
  sheets.addBookingRow = addBookingRow;
  
  return sheets;
  
  /////////////////////////////////////////////

  /* Authorize the sheets API */
  function authorize() {
    return gapi.auth.authorize(
      { client_id: config.apiClientId, scope: config.SCOPES, immediate: false }
    ).then(loadSheetsApi, function (response) {
      console.log('Error authorize!');
      console.log(response);
    });
  }

  /* Load the sheets client library. Returns a promise */
  function loadSheetsApi() {
    return gapi.client.load(config.SHEETS_API_DISCOVERY_URL);
  }
  
  /* Add a booking row with the data passed */
  function addBookingRow(data) {
    gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: config.bookingSheetId,
      range: config.bookingSheet + '!A1:D1',
      majorDimension: 'ROWS',
      valueInputOption: 'RAW',
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
      data.room
    ];
  }
})();
