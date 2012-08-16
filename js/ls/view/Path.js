/**
 * @module view
 */
define([ 'jquery', 'ls/view' ], function ($, view) {
    /**
     * Path is a used to display a breadcrumb list of the viewpoints currently loaded in the application.
     * @namespace view
     * @class Path
     * @constructor
     * @param {Object} $el A jQuery object containing the element to use as the basis for the path
     * @param {Object} [options] An object to use to override the default settings
     */
    view.Path = function ( $el, options ) {
        /**
         * The configuration for the current path instance
         * @property _settings
         * @type {Object}
         * @private
         */
        this._settings = $.extend({}, view.Path.defaults, options);
        /**
         * A jQuery object indicating what entry in the path is currently active..
         * @property _$pointer
         * @type {Object}
         * @private
         */
        this._$pointer = $('<img id="lspath-pointer" src="' + this._settings.pointerPng + '" />')
            .appendTo($('body')).css('left', '-9999');
        /**
         * A jQuery object containing the element used as the basis for the path
         * @property _$el
         * @type {Object}
         * @private
         */
        this._$el = $el.addClass('lspath');
        view.Path.count++;
    };
    /**
     * The number of existing Path instances
     * @property count
     * @type {Number}
     * @static
     */
    view.Path.count = 0;
    view.Path.defaults = {
        /**
         * When removing then adding new entries in the path, the amount to pause in between
         * @attribute delay
         * @type {Number}
         * @static
         * @default 300(ms)
         */
        delay: 300,
        /**
         * The duration for an entry to animate into/out of position
         * @attribute duration
         * @type {Number}
         * @static
         * @default 700(ms)
         */
        duration: 700,
        /**
         * The padding to insert between entries
         * @attribute pathPadding
         * @type {Number}
         * @static
         * @default 8(px)
         */
        pathPadding: 8,
        /**
         * The path to the image to use for the pointer underneath the path
         * @attribute pointerPng
         * @type {String}
         * @static
         * @default '/js/jquery/plugins/jquery.lsview.pointer.png'
         */
        pointerPng: '/js/jquery/plugins/jquery.lsview.pointer.png'
    };
    view.Path.prototype = {
        /**
         * Pop the top entry off the path.
         * @method pop
         * @param {Function} [callback] A function to call after the entry has been removed from the path
         */
        pop: function ( callback ) {
            var path = this,
                $lastEntry = $('.lspath-entry', this._$el).filter(':last');
                
            // Delete the last divider. 
            $('.lspath-divider', this._$el).filter(':last').remove();
            // Set the width of the entry to prevent it from collapsing when it nears the end of the browser window
            $lastEntry.width($(window).width()).animate(
                { left: $(window).width() },
                path._settings.duration,
                'swing',
                function ( ) {
                    $lastEntry.remove();
                    if ( callback ) {
                        callback();
                    }
                }
            );
        },
        /**
         * Push a new entry onto the path.
         * @method push
         * @param {String} name The name that should appear in the path for the entry
         * @param {Function} [callback] A function to call after the entry has been added to the path
         */
        push: function ( name, callback ) {
            var path = this,
                $lastChild = this._$el.children().filter(':last'),
                left = this._settings.pathPadding,
                $divider,
                $entry;
            // If there are already entries in the path...
            if ( $('.lspath-entry', this._$el).length ) {
                // ... find the right-most point,...
                left = $lastChild.offset().left + $lastChild.width();
                // ... add a divider and ...
                $divider = $('<div class="lspath-divider">&#47;</div>')
                    .appendTo(this._$el).css('left', left + this._settings.pathPadding);
                // ... recalculate the value of the right-most point.
                left = left + $divider.width() + (2 * this._settings.pathPadding);
            }
            // Add an entry offscreen with a fixed width, ...
            $entry = $('<div class="lspath-entry">' + name + '</div>')
                .appendTo(this._$el).css({ left: $(window).width(), width: $(window).width() });
            // ... animate into position...
            $entry.animate(
                { left: left },
                path._settings.duration,
                'swing',
                function ( ) {
                    // ... and reset the width.
                    $entry.css('width', 'auto');
                    if ( callback ) {
                        callback();
                    }
                }
            );
        },
        /**
         * When the path is activated, the last entry becomes the active entry and the pointer is placed underneath it;
         * all others become clickable.
         * @method activate
         */
        activate: function ( ) {
            var $entries = $('.lspath-entry', this._$el),
                $activeEntry,
                pointerOffset;
            // Make the last entry active.
            $activeEntry = $entries.filter(':last')
                .unbind('click').removeClass('.lspath-entry-inactive').attr('id', 'lspath-entry-active');
            // Make all other entries inactive.
            $entries.not($activeEntry).addClass('.lspath-entry-inactive').unbind('click').click(function ( ) {
                $(this).closest('.lsview').lsview([ 'removeViewpoints', $entries.length - 1 - $entries.index(this) ]);
            });
            // If there is an active entry,...
            if ( $activeEntry ) {
                // ... use its location as a basis...
                pointerOffset = $activeEntry.offset();
                pointerOffset.left += $activeEntry.width() / 2;
                pointerOffset.top = this._$el.offset().top + this._$el.height() + 1;
                // ... and position the pointer.
                this._$pointer.offset(pointerOffset);
            }
        },
        /**
         * When the path is in transition, deactive the active level and hide the pointer.
         * @method deactivate
         */
        deactivate: function ( ) {
            $('#lspath-entry-active', this._$el).removeAttr('id');
            this._$pointer.css('left', -9999); 
        },
        /**
         * Remove all path elements.
         * @method
         */
        remove: function ( ) {
            this._$pointer.remove();
            this._$el.remove();
            view.Path.count--;
        }
    };
    return view.Path;
});
