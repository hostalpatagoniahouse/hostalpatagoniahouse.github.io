'use strict';

window.configController = (function () {
  var configController = {};
  
  var configInputs = {
    apiClientId: 'api-client-id-input',
    bookingSheetId: 'booking-sheet-id-input',
    bookingSheet: 'booking-sheet-input'
  };
  
  init();
  
  return configController;
  
  ////////////////////////////////////////
  
  function init() {
    preloadConfigFields();
    
    // Handle the authorize button click
    var saveConfigButton = document.getElementById('save-config-button');
    
    saveConfigButton.addEventListener('click', function (event) {
      event.preventDefault();
      saveConfig();
      var result = sheets.authorize();
      console.log(result);
    });
  }
  
  /* Load the config fields from localstorage if they have been saved there */
  function preloadConfigFields() {
    for(var index in configInputs) { 
      if (configInputs.hasOwnProperty(index) && localStorage[index]) {
        document.getElementById(configInputs[index]).value = localStorage[index];
      }
    }
  }
  
  /* Save the config fields to localstorage and refresh the config object */
  function saveConfig() {
    for(var index in configInputs) { 
      if (configInputs.hasOwnProperty(index)) {
        localStorage[index] = document.getElementById(configInputs[index]).value;
      }
    }
    
    config.refreshConfig();
  }
})();
