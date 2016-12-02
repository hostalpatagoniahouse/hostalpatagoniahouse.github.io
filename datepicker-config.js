"use strict";

(function () {
  angular.module("app")
    .config(function ($mdDateLocaleProvider) {
      // Localise for spanish

      $mdDateLocaleProvider.months = ["Enero", "Febrero" ,"Marzo" , "Abril", "Mayo", "Junio", "Julio", "Agosto" , "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      $mdDateLocaleProvider.shortMonths = ['Ene', 'Feb', 'Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      $mdDateLocaleProvider.days = ['Domingo', 'Lunes', 'Martes','Miércoles','Jueves','Viernes','Sábado'];
      $mdDateLocaleProvider.shortDays = ['D', 'L', 'Ma','Mi' ,'J','V','S'];

      $mdDateLocaleProvider.parseDate = function(dateString) {
        moment.locale("es")
        var m = moment(dateString, 'L', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
      };

      $mdDateLocaleProvider.formatDate = function(date) {
        moment.locale("es")
        var m = moment(date);
        return m.isValid() ? m.format('L') : '';
      };

      // $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
      //   return myShortMonths[date.getMonth()] + ' ' + date.getFullYear();
      // };

      $mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
        return 'Semana ' + weekNumber;
      };
    });
})();
