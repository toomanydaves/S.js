define([ ], function ( ) {
	classify = function ( Constructor, name, namespace ) {
		if ( !(typeof Constructor === 'function') ) {
			$.error('Only constructor functions can be classified.');
			return;
		}
        /**
         * removes the reference to the instance from class
         * @method _removeInstance
         * @param {Object} instance
         * @private
         */
        Constructor.removeInstance = function ( instance ) {
            var instances = this._instances,
                index = instances.indexOf(instance);

            if ( index >= 0 ) {
                instances.splice(index, 1);
            }
        };
        /**
         * saves a reference to an instance of the class
         * @method addInstance
         * @param {Object} instance
         * @static
         */
        Constructor.addInstance = function ( instance ) {
            this._instances.push(instance);
        };
        /**
         * gets the number of existing instances
         * @method getCount
         * @returns {Number}
         */
        Constructor.getCount = function ( ) {
            return this._instances.length;
        };
        /**
         * returns the name of the class
         * @method getName
         * @static
         * @returns {String}  
         */
        Constructor.getName = function ( ) {
            return this._name;
        };
        /**
         * sets the name of the class
         * @method setName
         * @static
         * @param {String} name
         */
        Constructor.setName = function ( name ) {
            this._name = name;
        };
         
        /**
         * returns the namespace of the class
         * @method getNamespace
         * @static
         * @returns {String} 
         */
        Constructor.getNamespace = function ( ) {
            return this._namespace;
        };
        /**
         * sets the namespace for the class
         * @method setNamespace
         * @static
         * @param {String} namespace
         */
        Constructor.setNamespace = function ( ) {
            this._namespace = namespace;
        };
        /**
         * the name of the class
         * @property {String} _name
         * @private
         * @static
         */
        Constructor._name = name;
        /**
         * period-separated values representing the full namespace of the class
         * @property {String} _namespace
         * @private
         * @static
         * @final
         */
        Constructor._namespace = namespace;
        /**
         * a collection of all the existing instances 
         * @property {Array} _instances
         * @private
         * @static
         */
        Constructor._instances = [ ];
        /**
         * flag indicating that the class has class properties
         * @property {Boolean} hasClassProperties
         * @static
         */
		Constructor.classified = true;
	};
	// AMD: return function for use as a parameter when calling define
	return classify;
});
