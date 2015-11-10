# angular-odm 
AngularJS Object Database Model brings abstract model handling with locale storage "database" support. 

## Demo
Check out the a demo application here http://www.linslin.org/angular-odm-demo/. 
Sourcecodes of demo can be found here https://github.com/linslin/ng-odm-angularjs-demo.


## Installation

Run `bower install angular-odm`

## Configuration

#### Include the scripts (may included by bower autom.)

```html
<script src="/path/to/angular-odm.js"></script>
<script src="/path/to/localStorageDb.js"></script>
```

#### Create ODM configuration a module named `ODMConfiguration` with a constant named `ODM`. For example in a `app/config` directory. Naming is strict. All Database configurations will be placed here. 
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

#### Create your model's. For example in a `app/model` directory.



# Documentation

## DB Configuration

## Model Configuration 

## Model API

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