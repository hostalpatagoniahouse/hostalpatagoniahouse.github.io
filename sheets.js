'use strict';

(function () {
  angular.module("app")
    .factory("sheetsService", function (utils, $rootScope, gapiService, $q) {
      var sheetsService = {};
    
      var dateCache = {};
      var roomCache = {};

      sheetsService.addBooking = addBooking;
      sheetsService.availableRooms = availableRooms;

      return sheetsService;

      /////////////////////////////////////////////

      function addBooking(data) {
        return addRoomEntry(data).then(addBookingRow);
      }
    
      /* Add a booking row with the data passed */
      function addBookingRow(data) {
        var bookingRow = convertToBookingRow(data);
        
        return gapiService.append({
          valueInputOption: "RAW",
          spreadsheetId: $rootScope.config.bookingSheetId,
          range: $rootScope.config.bookingSheet + '!A1:' + utils.getColumnLetter(bookingRow.length - 1) + '1',
          values: [bookingRow]
        });
      }

      function getNameWithShortData(data) {
        return (data.source + " " + data.name + " " + data.number + "p-" + data.days + "n-#" + data.roomType + (data.arrivalHour ? "-" + data.arrivalHour + "h" : ""));
      }

      function convertToBookingRow(data) {
        return [
          getNameWithShortData(data),
          data.roomAndBeds,
          data.country,
          utils.toSheetsDate(data.date),
          data.number,
          data.days,
          data.roomType,
          data.arrivalHour,
          data.priceWithoutTax,
          data.priceWithTax,
          null,
          data.cardNumber,
          data.comments
        ];
      }
    
      /* Update the rooms for an entry */
      function addRoomEntry(data) {
        return checkRoomAvailability(data.room, data.number, data.date, data.days).then(function (room) {
          if (!room) {
            return false
          }

          return getDateRanges(data.date, data.days, room.startRow, room.startRow + room.beds.length).then(function (dateRanges) {
            var cellData = dateRanges.map(function (dateRange, index) {
              var cellValues = [], bedsUsed = 0, bedNames = [];

              for(var i = 0; i < room.beds.length; i++) {
                cellValues.push(null);
              }
              
              // Set the beds that are available for writing
              for(var i = 0; i < data.number; i++) {
                var cellName = data.name;

                // Handle the top left cell
                if (i === 0 && index === 0) {
                  cellName = data.source + " " + data.name + " #" + data.roomType + (data.arrivalHour ? "-" + data.arrivalHour + "h" : "");
                }

                // Handle the top right cell
                if (i === 0 && index === (dateRanges.length - 1) && data.priceWithTax) {
                  cellName = data.name + " " + data.priceWithTax;
                }

                cellValues[room.availableBeds[i]] = cellName;
                bedNames.push(room.beds[room.availableBeds[i]]);
              }

              // Include a string with the names of the room and all beds in the data passed on
              data.roomAndBeds = room.name + " - " + bedNames.join(",");
              
              return {
                range: dateRange,
                majorDimension: "COLUMNS",
                values: [cellValues]
              };
            });

            return gapiService.batchUpdate({
              valueInputOption: "RAW",
              spreadsheetId: $rootScope.config.roomsSheetId,
              data: cellData
            }).then(function () {
              return data;
            });
          })
        });
      }
    
      /* Check available rooms for a certain number of guests, for a particular date and number of days */
      function availableRooms(number, date, days) {
        return $q.all({
          rooms: getRooms(date),
          dateColumn: getFullColumn (date) // Prime the date cache with the starting date
        }).then(function (data) {
          // Each room is checked and resolved to the room object with available beds if available, or to false if not
          var roomPromises = data.rooms.map(function (room) {
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
            room.availableBeds = [];
            
            for (var i = 0; i < room.beds.length; i++) {
              var bedAvailable = true;
              // Check the bed across the ranges for each date
              response.result.valueRanges.forEach(function (valueRange) {
                if (valueRange.values && valueRange.values[0][i]) {
                  bedAvailable = false;
                }
              });
              
              if (bedAvailable) {
                room.availableBeds.push(i);
              }
            }

            // Check if we have enough beds available
            if (room.availableBeds.length >= numberBeds) {
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
        // Check the cache
        if (roomCache[getSheetName(date)]) {
          var deferred = $q.defer();
          deferred.resolve(roomCache[getSheetName(date)]);
          return deferred.promise;
        }
        
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
            
            roomCache[getSheetName(date)] = rooms;
            return rooms;
          });
      }
      
      /* Get the column number within the sheet to look at for a particular date */
      function getColumn(date) {
        return getFullColumn(date).then(function (fullColumn) {
          // convert our date to the sheets format
          var formattedDate = utils.toSheetsDate(date);

          // check the row of dates for this date
          var index = fullColumn.indexOf(formattedDate);
          if (index === -1) {
            // if the date could not be found
            return false;
          }

          // return the column letter found
          var column = utils.getColumnLetter(index);
          return column;
        })
      }
    
      function getFullColumn(date) {
        // Check the cache
        if (dateCache[getSheetName(date)]) {
          var deferred = $q.defer();
          deferred.resolve(dateCache[getSheetName(date)]);
          return deferred.promise;
        }
        
        // get the first row of the sheet for a particular month - this should contain all the dates in that month
        return gapiService.get({
            spreadsheetId: $rootScope.config.roomsSheetId,
            range: getSheetName(date) + '!A1:CC1',
            valueRenderOption: "UNFORMATTED_VALUE"
          
          }).then(function(response) {
            dateCache[getSheetName(date)] = response.result.values[0];
            // te quiero
            return dateCache[getSheetName(date)];
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
