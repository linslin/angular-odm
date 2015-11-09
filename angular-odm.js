/**
 * @license AngularJS v1.4.7
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {

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

        // ################################################### Objects // ##############################################

        //Init odm object which will be returned by this provider.
        var odm = {
            db: null,
            model: null
        };

        /**
         * @ngdoc service
         * @name $odm
         *
         * @description
         * Provides read/write access to browser's cookies.
         */
        this.$get = ['lodash', function (lodash) {

            odm.db = function () {

                // ############################################# Functions // ##########################################

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
                        self.localStorageDBProvider = new localStorageDB(ODM.dbSchema.name, localStorage);
                    }

                    //move through all configured tables
                    angular.forEach(ODM.dbSchema.tables, function (table) {

                        //Init
                        var columns = [];

                        //collect relation columns
                        angular.forEach(table.columns, function (column) {
                            columns.push(column.name);
                        });

                        //check drop statement
                        if (table.resetOnInit && self.localStorageDBProvider.tableExists(table.name)) {
                            self.localStorageDBProvider.dropTable(table.name);
                            //console.info('Table "' + table.name + '" reset done');
                        }

                        //create tables query
                        if ((self.localStorageDBProvider.tableExists(table.name))) {
                            //console.warn('Table "' + table.name + ' already exists. Skipping create table.');
                        } else {
                            if (self.localStorageDBProvider.createTable(table.name, columns)) {
                                //console.info('Table "' + table.name + '" initialized');
                            } else {
                                console.info('#angular-odm ! Cannot create Table "' + table.name);
                            }
                        }
                    });

                    //commit database to localStorage
                    self.localStorageDBProvider.commit();
                };


                //return {db} object
                return self;
            };


            /**
             * Model handling
             * @returns {{getInstance: model.getInstance}}
             */
            odm.model = function () {

                // ################################################ Vars // ############################################

                var serviceProvider = function () {

                    /**
                     * Data store
                     * @type {Array}
                     */
                    this.data = [];


                    /**
                     * Error store
                     * @type {Array}
                     */
                    this.errors = [];
                };


                // ############################################# Functions // ##########################################

                /**
                 * Model instance provider handler
                 * This object is returned on the end of this object
                 */
                var model = {
                    getInstance: function () {
                        return new serviceProvider();
                    }
                };


                /**
                 * Model init function, provides
                 *
                 * @param childModel
                 * @returns {{this}}
                 */
                serviceProvider.prototype.init = function (childModel) {

                    //Init
                    var mergedSelf = {};

                    //combine js objects
                    for (var attrname in childModel) {
                        mergedSelf[attrname] = childModel[attrname];
                    }
                    for (var attrname in this) {
                        mergedSelf[attrname] = this[attrname];
                    }

                    //set attributes
                    angular.forEach(mergedSelf._attributes, function (attribute) {

                        switch (attribute.type) {

                            case 'pk':
                                mergedSelf[attribute.name] = null;
                                break;

                            case 'integer':
                                mergedSelf[attribute.name] = 0;
                                break;

                            case 'text':
                                mergedSelf[attribute.name] = '';
                                break;

                            default:
                                console.log('Not defined attributes type: "' + attribute.type + '" in model.init');
                                break;
                        }

                    });

                    return mergedSelf;

                };


                /**
                 * Save function
                 *
                 * @return boolean / object
                 */
                serviceProvider.prototype.save = function () {

                    //Init global self
                    var self = this;
                    var insertId;


                    if (this.validate()) {

                        //define data to insert
                        var data = {};

                        //start async progress
                        angular.forEach(self._attributes, function (attribute) {

                            switch (attribute.type) {

                                case 'pk': // do nothing with PK
                                    break;

                                case 'integer':
                                    data[attribute.name] = self[attribute.name];
                                    break;

                                case 'text':
                                    data[attribute.name] = self[attribute.name];
                                    break;

                                default:
                                    console.warn('Not defined attributes type: "' + attribute.type + '" in model.save');
                                    break;
                            }
                        });

                        //query db
                        if (insertId = odm.db().localStorageDBProvider.insert(self._table, data)) {

                            //setup current record ID
                            self.ID = insertId;

                            //commit changes to db
                            return odm.db().localStorageDBProvider.commit();
                        }

                    } else {
                        return false;
                    }
                };


                /**
                 * Update function
                 *
                 * @param {object} attributes Optional keys of fields to update. key : value.
                 */
                serviceProvider.prototype.update = function (attributes) {


                    //Init global self
                    var self = this;

                    //validate & check if PK to update is given
                    if (this.validate() && angular.isNumber(this.ID)) {

                        // define sql statement
                        var data = {};

                        //build query
                        angular.forEach(self._attributes, function (attribute) {

                            //check if attribute is in scope and overstep if not.
                            //empty scope = every attribute will be updated
                            if (Object.keys(self._attributes).length > 0 && angular.isUndefined(attributes[attribute.name])) {
                                return; //means continue in third party loops
                            }

                            switch (attribute.type) {

                                case 'pk': // do nothing with PK
                                    break;

                                case 'integer':
                                    data[attribute.name] = attributes[attribute.name];
                                    break;

                                case 'text':
                                    data[attribute.name] = String(attributes[attribute.name]);
                                    break;
                            }
                        });


                        //update row with current self.ID
                        odm.db().localStorageDBProvider.update(self._table, {ID: self.ID}, function (row) {

                            //build query
                            angular.forEach(data, function (value, key) {
                                //set new value on given attributes
                                if (data[key] !== undefined) {
                                    row[key] = data[key];
                                }
                            });

                            // return row to update
                            return row;
                        });

                        //commit changes to db
                        return odm.db().localStorageDBProvider.commit();

                    } else {
                        return false;
                    }
                };


                /**
                 * Find all items
                 *
                 * @return {object}
                 */
                serviceProvider.prototype.findAll = function () {

                    var self = this;

                    //set data
                    return self.data = odm.db().localStorageDBProvider.queryAll(self._table, {});
                };


                /**
                 * Find all rows by attributes. Return single row which was find by attributes
                 *
                 * @param {array} attributes
                 */
                serviceProvider.prototype.findAllByAttributes = function (attributes) {

                    // define sql statement
                    var result = {};

                    //Init global self
                    var self = this;

                    // unset currrent data
                    self.data = [];
                    this.data = [];
                    var data = {};

                    angular.forEach(this._attributes, function (attribute) {

                        //check if attribute is in scope and overstep if not.
                        //empty scope = every attribute will be updated
                        if (Object.keys(attributes).length > 0 && angular.isUndefined(attributes[attribute.name])) {
                            return; //means continue in third party loops
                        }

                        switch (attribute.type) {

                            case 'pk': // do nothing with PK
                                break;

                            case 'integer':
                                data[attribute.name] = attributes[attribute.name];
                                break;

                            case 'text':
                                data[attribute.name] = String(attributes[attribute.name]);
                                break;
                        }
                    });

                    return self.data = odm.db().localStorageDBProvider.queryAll(self._table, {"query": data});
                };


                /**
                 * Find by attributes. Return single row which was find by attributes
                 *
                 * @param {array} attributes
                 */
                serviceProvider.prototype.findByAttributes = function (attributes) {

                    var data = {};
                    var self = this;

                    //start async progress
                    angular.forEach(this._attributes, function (attribute) {

                        //check if attribute is in scope and overstep if not.
                        //empty scope = every attribute will be updated
                        if (Object.keys(attributes).length > 0 && angular.isUndefined(attributes[attribute.name])) {
                            return; //means continue in third party loops
                        }

                        switch (attribute.type) {

                            case 'pk': // do nothing with PK
                                break;

                            case 'integer':
                                data[attribute.name] = attributes[attribute.name];
                                break;

                            case 'text':
                                data[attribute.name] = String(attributes[attribute.name]);
                                break;
                        }
                    });

                    //query db
                    var result = odm.db().localStorageDBProvider.queryAll(self._table, {"query": data, limit: 1});

                    if (result.length > 0 && !angular.isUndefined(result[0].ID)) {
                        angular.forEach(result[0], function (value, key) {
                            self[key] = value;
                        });
                    }

                    return result[0];
                };


                /**
                 * Count by attributes. Return integer count of detected rows.
                 *
                 * @param {array} attributes
                 *
                 * @return {int}
                 */
                serviceProvider.prototype.countByAttributes = function (attributes) {

                    var data = {};
                    var self = this;

                    //start async progress
                    angular.forEach(this._attributes, function (attribute) {

                        //check if attribute is in scope and overstep if not.
                        //empty scope = every attribute will be updated
                        if (Object.keys(attributes).length > 0 && angular.isUndefined(attributes[attribute.name])) {
                            return; //means continue in third party loops
                        }

                        switch (attribute.type) {

                            case 'pk': // do nothing with PK
                                break;

                            case 'integer':
                                data[attribute.name] = attributes[attribute.name];
                                break;

                            case 'text':
                                data[attribute.name] = String(attributes[attribute.name]);
                                break;
                        }
                    });

                    //query db
                    return odm.db().localStorageDBProvider.queryAll(self._table, {"query": data}).length;
                };


                /**
                 * Find entry by primary key
                 *
                 * @param {integer} pk
                 *
                 * @return boolean
                 */
                serviceProvider.prototype.findByPk = function (pk) {

                    //check if pk is a number
                    if (angular.isNumber(pk)) {

                        var result = odm.db().localStorageDBProvider.query(this._table, {"ID": pk});

                        if (result.length > 0 && !angular.isUndefined(result[0].ID)) {
                            return result[0];
                        }
                    }

                    return {};
                };


                /**
                 * Delete row by primary key
                 *
                 * @param {int} pk
                 *
                 * @return boolean
                 */
                serviceProvider.prototype.deleteByPk = function (pk) {

                    if (angular.isNumber(pk)) {

                        //delete rows
                        odm.db().localStorageDBProvider.deleteRows(this._table, {"ID": pk});

                        //commit changes to db
                        return odm.db().localStorageDBProvider.commit();
                    }

                    return false;
                };


                /**
                 * Delete by attributes
                 *
                 * @param {arr} attributes
                 */
                serviceProvider.prototype.deleteByAttributes = function (attributes) {

                    var data = {};
                    var self = this;

                    //start async progress
                    angular.forEach(this._attributes, function (attribute) {

                        //check if attribute is in scope and overstep if not.
                        //empty scope = every attribute will be updated
                        if (Object.keys(attributes).length > 0 && angular.isUndefined(attributes[attribute.name])) {
                            return; //means continue in third party loops
                        }

                        switch (attribute.type) {

                            case 'pk': // do nothing with PK
                                break;

                            case 'integer':
                                data[attribute.name] = attributes[attribute.name];
                                break;

                            case 'text':
                                data[attribute.name] = String(attributes[attribute.name]);
                                break;
                        }
                    });

                    //delete rows
                    odm.db().localStorageDBProvider.deleteRows(self._table, data);
                    return odm.db().localStorageDBProvider.commit();
                };


                /**
                 * Delete all rows and reset indexies
                 */
                serviceProvider.prototype.deleteAll = function () {

                    //Truncate table
                    if (odm.db().localStorageDBProvider.tableExists(this._table)) {
                        odm.db().localStorageDBProvider.truncate(this._table);
                    }

                    //commit changes to db
                    return odm.db().localStorageDBProvider.commit();
                };


                /**
                 * Validate attributes
                 *
                 * @return {boolean}
                 */
                serviceProvider.prototype.validate = function () {

                    //clear errors
                    this.errors = [];
                    var self = this; // set global function instance

                    if (odm.db().localStorageDBProvider.tableExists(self._table)) {

                        //validate every attribute by type
                        angular.forEach(self._attributes, function (attribute) {
                            if (!angular.isUndefined(self[attribute.name])) {

                                switch (attribute.type) {

                                    case 'pk': // do nothing with PK
                                        break;

                                    case 'integer':
                                        if (!angular.isNumber(self[attribute.name])) {
                                            self.errors[attribute.name] = 'Integer expected';
                                        }
                                        break;

                                    case 'text':
                                        if (!angular.isString(self[attribute.name])) {
                                            self.errors[attribute.name] = 'String expected';
                                        }
                                        break;

                                    default:
                                        console.log('Not defined attributes type: "' + attribute.type + '"');
                                        break;
                                }
                            } else {
                                self.errors[attribute.name] = 'Attribute' + attribute.name + ' is undefined. Cannot validate it.';
                            }
                        })
                    } else {
                        self.errors[attribute.name] = 'Table "' + self._table + '" does not exist in db.';
                    }

                    //rewrite errors
                    this.errors = self.errors;

                    //return true/false depend on errors found
                    var result = Object.keys(this.errors).length > 0 ? false : true;

                    //return result
                    return result;
                };


                //return model -> non-singleton model instance object
                return model;
            };

            //return odm object
            return odm;
        }];
    }]);
})(window, window.angular);