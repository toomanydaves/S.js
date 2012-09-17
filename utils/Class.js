define([ 'jquery' ], function ( $ ) {
	// AMD: return the constructor for use as a parameter when calling define/require
	/**
	 * @class Class
	 * @constructor
	 * @param {Object} [_] key-value mapping for defining private instance varialbles
	 */
	return function ( _ ) {
		/**
         * call a private method of the instance
		 * @method _call
		 * @private
		 * @param {String} method the name of a private instance method to call
		 */
        this._call = function ( method ) {
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
         * get the value of a private property of the instance
         * @method _get
         * @private
         * @param {String} property the name of the property whose value should be returned
         * @return unknown the value of the property
         */
        this._get = function ( property ) {
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
         * set the value of a private property of the instance
         * @method _set
         * @private
         * @param {String} property the name of the property whose value should be set
         * @param unknown the value to assign to the property
         */
        this._set = function ( property, value ) {
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
});
