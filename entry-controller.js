'use strict';

window.entryController = (function () {
  var entryController = {};
  
  init();
  
  return entryController;
  
  /////////////////////////////////////////////
  
  function init() {
    var addButton = document.getElementById('add-button');
    
    addButton.addEventListener('click', function (event) {
      event.preventDefault();
      
      var bookingRow = getBookingRow();
      
      if (validateBookingRow(bookingRow)) {
        sheets.addBookingRow();
      }
    });
  }
  
  function getBookingRow() {
    var data = {};
    
    data.name = document.getElementById('name-input').value;
    data.date = Date.now();
    data.days = document.getElementById('days-input').value;
    data.bed = document.getElementById('bed-input').value;
    
    return data;
  }
  
  function validateBookingRow(data) {
    return (data.name && data.date && data.days && data.bed);
  }
})();
