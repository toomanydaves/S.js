define([ 'jquery', 'app/App' ], function ( $, App ) {
    var Path = function ( ) {
        this._settings = $.extend(true, { }, Path.defaults);
        this._initiators = [ ];
        this._$pointer = null;
        this._$el = null;
    };
    // Add instance methods to the prototype object.
    Path.prototype = {
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
        // Implement the responder interface.
        respondToNotification: function ( notification, waitFor, callback ) {
            var path = this,
                initiator = notification.initiator,
                initiators = path._initiators,
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
                            title = notification.content.title;
                            if ( typeof title !== 'string' ) {
                                throw('Path requires a string value for the title property of the notification content');
                            }
                            path._push(notification.content.title, waitFor, callback);
                            response = App.events.initiator.WAIT;
                            break;
                        case App.events.app.POP_STATE:
                            path._pop(waitFor, callback);
                            response = App.events.initiator.WAIT;
                            break;
                        case App.events.app.ACTIVATE:
                            path._activate();
                            response = App.events.initiator.PROCEED;
                            break;
                        case App.events.app.DEACTIVATE:
                            path._deactivate();
                            response = App.events.initiator.PROCEED;
                            break;
                        default:
                            throw('Path does not recognize app event');
                    }
                } 
                return requiresResponse ? response : null;
             } else {
                throw('Path does not recognize initiator');
            }
        },
        /**
         * When the path is activated, the last title becomes active and the pointer is placed underneath it.
         * All others become clickable.
         * @method _activate
         * @private
         */
        _activate: function ( ) {
            var path = this,
                name = Path.getName().toLowerCase(),
                $el = path._$el,
                $titles = $('.' + name + '-title', $el),
                $activeTitle,
                pointerOffset;
            // Make the last title active.
            $activeTitle = $titles.filter(':last')
                .unbind('click').removeClass('.' + name + '-title-inactive').attr('id', name + '-title-active');
            // Make all other titles inactive.
            $titles.not($activeTitle).addClass('.' + name + '-title-inactive').unbind('click').click(function ( ) {
                // TODO code to popState from app
                // $(this).closest('.lsview').lsview([ 'removeViewpoints', $entries.length - 1 - $entries.index(this) ]);
            });
            // If there is an active title,...
            if ( $activeTitle ) {
                // ... use its location as a basis...
                pointerOffset = $activeTitle.offset();
                pointerOffset.left += $activeTitle.width() / 2;
                pointerOffset.top = $el.offset().top + $el.height() + 1;
                // ... and position the pointer.
                path._$pointer.offset(pointerOffset);
            }
        },
        /**
         * When the path is in transition, deactive the active title and hide the pointer.
         * @method _deactivate
         * @private
         */
        _deactivate: function ( ) {
            $('#' + Path.getName().toLowerCase() + '-title-active', this._$el).removeAttr('id');
            this._$pointer.css('left', -9999); 
        },
        /**
         * Push a new title onto the path.
         * @method _push
         * @private
         * @param {String} title The title that should appear in the path
         * @param {Object} [waitFor] A pointer to an object with a responses property
         * @param {Function} [callback] A function to call after the entry has been added to the path
         */
        _push: function ( title, waitFor, callback ) {
            var path = this,
                $el = path._$el,
                name = Path.getName().toLowerCase(),
                settings = path._settings,
                $lastChild = $el.children().filter(':last'),
                titlePadding = settings.titlePadding,
                left = titlePadding,
                $divider,
                $title;
            // If there are already titles in the path...
            if ( $('.' + name + '-title', $el).length ) {
                // ... find the right-most point,...
                left = $lastChild.offset().left + $lastChild.width();
                // ... add a divider and ...
                $divider = $('<div class="' + name + '-divider">&#47;</div>')
                    .appendTo($el).css('left', left + titlePadding);
                // ... recalculate the value of the right-most point.
                left = left + $divider.width() + (2 * titlePadding);
            }
            // Add an title offscreen with a fixed width, ...
            $title = $('<div class="' + name + '-title">' + title + '</div>')
                .appendTo($el).css({ left: $(window).width(), width: $(window).width() });
            // ... animate into position...
            $title.animate(
                { left: left },
                settings.duration,
                'swing',
                function ( ) {
                    // ... and reset the width.
                    $title.css('width', 'auto');
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
                            throw('Path was not apble to parse waitFor object to run callback on push.');
                        }
                    }
                }
            );
        },
        /**
         * Pop the top title off the path.
         * @method _pop
         * @private
         * @param {Object} [waitFor] A pointer to an object with a responses property
         * @param {Function} [callback] A function to call after the title has been removed from the path
         */
        _pop: function ( waitFor, callback ) {
            var path = this,
                name = Path.getName().toLowerCase(),
                $lastTitle = $('.' + name + '-title', this._$el).filter(':last');
                
            // Delete the last divider. 
            $('.' + name + '-divider', this._$el).filter(':last').remove();
            // Set the width of the entry to prevent it from collapsing when it nears the end of the browser window
            $lastTitle.css('font-style', 'italic').width($(window).width()).animate(
                { left: $(window).width() },
                path._settings.duration,
                'swing',
                function ( ) {
                    $lastTitle.remove();
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
                            throw('Path was not able to parse waitFor object to run callback on pop.');
                        }
                    }
                }
            );
        },
        // Implement the instance methods of the jQueryPlugin interface.
        init: function ( $el, options ) {
            var path = this,
                settings = path._settings,
                name = Path.getName().toLowerCase();

            $.extend(true, settings, options);
            path._$el =  $el.addClass(name).data(name, path);
            path._$pointer = $('<img id="' + name + '-pointer" src = "' + settings.pointerPng + '" />').appendTo($el);
            Path.addInstance(path);
        },
        remove: function ( ) {
            var $el = this._$el;

            if ( $el && $el.length ) {
                $el.remove();
            }
            Path._removeInstance(this);
        }
    };
    // Inplement static methods of the jQueryPlugin interface and classify Path().
    classify(Path, 'Path', 'view.Path');
    Path.defaults = {
        respondTo: [ ],
        /**
         * When removing then adding new titles in the path, the amount to pause in between
         * @attribute delay
         * @type {Number}
         * @static
         * @default 300(ms)
         */
        delay: 300,
        /**
         * The duration for a title to animate into/out of position
         * @attribute duration
         * @type {Number}
         * @static
         * @default 700(ms)
         */
        duration: 1000,
        /**
         * The path to the image to use for the pointer underneath the path
         * @attribute pointerPng
         * @type {String}
         * @static
         * @default '/images/app/path.pointer.png'
         */
        pointerPng: '/media/images/app/path.pointer.png',
        /**
         * The padding to insert between titles
         * @attribute titlePadding
         * @type {Number}
         * @static
         * @default 8(px)
         */
        titlePadding: 8
    };
    // AMD: Return the constructor for use as a parameter when define/require is called.
    return Path;
});
