define([ 'jquery', 'utils/Class' ], function ( $, Class ) {
	/* 
	Enable access to the properties of the parent class within the constructor by binding what will become its 
	eventual prototype to a local variable. 
	*/
    var parent = new Class(),
        /**
         * @class ViewClass a base class for views
         * @namespace view
         * @extends utils.Class
         * @param {Object} [_] A map of name-value pairs to add as private properties for the instance.
         * @constructor
         */
        View = function ( _ ) {
            /* 
            Use an object to define private, instance properties, while incorporating any non-conflicting private 
            property wishes, passed in the form of a parameter to the constructor, from child classes.
            */
            var _ = $.extend(true, _, {
                /**
                 * @property title the title of the view
                 * @private
                 * @type {String}
                 */
                title: null,
                /**
                 * @property description a description of the view
                 * @private
                 * @type {Array} A collection of the lines of text describing the view
                 */
                description: [ ],
                /**
                 * @property url the url to call to get the view
                 * @private
                 * @type {String}
                 */
                url: null,
                /**
                 * @property data a map of properties to pass along with the url when requesting the view
                 * @private
                 * @type {Object}
                 */
                data: { },
                /**
                 * @property $el the jQuery set consisting of the element that is the container for the view
                 * @type {Object}
                 * @private
                 */
                $el: null
            });
            /*
            Call the parent object's constructor passing the private properties to be added to the instance.
            */
            parent.constructor.call(this, _);
            /* 
            Extend the instance with properties unique to the class. These will override any such properties of parent 
            classes and may be overridden by other classes inheriting from the constructor.
            
            To best deal with these eventualities, make expectations clear as possible: If the assumption is that 
            the property doesn't exist on a parent class - which should typically be the case for all properties aside
            from functions - then an exception should be thrown when it does; in the case of functions, when they do 
            exist, it is recommended that parent functions be called before anything else in functions that override 
            them; strings and arrays may be concatenated; objects extended; numbers added together; etc.
            */
            /* 
            Set the constructor property on the instance to the constructor function to enable future inheritance.
            */.
            this.constructor = View;
            /**
             * @method init initialize and configure
             * @privileged
             * @param {Object} $el a jQuery set containing the element to use as the container for the view
             * @param {Object} [options] a configuration object to override the default settings
             */
            this.init = function ( $el, options ) {
                var view = this,
                    settings; 

                // If it exists...
                if ( typeof parent.init === 'function' ) {
                    // ... call the method on the parent.
                    parent.init.apply(this, arguments);
                }
                // Initialize private, instance variables. 
                settings = view._get('settings');
                view._set('settings', $.extend(settings, View.defaults, options));
                view._set('$el', $el.addClass('view').data('view', view));
                // Add a reference to the instance on the constructor.
                View.addInstance(view);
            };
            /**
             * @method remove remove all traces of the instance
             * @privileged
             */
            this.remove = function ( ) {
                var $el = this._get('$el');

                // If it exists...
                if ( typeof parent.remove === 'function' ) {
                    // ... call the method on the parent.
                    parent.remove.apply(this, arguments);
                }
                // Remove any DOM elements and events.
                if ( $el && $el.length ) {
                    $el.empty().remove();
                }
                // Delete the reference to the instance on the constructor.
                View.removeInstance(this);
            };
        };
    /*
    Use the parent object as the prototype for the constructor function to establish inheritance.
    */
    View.prototype = parent; 
    /*
    Extend the prototype to add new public methods to instances of the class. These will not be able to call parent 
    methods they override.
    */
    // TODO
    /* 
    Extend the constructor function to add static properties and methods.
    */
    /**
     * default config for all instances
     * @property defaults map of property-values
     * @type {Object}
     * @static
     */
    View.defaults = {
        //TODO
        /**
         * translations for texts
         * @attribute i18n
         * @type {Object}
         */
        i18n: { }
    };
    // Add standard class properties to constructor.
    classify(View, 'View', 'view');
    // AMD: return the constructor for use as a parameter when calling define/require.
    return View;
});
