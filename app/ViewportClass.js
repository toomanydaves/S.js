define([ 'jquery', 'utils/Class', 'app/AppClass', 'utils/step' ], function ( $, Class, AppClass, step ) {
    /**
        used to display screens holding the content of individual viewpoints. These screens can be shifted left and right, as the user moves deeper or shallower in a particular context, or replaced entirely 
        @class ViewportClass 
        @namespace app
        @extends utils.Class
        @param {Object} [_] a collection of private properties to add to the instance
        @constructor
    */
    var ViewportClass = function ( _ ) {
    	var _ = $.extend(true, { }, _, {
            /**
                @property settings the configuration for the current viewport instance
                @private
                @type {Object}
             */
            settings: { },
            setSettings: function (settings) {
                _.settings = $.extend(true, _.settings, settings);
            },
            /**
                @property initiators the collection of initiators that the viewport responds to
                @private
                @type {Array}
             */
            initiators: [ ],
            /**
                @property $el a jQuery object containing the element used as the basis for the viewport
                @private
                @type {Object}
             */
            $el: null,
            /**
                @method activate
                @private
             */
            activate: function ( ) { },
            /**
                @method deactivate
                @private
             */
            deactivate: function ( ) { },
            /**
                @method push push a new screen into the viewport
                @private
                @param {String} url The URL to call to get the content for the screen
                @param {Object||String} [data] A map or string to send along with the request 
                @param {Object} [waitFor] A pointer to an object with a responses property
                @param {Function} [callback] A function to call after the entry has been added to the path
             */
            push: function ( url, data, waitFor, callback ) {
                var viewport = this,
                    settings = viewport._get('settings'),
                    name = ViewportClass.getName().toLowerCase(),
                    $el = viewport._get('$el'),
                    $screens = $('.' + name + '-screen', $el),
                    $activeScreen,
                    $screen,
                    inPosition,
                    loadedAndInPosition;

                inPosition = {
                    stepsRequired: 1,
                    callback: function ( ) {
                        if ( typeof callback === 'function' ) {
                            if ( typeof waitFor.responses === 'number' && waitFor.responses > 0 ) {
                                waitFor.responses--;
                                if ( !waitFor.responses ) {
                                    callback();
                                }
                            } else {
                                throw('Viewport was not able to parse waitFor object to run callback on push.');
                            }
                        } 
                    }
                };
                loadedAndInPosition = {
                    stepsRequired: 2,
                    callback: function ( ) {
                        /**
                         * Event to bind to when a screen is in position and the content has been loaded
                         * @event viewport.sreen-ready
                         */
                        $screen.trigger(name + '.screen-ready');
                    }
                };
                if ( $screens.length ) {
                    inPosition.stepsRequired++;
                    loadedAndInPosition.stepsRequired++;
                    $activeScreen = $screens.filter(':last');
                    $activeScreen.animate(
                        { left: -($activeScreen.offset().left + $activeScreen.width()) },
                        settings.duration,
                        'swing',
                        function ( ) {
                            $activeScreen.hide();
                            step(inPosition);
                            step(loadedAndInPosition);
                        }
                    );
                }
                $screen = $(
                    [
                        '<div class="' + name + '-screen">',
                            '<div class="' + name + '-content">',
                                '<img class="' + name + '-screen-loading" src="' + settings.loadingGif + '" />',
                            '</div',
                        '</div>'
                    ].join('')
                )
                .appendTo($el)
                .css('left', $(window).width())
                .animate(
                    { left: settings.screenMargin },
                    settings.duration,
                    'swing',
                    function ( ) { step(inPosition); step(loadedAndInPosition); }
                );
                $.get(url, data, function ( response ) { 
                	$screen.find('.' + name + '-content').html(response); 
                	step(loadedAndInPosition); 
                }, 'html');
            },
            /**
                @method pop pop the active screen off the viewport
                @private
                @param {Object} [waitFor] A pointer to an object with a responses property
                @param {Function} [callback] A function to call after the title has been removed from the path
             */
            pop: function ( waitFor, callback ) {
                var viewport = this,
                    name = ViewportClass.getName().toLowerCase(),
                    settings = viewport._get('settings'),
                    $el = viewport._get('$el'),
                    $screens = $('.' + name + '-screen', $el),
                    $activeScreen = $screens.filter(':last'),
                    tryCallback,
                    popped;
                
                attemptCallback = function ( ) {
                    if ( typeof callback === 'function' ) {
                        if (
                            waitFor &&
                            typeof waitFor.responses === 'number' &&
                            waitFor.responses > 0
                        ) {
                            waitFor.responses--;
                            if ( !waitFor.responses ) {
                                callback();
                            }
                        } else {
                            throw('Viewport was not able to parse waitFor object to run callback on pop.');
                        }
                    }
                };
                if ( $screens.length ) {
                    popped = {
                        stepsRequired: 1,
                        callback: attemptCallback
                    };
                    if ( $screens.length > 1 ) {
                        popped.stepsRequired++; 
                        $screens.filter(':eq(' + ($screens.length - 2) + ')').show().animate(
                            { left: settings.screenMargin },
                            settings.duration,
                            'swing',
                            function ( ) { step(popped); }
                        );
                    }
                    $activeScreen.animate(
                        { left: $(window).width() },
                        settings.duration,
                        'swing',
                        function ( ) { $activeScreen.remove(); step(popped); }
                    );
                } else {
                    attemptCallback();
                }
            }
        });

    	ViewportClass.prototype.constructor.call(this, _);
    	this.constructor = ViewportClass;
        /**
            @method init config and initialize the viewport
            @param {Object} $el a jQuery object wrapping the element to use as the container for the viewport
            @param {Object} [options] a collection of key-value pairs to store in the settings of the viewport
        */
        this.init = function ( $el, options ) {
            var viewport = this,
                name = ViewportClass.getName().toLowerCase();

            if ( typeof ViewportClass.prototype.init !== 'function' ) {
            	throw('ViewClass expects it\'s prototype to implement an init method.');
            }
            ViewportClass.prototype.init.apply(this, arguments);
            viewport._set('settings', $.extend(true, ViewportClass.defaults, options));
            viewport._set('$el', $el.addClass(name).data(name, viewport));
            ViewportClass.addInstance(viewport);
        };
        /**
            @method remove removes all traces of the viewport
        */
        this.remove = function ( ) {
            var $el = this._get('$el');

            if ( typeof ViewportClass.prototype.remove === 'function' ) {
            	ViewportClass.prototype.remove(this, arguments);
            }
            if ( $el && $el.length ) {
                $el.remove();
            }
            ViewportClass.removeInstance(this);
        };
    };
    ViewportClass.prototype = new Class();
    /**
     * @method addInitiator used to allow the viewport to respond to requests from the initiator
     * @param mixin.Initiator initiator
     */
    ViewportClass.prototype.addInitiator = function (initiator) {
        var initiators = this._get('initiators');

        if ( 
            initiator.constructor && 
            typeof initiator.constructor.getName === 'function' 
        ) {
            if ( initiator.addResponder(this) ) {
                initiators.push(initiator.constructor.getName());
            } else {
                throw('initiator would not add responder.');
            }
        } else {
            throw('Cannot add initiator to viewport');
        }
        /*
        // Consider supporting the plugin function as an initiator
        else if ( 
            initiator.baseCase &&
            typeof initiator.baseClass.getName  === 'function'
        ) { }
        */
        /*
        // Consider supporting the jQuery set as an initiator
        else if ( initiator.constructor === $ ) { }
        */
    };
    /**
        @method respondToNotification establishes how the viewport will respond when it receives a notification
        @param {Object} notification an object with initiator, type and content properties
        @param {Object} [waitFor] an object with a responses property
        @param {Function} [callback] a function to call once the wait is over
    */
    ViewportClass.prototype.respondToNotification = function (notification, waitFor, callback) {
        var viewport = this,
            initiator = notification.initiator,
            initiators = viewport._get('initiators'),
            respondsToInitiator = (
                initiator && initiators.length ?  
                ( initiators.indexOf(notification.initiator) >= 0 ) :
                false
            ),
            requiresResponse = typeof callback === 'function',
            initiatorEvents,
            appEvents,
            title,
            response;

        if ( respondsToInitiator ) {
        	// Create responses for notifications from an App.
            if ( initiator === AppClass.getName() ) {
            	initiatorEvents = AppClass.events.initiator;
            	appEvents = AppClass.events.app;
                response = initiatorEvents.PROCEED;
                switch ( notification.type ) {
                    case appEvents.PUSH_STATE:
                        url = notification.content.url;
                        if ( typeof url !== 'string' ) {
                            throw(
                                'Viewport requires a string value for the url property of the notification content'
                            );
                        }
                        viewport._call('push', url, notification.content.data, waitFor, callback);
                        response = initiatorEvents.WAIT;
                        break;
                    case appEvents.POP_STATE:
                        viewport._call('pop', waitFor, callback);
                        response = initiatorEvents.WAIT;
                        break;
                    case appEvents.ACTIVATE:
                        viewport._call('activate');
                        response = initiatorEvents.PROCEED;
                        break;
                    case appEvents.DEACTIVATE:
                        viewport._call('deactivate');
                        response = initiatorEvents.PROCEED;
                        break;
                    default:
                        throw('Viewport does not recognize app event');
                }
            } 
            return requiresResponse ? response : null;
         } else {
            throw('Viewport does not recognize initiator');
        }
    };
    // Inplement static methods of the jQueryPlugin interface and classify ViewportClass().
    classify(ViewportClass, 'Viewport', 'app');
    ViewportClass.defaults = {
        /**
         * When removing then adding new screens in the viewport, the amount to pause in between
         * @attribute delay
         * @type {Number}
         * @static
         * @default 300(ms)
         */
        delay: 2000,
        /**
         * The duration for a screen to animate into/out of position
         * @attribute duration
         * @type {Number}
         * @static
         * @default 700(ms)
         */
        duration: 1000,
        /**
         * the path to the gif to display for the loading animation
         * @attribute loadingGif
         * @type {String}
         * @default '/media/images/app/viewport.loading.gif'
         */
        loadingGif: '/media/images/app/viewport.loading.gif',
        /**
         * The margin to add around a screen 
         * @attribute screenMargin
         * @type {Number}
         * @static
         * @default 8(px)
         */
        screenMargin: 8
    };
    // AMD: Return the constructor for use as a parameter when define/require is called.
    return ViewportClass;
});
