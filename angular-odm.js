/**
 * @license AngularJS v1.4.7
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

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
  provider('$odm', [function $odmProvider() {


    /**
     * @ngdoc service
     * @name $odm
     *
     * @description
     * Provides read/write access to browser's cookies.
     */
    this.$get = function() {
      return {
        test: function () {

        }
      };
    };
  }]);
})(window, window.angular);
