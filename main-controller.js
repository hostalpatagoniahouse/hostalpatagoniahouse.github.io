'use strict';

window.mainController = (function () {
  var mainController = {};
  
  mainController.showConfigSection = showConfigSection;
  mainController.showEntrySection = showEntrySection;
  
  var configSection = document.getElementById('config-section');
  var entrySection = document.getElementById('entry-section');
  
  return mainController;
  
  ////////////////////////////////////////
  
  function showConfigSection() {
    configSection.style.display = 'block';
    entrySection.style.display = 'none';
  }
  
  function showEntrySection() {
    configSection.style.display = 'none';
    entrySection.style.display = 'block';
  }
})();
