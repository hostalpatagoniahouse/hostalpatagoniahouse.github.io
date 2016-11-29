window.sheets = (function () {
  var sheets = {};
  
  return sheets;
  
  /////////////////////////////////////////////
  
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
})();
