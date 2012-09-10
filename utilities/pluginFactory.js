define(
    [
        'jquery', 
        'utilities/checkImplementation',
        'interfaces/jQueryPlugin'
    ],
    function ( $, checkImplementation, jQueryPlugin ) {
        /**
         * An singleton-style object to use to create plugins from classes.
         * @class PluginFactory
         * @namespace utilities
         * @singleton
         */
        pluginFactory = { 
            /**
             * Add a plugin to jQuery.
             * @method newJQueryPlugin
             * @static
             * @param {Class} BaseClass A constructor function to provide the base object for plugin instances. It must 
             * the interface defined by interfaces.JQueryPlugin
             * @param {String} [prefix] A string to prefix to the class name to use as the name of the function added to 
             * the jQuery prototype. When undefined, "sjs" will be used.
             */
            newJQueryPlugin: function ( BaseClass, isSingleton ) {
                var problemsWithBaseClass = checkImplementation(BaseClass, jQueryPlugin),
                    pluginFactory = this,
                    name;
                // Validate first.
                if ( problemsWithBaseClass ) {
                    $.error(problemsWithBaseClass);
                    return;
                }
                name = BaseClass.getName().toLowerCase();
                if ( $.fn[name] ) {
                    $.error(name + ' already exists.');
                    return;
                }
                // Add the plugin function to the jQuery prototype object.
                $.fn[name] = function ( ) {
                	// When calling the plugin,...
                    var args = $.makeArray(arguments),
                        request = pluginFactory._getRequest(args)
                        /*
                        ,
                        instances = [ ]
                        */
                        ;
                    // ... don't support chaining. 
                    // return 'this' (the jQuery set) to allow chaining
                    return this.each(function ( ) {
                    	// When passing a message to the plugin...
                    	var $el = $(this),
                    	    errors = pluginFactory._checkRequest($el, request.method, name, isSingleton),
                    	    plugin;
                        // ... check that the request is valid for each element in the set, ...
                    	if ( errors ) {
                    		$.error(errors);
                    	} else {
                    		if ( request.method === 'init' ) {
                                // ... instantiate the base class...
                    			plugin = new BaseClass();
                    		    // ... and add $el to the front of request.args during initialization,...
                    		    request.args.unshift($el);
                    		} else {
                                plugin = $el.data(name);
                            }
                    		// ... and finally call the requested method on the class instance.
                            plugin[request.method].apply(plugin, request.args);                    		
                        }
                        /*
                        instances.push(plugin);
                        */
                    });
                    /* 
                    return instances;
                    */
                };
                $.fn[name].baseClass = BaseClass;
            },
            /**
             * a utility method that takes an array of arguments and returns a request object with method and args 
             * properties.
             * @method _getRequest
             * @private
             * @params {Array} args
             * @returns {Object} A request object containing a method property with the string name of the method to be 
             * called and an args property containing an array of arguments to be passed to the method.
             */
            _getRequest: function ( args ) {
                var request = { method: '', args: [ ] };
                // No args is a call to init().
                if ( args.constructor !== Array || !args.length ) {
                    request.method = 'init';
                } else
                // Arguments that begin with an object are arguments for a call to init().
                if ( typeof args[0] === 'object' ) {
                    request.method = 'init';
                    request.args = args;
                } else
                // A string as the first argument identifies the method to call and all following arguments are arguments for 
                // that method.
                if ( typeof args[0] === 'string' ) {
                    request.method = args.shift();
                    request.args = args;
                }
                return request;
            },
            /* a utility method to validate a request relating to a plugin for a specific element 
             * @method _checkRequest
             * @private
             * @param {Object} $el A jQuery set containing the element the plugin function is being called on
             * @param {String} method The name of the method being called
             * @param {String} pluginName The name of the plugin function being called
             * @returns {String} A concatenated string contain all the errors, null if no errors are found.
             */
            _checkRequest: function ( $el, method, pluginName, pluginIsSingleton ) {
                var errors = [ ],
                    plugin;

                if ( !(typeof pluginName === 'string') ) {
                    return 'The name of the plugin must be passed as a string when validating a plugin request.';
                }
                if ( !(typeof $.fn[pluginName] === 'function') ) {
                    return pluginName + ' has not been registered as a jQuery plugin.';
                }
                if ( !method ) {
                    errors.push('The name of the method to be called on ' + pluginName + ' could not be determined.');
                } else
                if ( method === 'init' ) {
                    if ( $el.data(pluginName) ) {
                        errors.push(pluginName + ' "init()" cannot be called on an already initialized ' + pluginName);
                    } else if ( pluginIsSingleton && $.fn[pluginName].baseClass.getCount() ) {
                        errors.push('Cannot initialize more than one ' + pluginName);
                    }
                } else {
                    plugin = $el.data(pluginName);
                    if ( !plugin ) {
                        errors.push(method + '()  must be called on an initialized ' + pluginName + ' element.');
                    } else {
                        if ( !(typeof plugin[method] === 'function') ) {
                            errors.push(pluginName + ' has no ' + method + ' method.');
                        }
                        if ( method.charAt(0) === '_' ) {
                            errors.push(
                                pluginName + 
                                ' cannot call private methods of ' + 
                                $.fn[pluginName].baseClass.getNamespace() + 
                                '.' + 
                                $.fn[pluginName].baseClass.getName()
                            );
                        }
                    }
                }
                return errors.length ? errors.join(' ') : null;
            }
        }
        // AMD:Return a clone of the factory object for use as define() parameter.
        return $.extend({ }, pluginFactory);
    }
);
