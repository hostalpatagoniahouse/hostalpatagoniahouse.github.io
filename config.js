'use strict';

window.config = (function() {
  var config = {
    SCOPES: ["https://www.googleapis.com/auth/spreadsheets"],
    SHEETS_API_DISCOVERY_URL: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
    
    apiClientId: null,
    bookingSheetId: null,
    bookingSheet: null
  };
  
  config.refreshConfig = refreshConfig;
  
  return config;
  
  /////////////////////////////////
  
  /* Refresh the config from localStorage */
  function refreshConfig() {
    config.apiClientId = localStorage.apiClientId;
    config.bookingSheetId = localStorage.bookingSheetId;
    config.bookingSheet = localStorage.bookingSheet;
  }
})();
