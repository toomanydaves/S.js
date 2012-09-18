define([ 'jquery', 'utils/Class' ], function ( $, Class ) {
    var parent = new Class(),
        /**
         * a base class for views, inherits from Class
         * @class View 
         * @namespace view
         * @extends Class
         * @constructor
         */
        View = function ( ) {
            // Use the properties of a local variable to define private variables for the instance.
            var _ = {
                // Define private properties for the instance.
                /**
                 * the jQuery set consisting of the element that is the container for the view
                 * @property $el
                 * @type {Object}
                 * @private
                 */
                $el: null
            };

            // Call the parent object's constructor with a reference to the local variable defining the private 
            // properties to be added to the instance.
            parent.constructor.call(this, _);
            // Set the constructor property on the instance to the constructor function.
            this.constructor = View;
            // Create privileged methods.
            /**
             * initialize and configure
             * @method init
             * @privileged
             * @param {Object} $el a jQuery set containing the element to use as the container for the view
             * @param {Object} [options] a configuration object to override the default settings
             */
            this.init = function ( $el, options ) {
                var view = this,
                    settings; 

                // Call the method on the parent.
                parent.init.apply(this, arguments);
                // Initialize private, instance variables. 
                settings = view._get('settings');
                view._set('settings', $.extend(settings, App.defaults, options));
                view._set('$el', $el.addClass('view').data('view', view));
                // Add a reference to the instance on the constructor.
                View.addInstance(index);
            };
            /**
             * remove all traces of the instance
             * @method remove
             * @privileged
             */
            this.remove = function ( ) {
                var $el = this._get('$el');

                // Call the method on the parent.
                parent.remove.apply(this, arguments);
                // Remove DOM elements and events.
                if ( $el && $el.length ) {
                    $el.empty().remove();
                }
                // Delete the reference to the instance on the constructor.
                View.removeInstance(this);
            };
        };

    // Use the parent object as the prototype for the constructor function to establish inheritance.
    View.prototype = parent; 
    // Extend the prototype to add new public methods to instances of the class.
    // TODO
    // Extend the constructor function to add static properties and methods.
    /**
     * default config for all index instances
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
