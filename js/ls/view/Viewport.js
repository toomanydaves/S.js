/**
 * @module view
 */
define([ 'jquery', 'utility/jquery.step', 'ls/view' ], function ($, step, view) {
    /**
     * Viewport is used to display the screens holding the content of individual viewpoints. These screens can be
     * shifted left and right, as the user moves deeper or shallower in a particular context, or replaced entirely when
     * the context changes.
     * @class Viewport
     * @namespace view
     * @constructor
     * @param {Object} $el A jQuery object containing the element to use as the basis for the viewport
     * @param {Object} [options] An object to use to override the default settings
     */
    view.Viewport = function ( $el , options ) {
        /**
         * The configuration for the current viewport instance
         * @property _settings
         * @type {Object}
         * @private
         */
        this._settings = $.extend({}, view.Viewport.defaults, options);
        /**
         * A jQuery object containing the element used as the basis for the viewport
         * @property _$el
         * @type {Object}
         * @private
         */
        this._$el = $el.addClass('lsviewport');
        view.Viewport.count++;
    };
    /**
     * The number of existing viewport instances
     * @property count
     * @type {Number}
     * @static
     */
    view.Viewport.count = 0;
    view.Viewport.defaults = {
        /**
         * When removing then adding new screens in the viewport, the amount to pause in between
         * @attribute delay
         * @type {Number}
         * @static
         * @default 300(ms)
         */
        delay: 300,
        /**
         * The duration for a screen to animate into/out of position
         * @attribute duration
         * @type {Number}
         * @static
         * @default 700(ms)
         */
        duration: 700,
        /**
         * The padding to insert between the screen and the viewport
         * @attribute viewportPadding
         * @type {Number}
         * @static
         * @default 8(px)
         */
        viewportPadding: 8
    };
    view.Viewport.prototype = {
        /**
         * Shift the screens right, removing the previously active screen.
         * @method shiftRight
         */
        shiftRight: function ( callback ) {
            var viewport = this,
                $screens = $('.lsviewport-screen', this._$el),
                $activeScreen = $screens.filter(':last'), 
                process;

            if ( $screens.length ) {
                process = {
                    stepsRequired: 1,
                    callback: callback
                };
                if ( $screens.length > 1 ) {
                    process.stepsRequired++;
                    $screens.filter(':eq(' + ($screens.length - 2) + ')').show().animate(
                        { left: viewport._settings.viewportPadding }, viewport._settings.duration, 
                        'swing', 
                        function ( ) {
                            $.step(process);
                        }
                    );
                }
                $activeScreen.animate({ left: $(window).width() }, this._settings.duration, 'swing', function ( ) {
                    $activeScreen.remove();
                    $.step(process);
                });
            } else {
                if ( callback ) {
                    callback();
                }
            }
        },
        /**
         * Shift the screens left, adding a new, active screen.
         * @method shiftLeft
         * @param {String} url The URL to call to get the content for the screen
         * @param {Object||String} [data] A map or string to send along with the request 
         * @param {Function} [callback] A function to call once the screen has been positioned in the viewport
         */
        shiftLeft: function ( url, data, callback ) {
            var viewport = this,
                $screens = $('.lsviewport-screen', this._$el),
                $activeScreen,
                $screen,
                position,
                loadAndPosition;

            position = {
                stepsRequired: 1,
                callback: callback
            };
            loadAndPosition = {
                stepsRequired: 2,
                callback: function ( ) {
                    /**
                     * The event to bind to when a screen is in position and the content has been loaded.
                     * @event lsviewport.screen-ready
                     */
                    $screen.trigger('lsviewport.screen-ready');
                }
            };
            if ( $screens.length ) {
                position.i++;
                $activeScreen = $screens.filter(':last');
                $activeScreen.animate(
                    { left: -($activeScreen.offset().left + $activeScreen.width()) },
                    viewport._settings.duration,
                    'swing',
                    function ( ) {
                        $activeScreen.hide();
                        step(position);
                    }
                );
            }
            $screen = $('<div class="lsviewport-screen"></div>')
                .appendTo(this._$el)
                .css('left', $(window).width())
                .append('<img class="lsviewport-screen-loading" src="' + this._settings.loadingGif + '" />')
                .animate({ left: this._settings.viewportPadding }, this._settings.duration, 'swing', function ( ) {
                    step(position);
                    step(loadAndPosition);
                });
            $.get(url, data, function ( response ) { $screen.html(response); $.step(loadAndPosition); }, 'html');
        },
        /**
         * A stub which can be used to execute code when a transition is finished
         * @method activate
         */
        activate: function ( ) { },
        /**
         * A stub which can be used to execute code before a transition begins
         * @method deactivate
         */
        deactivate: function ( ) { },
        /** 
         * Remove all viewport elements
         * @method remove
         */
        remove: function ( ) {
            this._$el.remove();
            view.Viewport.count--;
        }
    };
    return view.Viewport;
});
