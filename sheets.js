'use strict';

(function () {
  angular.module("app")
    .factory("sheetsService", function (utils, $rootScope, gapiService, $q) {
      var sheetsService = {};

      sheetsService.addBookingRow = addBookingRow;
      sheetsService.addRoomEntry = addRoomEntry;
      sheetsService.availableRooms = availableRooms;

      return sheetsService;

      /////////////////////////////////////////////
    
      /* Add a booking row with the data passed */
      function addBookingRow(data) {
        return;
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
    
    /* Update the rooms for an entry */
    function addRoomEntry(data) {
      return checkRoomAvailability(data.room, data.number, data.date, data.days).then(function (room) {
        if (!room) {
          return false
        }
        
        return getDateRanges(data.date, data.days, room.startRow, room.startRow + room.beds.length).then(function (dateRanges) {
          var cellData = dateRanges.map(function (dateRange) {
            return {
              range: dateRange,
              values: []
            }
          });
          
          return gapiService.batchUpdate({
            spreadsheetId: $rootScope.config.roomsSheetId,
            data: cellData
          });
        })
      });
    }
    
      /* Check available rooms for a certain number of guests, for a particular date and number of days */
      function availableRooms(number, date, days) {
        return getRooms(date).then(function (rooms) {
          // Each room is checked and resolved to the room object with available beds if available, or to false if not
          var roomPromises = rooms.map(function (room) {
            return checkRoomAvailability(room, number, date, days);
          });
          
          return $q.all(roomPromises);
        });
      }
    
      /* Checks a room availability, returning a promise that is resolved with the room object if available, or false if not. The room object is updated with the indices of the available beds in availableBeds */
      function checkRoomAvailability(room, numberBeds, date, days) {
        if (room.beds.length < numberBeds) {
          var deferred = $q.defer();
          deferred.resolve(false);
          return deferred.promise;
        }
        
        return getDateRanges(date, days, room.startRow, room.startRow + room.beds.length).then(function (dateRanges) {
          return gapiService.batchGet({
            spreadsheetId: $rootScope.config.roomsSheetId,
             ranges: dateRanges,
             majorDimension: "COLUMNS"
          }).then(function (response) {
            var availableBeds = [];
            
            for (var i = 0; i < room.beds.length; i++) {
              var bedAvailable = true;
              // Check the bed across the ranges for each date
              response.result.valueRanges.forEach(function (valueRange) {
                if (valueRange.values && valueRange.values[0][i]) {
                  bedAvailable = false;
                }
              });
              
              if (bedAvailable) {
                availableBeds.push(i);
              }
            }

            // Check if we have enough beds available
            if (availableBeds.length >= numberBeds) {
              return room;
            } else {
              return false
            }
          });
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
              if (rooms.length > 0 && rooms[rooms.length - 1].name === roomName) {
                rooms[rooms.length - 1].beds.push(bedName);
              } else {
                // Otherwise add a new room object
                rooms.push({
                  name: roomName,
                  startRow: i + 1,
                  beds: [bedName]
                });
              } 
            }
           
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
    
    function getDateRange(date, start, end) {
      return getColumn(date).then(function (dateColumn) {
        return getSheetName(date) + "!" + dateColumn + start + ":" + dateColumn + end;
      });
    }
      
      function getDateRanges(date, days, start, end) {
        var datesArray = [], tmpDate;
        for (var i = 0; i < days; i++) {
          tmpDate = new Date(date);
          tmpDate.setDate(tmpDate.getDate() + i);
          datesArray.push(tmpDate);
        }
        
        return $q.all(datesArray.map(function (date) {
          return getDateRange(date, start, end)
        }));
      }
    });
})();
