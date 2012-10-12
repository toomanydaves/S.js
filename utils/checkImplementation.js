define ([ 'jquery' ], function ( $ ) {
	/**
	 * checks whether a class implements all the static and instance methods defined in the properties of the interface
	 * @namespace sjs.utilities
	 * @method checkImplementation
	 * @param {Function} Class
	 * @param {Object} Interface
	 * @return {String} An error message, if one is necessary
	 */
    checkImplementation = function ( implementation, Interface ) {
        var errors = [ ],
            staticMethods = Interface.staticMethods,
            instanceMethods = Interface.instanceMethods,
            implementationType = typeof implementation,
            classInstance,
            Class,
            errorMessage,
            method,
            error,
            i,
            addError;

        addError = function ( methodName, methodType ) {
        	errors.push(errorMessage.replace('%methodName%', methodName).replace('%methodType%', methodType));
        }
        if ( implementationType === 'function' ) {
            Class = implementation;
            classInstance = new implementation();
        } else if ( implementationType === 'object' ) {
            Class = implementation.constructor;
            classInstance = implementation;
        } else {
            error = 'Cannot check this type of implementation.';
            $.error(error);
            return error;
        }
        className = typeof Class.getName === 'function' ? Class.getName() : 'Class';
        interfaceName = 
            typeof Interface.getName === 'function' ? 
            'the ' + Interface.getName() + ' interface' : 'the interface';
        errorMessage =  
            typeof Class.getName === 'function' ? Class.getName() : 'Class' +
            ' does not implement %methodName%() - %methodType% method required by ' + 
            typeof Interface.getName === 'function' ? 'the ' + Interface.getName() + ' interface' : 'the interface' +
            '.';
        if ( staticMethods ) {
            for( i = 0; i < staticMethods.length; i++ ) {
                method = staticMethods[i];
                if ( !(typeof Class[method] === 'function') ) {
                    addError(method, 'static');
                }
            };
        }
        if ( instanceMethods ) {
            for( i = 0; i < instanceMethods.length; i++  ) {
                method = instanceMethods[i];
                if ( !(typeof classInstance[method] === 'function') ) {
                    addError(method, 'instance');
                }
            };
        }
        if ( implementationType === 'function' && typeof classInstance.remove === 'function' ) {
            classInstance.remove();
        }
        return errors.length ? errors.join(' ') : null;
    };
    // AMD: returns function to use as parameter when calling define/require
    return checkImplementation;
});
