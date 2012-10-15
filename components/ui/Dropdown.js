define([ 'jquery', 'utils/classify' ], function ( $, classify ) {
    /**
     * Dropdown is a solution for showing and hiding a set of options for the user to choose from.
     * @class Dropdown
     * @namespace ui
     * @constructor 
     */
    Dropdown = function ( ) {
        /**
         * The configuration for the current dropdown instance
         * @property _settings
         * @type {Object}
         * @private
         */
        this._settings = $.extend({}, Dropdown.defaults);
        /**
         * A jQuery object containing the element used as the trigger for the dropdown
         * @property _$el
         * @type {Object}
         * @private
         */
        this._$el = null;
        /**
         * A jQuery object containing the element used as the menu for the dropdown
         * @property _$menu
         * @type {Object}
         * @private
         */
        this._$menu = null;
    };
    // Add standard class properties to Dropdown().
    classify(Dropdown, 'Dropdown', 'sjs.ui');
    // Add instance methods on the prototype.
    Dropdown.prototype = {
        /**
         * Initialize, configure and add behaviors to the dropdown.
         * @method init
         * @param {Object} $el jQuery object to use as the trigger for the dropdown whose next sibling will be used as 
         * the menu
         * @param {Object} [options] An object to use to override the default settings
         */
        init: function ( $el, options ) {
            var dropdown = this,
                $dropdown = dropdown._$el,
                settings = dropdown._settings,
                $menu;

            $.extend(settings, options); 
            dropdown._$el = $el;
            dropdown._$menu = $menu = $dropdown.next().addClass('dropdown-menu');
            /**
             * When the dropdown receives a click it will close all other dropdowns and toggle its state.
             * @event click.dropdown
             */
            $dropdown.on('click.dropdown', function ( e ) {
                var $this = $(this);

                e.stopImmediatePropagation();
                if ( $this.is('.disabled, :disabled') ) {
                    return false;
                }
                Dropdown.closeDropdowns($dropdown);
                if ( $menu.hasClass('open') ) {
                    settings.close(dropdown);
                } else {
                    settings.open(dropdown);
                }
                return false;
            });
            dropdown._$el.addClass('dropdown').data('dropdown', dropdown);
            Dropdown.addInstance(dropdown);
        },
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
    /**
     * Whenever there is a click, all open dropdowns should close.
     * @event click.dropdown
     */
    $('html').on('click', function ( ) { Dropdown.closeDropdowns(); });
    /**
     * Close all dropdowns
     * @method closeDropdowns
     * @static
     * @param {Object} [$keepOpen] A jQuery object containing dropdowns to keep open
     */
    Dropdown.closeDropdowns = function ( $keepOpen ) {
        $('.dropdown-menu.open').prev('.dropdown').not($keepOpen).dropdown('close'); 
    };
    Dropdown.defaults = {
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
    return Dropdown;
});
