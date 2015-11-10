# angular-odm 
AngularJS Object Database Model brings abstract model handling with locale storage "database" support. Pure model
handling with local storage mapping as persistence.

## Demo
Check out the a demo application here http://www.linslin.org/angular-odm-demo/. 
Sourcecodes of demo can be found here https://github.com/linslin/ng-odm-angularjs-demo.


## Installation

Run `bower install angular-odm`

## Configuration

#### Include the scripts (may included by bower automatically).

```html
<script src="/path/to/angular-odm.js"></script>
<script src="/path/to/localStorageDb.js"></script>
```

#### Create ODM configuration 
The configuration module needs to be named `ODMConfiguration` with a constant defined as `ODM`. 
For example in a `app/config` directory. Naming is strict. All Database configurations will be placed here.
Here is a example databaes setup with three table in it. 

```javascript
/**
 * angular-odm default configuration
 *
 * @name        ODMConfiguration
 * @author      Nils Gajsek <nils.gajsek@linslin.org>
 * @copyright   2015 linslin.org
 * @package     angular-odm
 * @version     1.0
 */
(function () {

    //use strict -> ECMAScript5 error reporting
    'use strict';


    // ################################################ AngularJS Module define // #####################################

    /**
     * ODM constant. Application default main configuration.
     *
     * @name config
     */
    angular.module('ODMConfiguration', []).constant('ODM', {
        dbSchema: {
            name: 'exampleDb',
            tables: [
                {
                    name: 'user',
                    resetOnInit: false,
                    columns: [ // localStorageDB is automatically adding a unique ID attribute to every table.
                        {name: 'firstname', type: 'text'},
                        {name: 'surname', type: 'text'},
                        {name: 'email', type: 'text'},
                        {name: 'web', type: 'text'}
                    ]
                },
                {
                    name: 'userGroup',
                    resetOnInit: false,
                    columns: [ // localStorageDB is automatically adding a unique ID attribute to every table.
                        {name: 'title', type: 'text'}
                    ]
                },
                {
                    name: 'userGroupHasUser',
                    resetOnInit: false,
                    columns: [ // localStorageDB is automatically adding a unique ID attribute to every table.
                        {name: 'userId', type: 'integer'},
                        {name: 'groupId', type: 'integer'}
                    ]
                }
            ]
        }
    })
})();
```

#### Create your model's. 
For example in a `app/model` directory. Define your model attributes by using `self._attributes`. 
Hint that `self._attributes` object needs to be defined database configuration as well. Else the model will not be
persisted in locale storage. 

```javascript
/**
 * User model
 *
 * @name        model.user
 * @author      Nils Gajsek <info@linslin.org>
 * @copyright   Nils Gajsek
 * @package     angular-odm
 * @version     1.0
 */
(function () {

    //use strict -> ECMAScript5 error reporting
    'use strict';


    // ################################################ angularJS Module define // #####################################

    /**
     * User Model, Application model.
     */
    angular
        .module('model.user', []) // [-_-]
        .factory('userModel', ['$odm', userModel]);


    /**
     * User model object
     *
     * @param {object} $odm
     *
     * @returns {self}
     */
    function userModel($odm) {

        //Init object
        var self = this;

        //define model object table
        self._table = 'user';

        //define model attributes configuration
        //every attribute is access able via "modelclass.attributeKey"
        // HINT: "modelclass.ID" is automatically added by localStorageDB
        self._attributes = [
            {name: 'firstname', type: 'text'},
            {name: 'surname', type: 'text'},
            {name: 'email', type: 'text'},
            {name: 'web', type: 'text'}
        ];

        //Init model and return -> will merge modelChild and parent class
        return $odm.model().getInstance().init(self);
    }
})();
```


# Documentation

## Primary key handling

## DB Configuration
You need to setup a strict named database configuration AngularJS module. 

## Model Configuration 

## Model API

#### model.ID

#### model.save();
#### model.update();
#### model.findAll();
#### model.findByPk();
#### model.findByAttributes();
#### model.findByAttributes();
#### model.findAllByAttributes();
#### model.countAll();
#### model.countByAttributes();
#### model.deleteByPk();
#### model.deleteByAttributes();
#### model.deleteAll();
#### model.validate();

## Changelog

#### Version 0.0.1 
- First stable release 