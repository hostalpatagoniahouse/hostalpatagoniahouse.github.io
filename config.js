'use strict';

window.config = (function() {
  var config = {
    SCOPES: ["https://www.googleapis.com/auth/spreadsheets"],
    SHEETS_API_DISCOVERY_URL: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
    
    apiClientId: null,
    bookingSheetId: null,
    bookingSheet: null
  };
  
  config.setConfig = setConfig;
  
  return config;
  
  /////////////////////////////////
  
  function setConfig(data) {
    config.apiClientId = data.apiClientId;
    config.bookingSheetId = data.bookingSheetId;
    config.bookingSheet = data.bookingSheet;
  }
})();
