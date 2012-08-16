/**
 * @module ui
 */
define([ 'jquery', 'ls/ui' ], function ( $, ui ) {
    /**
     * Dropdown is a solution for showing and hiding a set of options for the user to choose from.
     * @class Dropdown
     * @namespace ui
     * @constructor 
     * @param {Object} $el jQuery object to use as the trigger for the dropdown whose next sibling will be used as the
     * menu
     * @param {Object} [options] An object to use to override the default settings
     */
    ui.Dropdown = function ( $el, options ) {
        var dropdown = this;
        /**
         * The configuration for the current dropdown instance
         * @property _settings
         * @type {Object}
         * @private
         */
        this._settings = $.extend({}, ui.Dropdown.defaults, options);
        /**
         * A jQuery object containing the element used as the trigger for the dropdown
         * @property _$el
         * @type {Object}
         * @private
         */
        this._$el = $el.addClass('lsdropdown');
        /**
         * A jQuery object containing the element used as the menu for the dropdown
         * @property _$menu
         * @type {Object}
         * @private
         */
        this._$menu = $el.next().addClass('lsdropdown-menu');
        /**
         * When the dropdown receives a click it will close all other dropdowns and toggle its state.
         * @event click.dropdown
         */
        this._$el.on('click.lsdropdown', function ( e ) {
            e.stopImmediatePropagation();
            if ( dropdown._$el.is('.disabled, :disabled') ) {
                return false;
            }
            ui.Dropdown.closeDropdowns(dropdown._$el);
            if ( dropdown._$menu.hasClass('open') ) {
                dropdown._settings.close(dropdown);
            } else {
                dropdown._settings.open(dropdown);
            }
            return false;
        });
        ui.Dropdown.count++;
    };
    /**
     * Whenever there is a click, all open dropdowns should close.
     * @event click.dropdown
     */
    $('html').on('click', function ( ) { ui.Dropdown.closeDropdowns(); });
    /**
     * Close all dropdowns
     * @method closeDropdowns
     * @static
     * @param {Object} [$keepOpen] A jQuery object containing dropdowns to keep open
     */
    ui.Dropdown.closeDropdowns = function ( $keepOpen ) {
        $('.lsdropdown-menu.open').prev('.lsdropdown').not($keepOpen).lsdropdown('close'); 
    };
    /**
     * The number of existing ui.Dropdown instances
     * @property count
     * @type {Number}
     * @static
     */
    ui.Dropdown.count = 0;
    ui.Dropdown.defaults = {
        /**
         * The function that is called in order to close the dropbox
         * @attribute close
         * @type {Function}
         * @static
         */
        close: function ( dropdown ) {
            var $menu = dropdown._$menu,
                menuHeight = $menu.height();

            $menu.children().fadeOut(200, function ( ) {
                $menu.animate({ height: 0 }, 300, 'swing', function ( ) {
                    $menu.removeClass('open');
                    $menu.height(menuHeight);
                });
            });
        },
        /**
         * The function that is called in order to open the dropbox
         * @attribute open
         * @type {Function}
         * @static
         */
        open: function ( dropdown ) {
            var $menu = dropdown._$menu,
                menuHeight = $menu.height();

            $menu.children().hide();
            $menu.height(0).addClass('open').animate({ height: menuHeight }, 300, 'swing', function ( ) {
                $menu.children().fadeIn(200, function ( ) {
                    $menu.height($menu.children().outerHeight());
                });
            });
        }
    };
    ui.Dropdown.prototype = {
        /**
         * Open the dropdown menu
         * @method open
         */
        open: function ( ) {
            this._settings.open(this);
        },
        /** 
         * Close the dropdown menu
         * @method close
         */
        close: function ( ) {
            this._settings.close(this)
        }
    };
    return ui.Dropdown;
});
