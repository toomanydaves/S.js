/**
 * @module ui
 */
define([ 'jquery', 'ls/ux' ], function ( $, ux ) {
    /**
     * Navbar is a component for creating a full-width navigation element containing drop-down style, nested menus.
     * @class Navbar
     * @namespace ui
     * @constructor
     * @param {Object} $el A jQuery object containing an element to use as the container for the navbar
     * @param {Array} data An array of menu objects each with a name property holding an identifier string and
     * optionally a click property containing a URL string or a function, and a children property containing an array 
     * of menu objects for further nesting.
     * @param {Object} [options] An object to use to override the default settings
     */
    ui.Navbar = function ( $el, data, options ) {
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
        this._$el = $el.addClass('lsnavbar').data('lsnavbar', this);
    };
});
