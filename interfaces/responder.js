define([ ], function ( ) {
    // AMD: return the object to be used as a parameter when the module is included in require/define
	return {
		/**
		 * The names of the staticMethods a repsonder implementation must possess
		 * @property {Array} staticMethods
		 * @static
		 * @final
		 * @default [ 'getName', 'getNamespace', 'getCount' ]
		 */
		staticMethods: [ ],
		/**
		 * The names of the instanceMethods a responder implementation must possess
		 * @property {Array} instanceMethods
		 * @static
		 * @final
		 * @default [ 'init', 'remove' ]
		 */
		instanceMethods: [ 'respondToNotification' ],
		/**
		 * The name of the interface
		 * @property {String} _name
		 * @private
		 * @static
		 * @final
		 * @default 'responder'
		 */
		_name: 'responder',
		/**
		 * Get the name of the interface
		 * @method getName
		 * @static
		 * @returns 'responder'
		 */
		getName: function ( ) {
			return this._name;
		}
    };
});
