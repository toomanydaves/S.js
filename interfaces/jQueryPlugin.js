define([ ], function ( ) {
	/**
	 * The requirements that any class used as the basis for a jQuery plugin must fulfill.
	 * @class JQueryPlugin
	 * @namespace interfaces
	 * @interface
	 * @singleton
	 */
	return {
		/**
		 * The names of the staticMethods a class used as the base of a plugin must implement
		 * @property {Array} staticMethods
		 * @static
		 * @final
		 * @default [ 'getName', 'getNamespace', 'getCount' ]
		 */
		staticMethods: [ 'getName', 'getNamespace', 'getCount' ],
		/**
		 * The names of the instanceMethods a class used as the base of a jQuery plugin must implement
		 * @property {Array} instanceMethods
		 * @static
		 * @final
		 * @default [ 'init', 'remove' ]
		 */
		instanceMethods: [ 'init', 'remove' ],
		/**
		 * The name of the interface
		 * @property {String} _name
		 * @private
		 * @static
		 * @final
		 * @default 'JQueryPlugin'
		 */
		_name: 'JQueryPlugin',
		/**
		 * Get the name of the interface
		 * @method getName
		 * @static
		 * @returns 'JQueryPlugin'
		 */
		getName: function ( ) {
			return this._name;
		}
	};
});
