define([ 'jquery', 'utilities/step', 'app/App' ], function ( $, step, App ) {
    /**
     * Viewport is used to display screens holding the content of individual viewpoints. These screens can be
     * shifted left and right, as the user moves deeper or shallower in a particular context, or replaced entirely when
     * the context changes.
     * @class Viewport
     * @namespace app
     * @constructor
     */
    var Viewport = function ( ) {
        /**
         * The configuration for the current viewport instance
         * @property _settings
         * @type {Object}
         * @private
         */
        this._settings = $.extend(true, { }, Viewport.defaults);
        /**
         * The collection of initiators that the viewport responds to
         * @property _initiators
         * @type {Array}
         * @private
         */
        this._initiators = [ ];
        /**
         * A jQuery object containing the element used as the basis for the viewport
         * @property _$el
         * @type {Object}
         * @private
         */
        this._$el = null;
    };
    // Add instance methods to the prototype object.
    Viewport.prototype = {
        // Implement the instance methods of the jQueryPlugin interface.
        init: function ( $el, options ) {
            var viewport = this,
                settings = viewport._settings,
                name = Viewport.getName().toLowerCase();

            $.extend(true, settings, options);
            viewport._$el =  $el.addClass(name).data(name, viewport);
            Viewport.addInstance(viewport);
        },
        remove: function ( ) {
            var $el = this._$el;

            if ( $el && $el.length ) {
                $el.remove();
            }
            Viewport._removeInstance(this);
        },
        // Implement the responder interface.
        addInitiator: function ( initiator ) {
            if ( 
                initiator.constructor && 
                typeof initiator.constructor.getName === 'function' 
            ) {
            	if ( initiator.addResponder(this) ) {
                    this._initiators.push(initiator.constructor.getName());
                } else {
                	throw('initiator would not add responder.');
                }
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
            else {
                throw (
                    'Cannot add object as initiator. An initiator must be an object whose constructor implements ' +
                    'getName().'
                );
            }
        },
        respondToNotification: function ( notification, waitFor, callback ) {
            var viewport = this,
                initiator = notification.initiator,
                initiators = viewport._initiators,
                respondsToInitiator = (
                    initiator && initiators.length ?  
                    ( initiators.indexOf(notification.initiator) >= 0 ) :
                    false
                ),
                requiresResponse = typeof callback === 'function',
                title,
                response;

            if ( respondsToInitiator ) {
                if ( initiator === App.getName() ) {
                    response = App.events.initiator.PROCEED;
                    switch ( notification.type ) {
                        case App.events.app.PUSH_STATE:
                            url = notification.content.url;
                            if ( typeof url !== 'string' ) {
                                throw(
                                    'Viewport requires a string value for the url property of the notification content'
                                );
                            }
                            viewport._push(url, notification.content.data, waitFor, callback);
                            response = App.events.initiator.WAIT;
                            break;
                        case App.events.app.POP_STATE:
                            viewport._pop(waitFor, callback);
                            response = App.events.initiator.WAIT;
                            break;
                        case App.events.app.ACTIVATE:
                            viewport._activate();
                            response = App.events.initiator.PROCEED;
                            break;
                        case App.events.app.DEACTIVATE:
                            viewport._deactivate();
                            response = App.events.initiator.PROCEED;
                            break;
                        default:
                            throw('Viewport does not recognize app event');
                    }
                } 
                return requiresResponse ? response : null;
             } else {
                throw('Viewport does not recognize initiator');
            }
        },
        /**
         * A stub which can be used to execute code when a transition is finished.
         * @method _activate
         * @private
         */
        _activate: function ( ) { },
        /**
         * A stub which can be used to execute code before a transition begins.
         * @method _deactivate
         * @private
         */
        _deactivate: function ( ) { },
        /**
         * Push a new screen into the viewport
         * @method _push
         * @private
         * @param {String} url The URL to call to get the content for the screen
         * @param {Object||String} [data] A map or string to send along with the request 
         * @param {Object} [waitFor] A pointer to an object with a responses property
         * @param {Function} [callback] A function to call after the entry has been added to the path
         */
        _push: function ( url, data, waitFor, callback ) {
            var viewport = this,
                settings = viewport._settings,
                name = Viewport.getName().toLowerCase(),
                $el = viewport._$el,
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
            $screen = $('<div class="' + name + '-screen"></div>')
                .appendTo($el)
                .css('left', $(window).width())
                .append('<img class="' + name + '-screen-loading" src="' + settings.loadingGif + '" />')
                .animate(
                    { left: settings.screenMargin },
                    settings.duration,
                    'swing',
                    function ( ) { step(inPosition); step(loadedAndInPosition); }
                );
            $.get(url, data, function ( response ) { $screen.html(response); step(loadedAndInPosition); }, 'html');
        },
        /**
         * Pop the active screen off the viewport
         * @method _pop
         * @private
         * @param {Object} [waitFor] A pointer to an object with a responses property
         * @param {Function} [callback] A function to call after the title has been removed from the path
         */
        _pop: function ( waitFor, callback ) {
            var viewport = this,
                name = Viewport.getName().toLowerCase(),
                settings = viewport._settings,
                $el = viewport._$el,
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
    };
    // Inplement static methods of the jQueryPlugin interface and classify Path().
    classify(Viewport, 'Viewport', 'app');
    Viewport.defaults = {
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
        duration: 1000,
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
    return Viewport;
});
