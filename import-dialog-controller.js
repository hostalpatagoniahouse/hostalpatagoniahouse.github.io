'use strict';

(function () {
  angular.module("app")
    .controller("ImportDialogController", function ($scope, $mdDialog) {
      $scope.pastedData = "";

      $scope.import = function (data) {
        var firstLine = data.split("\n")[0]

        if (firstLine.indexOf("Hostelworld") !== -1) {
          $mdDialog.hide(importHostelworld(data));
        } else {
          $mdDialog.cancel("Unrecognized data")
        }
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      function importHostelworld(data) {
        var entry = {}

        var customerDetails = data.substring(data.indexOf("Customer Details"), data.indexOf("Room Details"))

        var customerDetails = customerDetails.split("\n").map(function (line) {
          return line.trim()
        })
        customerDetails.pop()
        customerDetails.shift()

        entry.source = "H"

        entry.name = getCustomerDetail(customerDetails, "Name")
        if (!entry.name) {
          console.log("Name not found")
        }

        entry.country = getCustomerDetail(customerDetails, "Nationality")
        if (!entry.country) {
          console.log("Country not found")
        }

        entry.arrivalHour = parseInt(getCustomerDetail(customerDetails, "Arrival Time"), 10)
        if (!entry.arrivalHour) {
          console.log("Arrival time not found")
        }

        entry.number = parseInt(getCustomerDetail(customerDetails, "Persons"), 10)
        if (!entry.number) {
          console.log("Number of people not found")
        }

        entry.date = parseHostelworldDate(getCustomerDetail(customerDetails, "Arriving"))
        if (!entry.date) {
          console.log("Arrival date not found")
        }

        entry.bookingDate = getCustomerDetail(customerDetails, "Booked")
        if (entry.bookingDate) {
          entry.bookingDate = entry.bookingDate.split(" ").slice(0, 3).join(" ")
          entry.bookingDate = parseHostelworldDate(entry.bookingDate)
        }
        if (!entry.bookingDate) {
          console.log("Booking date not found")
        }

        var priceMatches = /Balance Due[^\n\r]*CLP ([\d,\.]+)/.exec(data)
        if (priceMatches[1]) {
          entry.priceWithoutTax = parseInt(priceMatches[1].replace(",", ""), 0)
        } else {
          console.log("Price not found")
        }
        
        var roomDetails = data.substring(data.indexOf("Room Details"), data.indexOf("Service Charge"))
        roomDetails = roomDetails.split("\n")
        roomDetails.pop()
        roomDetails.shift()
        roomDetails.shift()
        
        // The indices of this array will be the number of days relative to the arrival date. The value will be the number of people on that day.
        var numberPerDay = []
        var roomType = null

        roomDetails.forEach(function (roomRow, index) {
          var dateString = roomRow.split(" ").slice(0, 3).join(" ")
          var date = parseHostelworldDate(dateString)
          var relativeDate = moment(date).diff(entry.date, "days")
          var currentRoomType = null

          if (!numberPerDay[relativeDate]) {
            numberPerDay[relativeDate] = 0
          }

          var roomTypeMatches = /([\d]+)[\s]*[Bb]ed/.exec(roomRow)
          if (roomTypeMatches[1]) {
            currentRoomType = parseInt(roomTypeMatches[1], 0)
          }
          
          if (index === 0) {
            roomType = currentRoomType
          } else {
            // If we have any room type that does not match invalidate the room type
            if (!roomType || currentRoomType != roomType) {
              roomType = null
            }
          }

          var number = /([\d]+)[\s]+CLP/.exec(roomRow)
          if (number[1]) {
            numberPerDay[relativeDate] = numberPerDay[relativeDate] + parseInt(number[1], 0)
          }
        })

        // Test the parsed date data for consistency
        var dateConsistency = true
        for (var i = 0; i < numberPerDay.length; i++) {
          if (numberPerDay[i] !== entry.number) {
            dateConsistency = false
          }
        }

        if (dateConsistency && roomType) {
          entry.days = numberPerDay.length
          entry.number = numberPerDay[0]
          entry.roomType = roomType
        } else {
          console.log("Days and room type could not be set")
        }

        console.log("Imported data", entry)
        return entry
      }

      function getCustomerDetail(customerDetailsArray, field) {
        var knownFieldNames = ["Name", "Email", "Phone", "Nationality", "Booked", "Source", "Arriving", "Arrival Time", "Persons"]
        var fieldNameIndex = customerDetailsArray.indexOf(field)
        if (fieldNameIndex === -1) {
          return ""
        }
        
        var value = customerDetailsArray[fieldNameIndex + 1]
        if (!value || knownFieldNames.indexOf(value) !== -1) {
          return ""
        }

        return value
      }

      function parseHostelworldDate(dateString) {
        moment.locale("en")
        var m = moment(dateString, "Do MMM 'YY")
        return m.isValid() ? m.toDate() : null
      }
    });
})();
