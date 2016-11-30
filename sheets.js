'use strict';

(function () {
  angular.module("app")
    .factory("sheetsService", function (utils, $rootScope, gapiService, $q) {
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
    
      /* Check available rooms for a certain number of guests, for a particular date and number of days */
      function availableRooms(number, date, days) {
        return $q.all({
          rooms: getRooms(date),
          column: getColumn(date)
        }).then(function (data) {
          // Each room is checked and resolved to the room object with available beds if available, or to false if not
          var roomPromises = data.rooms.map(function (room) {
            return checkRoomAvailability(room, data.column, number, date);
          });
          
          return $q.all(roomPromises);
        });
      }
    
      /* Checks a room availability, returning a promise that is resolved with the room object with only available beds if available, or false if not */
      function checkRoomAvailability(room, dateColumn, numberBeds, date) {
        if (room.beds.length < numberBeds) {
          var deferred = $q.defer();
          deferred.resolve(false);
          return deferred.promise;
        }
        
        return gapiService.get({
          spreadsheetId: $rootScope.config.roomsSheetId,
           range: getSheetName(date) + "!" + dateColumn + room.startRow + ":" + dateColumn + (room.startRow + room.beds.length),
           majorDimension: "COLUMNS"
        }).then(function (response) {
          return response.result.values[0];
        });
      }
    
      function getSheetName(date) {
        return (utils.getMonthName(date) + utils.getShortYear(date));
      }
      
       /**
         * Returns an array of room objects. Each contains: 
         *    - name: the room name
         *    - startRow: the row at which the room starts
         *    - beds: an array of bed names
         */
      function getRooms(date) {
        // get the first column of the sheet for a particular month - this should contain all the room names. Room names start with "HAB"
        return gapiService.get({
          spreadsheetId: $rootScope.config.roomsSheetId,
          range: getSheetName(date) + '!A1:A100',
          majorDimension: "COLUMNS"
          
          }).then(function(response) {
            var rooms = [];
          
            // run through the cells, identifying and adding rooms
            var cell, cellList = response.result.values[0];
            for (var i = 0; i < cellList.length; i++) {
              cell = cellList[i];
              
              // Rooms should start with "HAB" and have a - character separating the room name and the bed name
              // process the cell only if these conditions are met. We assume that rooms are vertically continuous
              if (!(cell.substring(0, 3) === "HAB" && cell.indexOf("-") > -1)) {
                if (rooms.length > 0) {
                  // Exit the loop if rooms have been found- this means were at the end
                  break;
                } else {
                  // Skip the cell and continue the loop if rooms have not yet been found - these are the beginning cells to skip
                  continue;
                }
              }
              
              var splitCell = cell.split("-");
              var roomName = splitCell.shift().trim();
              var bedName = splitCell.join("-").trim();
              
              // If this belongs to the previous room
              if (rooms[rooms.length - 1].name = roomName) {
                rooms[rooms.length - 1].beds.push(bedName);
              } else {
                // Otherwise add a new room object
                rooms.push({
                  name: roomName,
                  startRow: index + 1,
                  beds: [bedName]
                });
              } 
            }
           
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
