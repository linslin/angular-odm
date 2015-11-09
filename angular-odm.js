/**
 * @license AngularJS v1.4.7
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {

  //ECMA6 Strict
  'use strict';


  /**
   * @ngdoc module
   * @name ngOdm
   * @description
   * AngularJS Object Database Model
   */
  angular.module('ngOdm', ['ng']).


  /**
   * @ngdoc odm
   * @name $odm
   */
  provider('$odm', ['ODM', function $odmProvider(ODM) {


    /**
     * @ngdoc service
     * @name $odm
     *
     * @description
     * Provides read/write access to browser's cookies.
     */
    this.$get = function() {
      return {
        db: function () {



          // ############################################### Functions // ############################################

          /**
           * DB init
           * Creates tables based on configured tables in config -> ODM.dbSchema
           *
           * @return {self|false}
           *
           */
          self.init = function () {

            //create locale storage database if it does not exists.
            if (ODM.dbSchema === undefined || ODM.dbSchema.name === undefined) {
              console.error('#angular-odm ! ODM.dbSchema.name not defined. Failed to initialize localeStorageDb');
              return false;
            } else {
              self.localStorageDB = new localStorageDB(ODM.dbSchema.name, localStorage);
            }

            //move through all configured tables
            angular.forEach(ODM.dbSchema.tables, function(table) {

              //Init
              var columns = [];

              //collect relation columns
              angular.forEach(table.columns, function(column) {
                columns.push(column.name);
              });

              //check drop statement
              if (table.resetOnInit && self.localStorageDB.tableExists(table.name)) {
                self.localStorageDB.dropTable(table.name);
                //console.info('Table "' + table.name + '" reset done');
              }

              //create tables query
              if((self.localStorageDB.tableExists(table.name))){
                //console.warn('Table "' + table.name + ' already exists. Skipping create table.');
              } else {
                if (self.localStorageDB.createTable(table.name, columns)) {
                  //console.info('Table "' + table.name + '" initialized');
                } else {
                  console.info('#angular-odm ! Cannot create Table "' + table.name);
                }
              }
            });

            //commit database to localStorage
            self.localStorageDB.commit();
          };


          //return {db} object
          return self;
        }
      };
    };
  }]);
})(window, window.angular);
