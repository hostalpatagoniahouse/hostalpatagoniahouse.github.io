'use strict';

(function () {
  angular.module("app")
    .factory("sheetsService", function (utils, $rootScope, gapiService) {
      var sheetsService = {};

      sheetsService.addBookingRow = addBookingRow;
      sheetsService.availableRooms = availableRooms;

      return sheetsService;

      /////////////////////////////////////////////
    
      /* Add a booking row with the data passed */
      function addBookingRow(data) {
        gapiService.append({
          spreadsheetId: $rootScope.config.bookingSheetId,
          range: $rootScope.config.bookingSheet + '!A1:D1',
          values: [convertToBookingRow(data)]

        }).then(function(response) {
          console.log(response);

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
        console.log(getRooms(date));
      }
    
      function getSheetName(date) {
        return (utils.getMonthName(date) + utils.getShortYear(date));
      }
      
       /**
         * Returns an array of room objects. Each contains: 
         *    - name: the room name
         *    - beds: an array of bed objects, each with:
         *      - name: the bed name
         *      - row: the number of the row for the bed
         */
      function getRooms(date) {
        // get the first column of the sheet for a particular month - this should contain all the room names. Room names start with "HAB"
        return gapiService.get({
            spreadsheetId: $rootScope.config.roomsSheetId,
            range: getSheetName(date) + '!A1:A100',
            majorDimension: "COLUMNS"
          
          }).then(function(response) {
            var rooms = [];
          
            // run through the cells, identiyfying and adding rooms
            response.result.values[0].forEach(function (cell, index) {
              
              // Rooms should start with "HAB" and have a - character separating the room name and the bed name
              // process the cell only if these conditions are met
              if (!(cell.substring(0, 3) === "HAB" && cell.indexOf("-") > -1)) {
                return;
              }
              
              var splitCell = cell.split("-");
              var roomName = splitCell.shift().trim();
              var bedObj = {
                name: splitCell.join("-").trim(),
                row: index + 1
              };
              
              var existingRoom = rooms.find(function (room) { 
                return room.name === roomName
              });
              
              // If the room has already been added
              if (existingRoom) {
                existingRoom.beds.push(bedObj);
              } else {
                // Otherwise add a new room object
                rooms.push({
                  name: roomName,
                  beds: [bedObj]
                });
              } 
            });
           
            console.log(rooms);
            return rooms;
          });
      }
      
      /* Get the column number within the sheet to look at for a particular date */
      function getColumn(date) {
        // get the first row of the sheet for a particular month - this should contain all the dates in that month
        return gapiService.get({
            spreadsheetId: $rootScope.config.roomsSheetId,
            range: getSheetName(date) + '!A1:CC1',
            valueRenderOption: "UNFORMATTED_VALUE"
          
          }).then(function(response) {
            // convert our date to the sheets format
            var formattedDate = utils.toSheetsDate(date);
          
            // check the row of dates for this date
            var index = response.result.values[0].indexOf(formattedDate);
            if (index === -1) {
              // if the date could not be found
              return false;
            }
            
            // return the column letter found
            var column = utils.getColumnLetter(index);
            return column;
          });
      }
    });
})();
