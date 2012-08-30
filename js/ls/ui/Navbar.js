/**
 * @module ui
 */
define([ 'jquery', 'ls/ui', 'ls/ui/NavbarMenu', 'ls/ui/NavbarSubmenu' ], function ( $, ui, Menu, Submenu ) {
    /**
     * Navbar is a component for creating a full-width navigation element containing drop-down style, nested menus.
     * @class Navbar
     * @namespace ui
     * @constructor
     * @param {Object} $el A jQuery object containing an element to use as the container for the navbar
     * @param {Array} data An array of menu objects each with a name property holding an identifier string and
     * optionally a click property containing a URL string or a function, and a children property containing an array 
     * of menu objects for further nesting
     * @param {Object} [options] An object to use to override the default settings
     */
    ui.Navbar = function ( $el, data, options, dictionary ) {
        var navbar = this;
        /**
         * The configuration for the current navbar instance
         * @property _settings
         * @type {Object}
         * @private
         */
        this._settings = $.extend({}, ui.Navbar.defaults, options);
        /**
         * A jQuery object containing the element used as the container for the navbar 
         * @property _$el
         * @type {Object}
         * @private
         */
        this._$el = $el;
        this._init();
        ui.Navbar.instances.push(this);
    };
    /**
     * Whenever there is a click, all open navbar menus should close.
     * @event click.navbar
     */ 
    $('html').on('click.navbar', function ( ) { ui.Navbar.closeMenus(); });
    /**
     * Close navbar menus.
     * @method closeMenus
     * @static
     * @param {Object} [$keepOpen] A jQuery object containing dropdowns to keep open
     */
    ui.Navbar.closeMenus = function ( $keepOpen ) {
        $.each(ui.Navbar.instances, function ( i, navbar ) {
            navbar.closeMenus($keepOpen);
        });
    };
    /**
     * An array of pointers to existing ui.Navbar instances
     * @property instances
     * @type {Array}
     * @static
     */
    ui.Navbar.instances = [ ];
    ui.Navbar.defaults = { };
    ui.Navbar.prototype = {
        /**
         * Find an i18n match for a string.
         * @method translate
         * @private
         * @param {String} textToTranslate 
         * @returns {String} translation The value corresponding to the text (if one exists; if not the text is 
         * returned unchanged)
         */
        _translate: function ( textToTranslate ) {
            if ( this._i18n
        closeMenus: function ( $keepOpen ) {
            $.each(this._menus, function ( i, menu ) {
                if ( menu.get$el() !== $keepOpen ) {
                    menu.close();
                }
            });
        },
        remove: function ( ) {
        }
    };
    
});
