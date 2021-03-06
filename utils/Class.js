define([ 'jquery', 'utils/classify' ], function ( $, classify ) {
	/**
        A constructor function to use as the basis for class-based inheritance. It takes an object containing the names and starting values for private, instance properties, and adds methods for getting and setting those properties, and in the case of methods, for calling them. If property "x" is defined, and "getX" or "setX" is also defined, then they will be used automatically as the getter and setter. If property "x" is a function, and "callX" is also defined, then it will be called instead of calling the method directly. 
        @class Class
        @namespace utils
        @module utils
        @constructor
        @param {Object} [_] Key-value mapping for defining private instance variables
	*/
	var Class =  function ( _ ) {
		/**
             Call a private method of the instance
             @method call_
             @param {String} method The name of a private instance method to call
		 */
        this.call_ = function ( method ) {
            var args,
                caller;

            if ( typeof _[method] === 'function' ) {
                caller = 'call' + method.charAt(0).toUpperCase() + method.slice(1);
                if ( typeof _[caller] === 'function' ) {
                    _[caller].apply(this, arguments);
                } else {
                    args = $.makeArray(arguments);
                    _[args.shift()].apply(this, args);
                }
            } else {
                throw('No such method.');
            }
        };
        /**
            Get the value of a private property of the instance
            @method get_
            @param {String} property The name of the property whose value should be returned
            @return unknown The value of the property
        */
        this.get_ = function ( property ) {
            var getter;

            if ( typeof _[property] !== 'undefined' ) {
                getter = 'get' + property.charAt(0).toUpperCase() + property.slice(1);
                if ( typeof _[getter] === 'function' ) {
                    return _[getter]();
                } else {
                    return _[property];
                }
            } else {
                throw('No such property.');
            }
        };
        /**
            Set the value of a private property of the instance
            @method set_
            @param {String} property The name of the property whose value should be set
            @param unknown The value to assign to the property
        */
        this.set_ = function ( property, value ) {
            var setter;

            if ( typeof _[property] !== 'undefined' ) {
                setter = 'set' + property.charAt(0).toUpperCase() + property.slice(1);
                if ( typeof _[setter] === 'function' ) {
                    _[setter](value);
                } else {
                    _[property] = value;
                    this._get(property);
                }
            } else {
                throw('No such property.');
            }
        };
    };

    Class.prototype = { };
    Class.prototype.init = function ( ) {
       Class.addInstance(this);
    };
    Class.prototype.remove = function ( ) {
        Class.removeInstance(this);
    }; 
    Class.prototype.constructor = Class;
    classify(Class, 'Class', 'util');
	// AMD: return the constructor for use as a parameter when calling define/require
	return Class;
});
