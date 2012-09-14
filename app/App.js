define (
    [ 
        'jquery', 
        'libs/underscore',
        'app/History',
        'utilities/classify', 
        'utilities/mixin',
        'mixins/initiator',
        'utilities/checkImplementation',
        'interfaces/state'
    ], 
    function ( $, _, History, classify, mixin, initiator, checkImplementation, stateInterface ) {
        /**
         * A solution for managing the state of the application running on the client.
         * @class App
         * @namespace app
         * @constructor
         */
        App = function ( ) {
            /**
             * the element that is the container for the app
             * @property jQuery _$el
             * @private
             */
            this._$el = null;
            /**
             * the current and all related states
             * @property {Array} _loadedStates
             * @private
             */
            this._loadedStates = [ ];
            /**
             * interface to the browser's history
             * @property app.History _history
             * @private
             */
            this._history = null;
            /**
             * the settings for the app
             * @property {Object} _settings
             * @private
             */
            this._settings = $.extend({ }, App.defaults);
        };
        // Add instance methods on the prototype.
        App.prototype = {
            /**
             * initialize and configure the app
             * @method init
             * @param {Object} $el a jQuery set containing the element to use as the container for the app • unless 
             * there is a good reason not to, the body of the page should be used
             * @param {String} name the name to use to identify the app
             * @param {Object} [options] a configuration object to override the default settings
             */
            init: function ( $el, options ) {
                var app = this,
                    settings = app._settings;

                $.extend(settings, options);
                // Pass a function as the second parameter to the function, which will be called on the window's
                // onpopstate event to update the state of the app.
                app._history = new History(settings.historyApi, settings.onpopstate);
                app._$el = $el.addClass('app').data('app', app);
                App.addInstance(app);
            },
            /**
             * cleanly remove all traces of the app
             * @method remove
             */
            remove: function ( ) {
                if ( this._$el && this._$el.length ) {
                    this._$el.empty().remove();
                }
                App._removeInstance(this);
            },
            /**
             * The states passed to the method will be compared with those currently loaded until a point of 
             * diversion is found. From that point on all existing states will be removed and any new states 
             * will be added.
             * @method replaceStates
             * @param {Array} states An array of objects containing title, data and url properties
             * @param {Function} [callback] A function to call once the operation is finished
             */
            replaceStates: function ( states, callback ) {
                var app = this,
                    name = App.getName(),
                    loadedStates = app._loadedStates,
                    state = _.last(states),
                    deactivation = { 
                        initiator: name, 
                        type: App.events.app.DEACTIVATE,
                        content: null
                    },
                    activation = {
                        initiator: name,
                        type: App.events.app.ACTIVATE
                    },
                    index = 0;

                app._notifyResponders(deactivation, function ( ) {
                    // If there are any loaded states...
                    if ( loadedStates.length ) {
                        // ... compare them with the new states...
                        for ( index; index < loadedStates.length; index++ ) {
                            // ... to find the point where they diverge.
                            if ( !states[index] || states[index].url !== loadedStates[index].url ) { break; }
                            if ( !states[index].data || $.isEmptyObject(states[index].data ) ) {
                                if ( !($.isEmptyObject(loadedStates[index].data)) ) { break; }
                            } else if ( typeof states[index].data === 'string' ) {
                                if ( 
                                    typeof loadedStates[index].data !== 'string' ||
                                    states[index].data !== loadedStates[index].data 
                                ) { break; }
                            } else if ( typeof states[index].data === 'object' ) {
                                if ( !(_.isEqual(states[index].data, loadedStates[index].data)) ) { break; }
                            }
                        }
                    }    
                    // Remove any loadedStates beyond the point of divergence,...
                    app._popStates(loadedStates.length - index, function ( ) {
                        // ... then pause for a moment (if states were removed)...
                        setTimeout(
                            function ( ) {
                                // ... before adding any new ones.
                                app.pushStates(_.rest(states, index), function ( ) {
                                    app._history.pushState(state);
                                    app._notifyResponders(activation, function ( ) {
                                        if ( typeof callback === 'function' ) {
                                            callback();
                                        }
                                    });
                                });
                            },
                            loadedStates.length - index ? app._settings.delay : 0
                        ); 
                    });             
                });
            },
            /**
             * add a collection of states to the app
             * @method pushStates
             * @param {Array} states A collection of objects with data, title and url properties
             */
            pushStates: function ( states, callback ) {
                var app = this,
                    state = _.last(states);

                app._pushStates(states, function ( ) {
                    app._history.pushState(state);
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                });
            },
            popStates: function ( howMany, callback ) {
                var app = this,
                    loadedStates = app._loadedStates,
                    state = loadedStates[loadedStates.length - howMany - 1];

                app._popStates(howMany, function ( ) {
                    app._history.pushState(state);
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                });
            },
            getCurrentState: function ( ) {
                var loadedStates = this._loadedStates,
                    numberOfLoadedStates = loadedStates.length,
                    currentState;
                
                if ( numberOfLoadedStates ) {
                    currentState = loadedStates[numberOfLoadedStates - 1];
                }
                return currentState;
            },
            _pushStates: function ( states, callback ) {
                var app = this,
                    state;

                if ( states.length ) {
                    state = states.shift();
                    app._pushState(state, function ( ) {
                        app._pushStates(states, callback);
                    });                         
                } else if ( typeof callback === 'function' ) {
                    callback();
                }
            },
            _popStates: function ( howMany, callback ) {
                var app = this;

                if ( howMany ) {
                    howMany--;
                    app._popState(function ( ) {
                        app._popStates(howMany, callback);
                    });
                } else if ( typeof callback === 'function' ) {
                    callback();
                }
            },
            /**
             * push a new current state on to the loaded states 
             * @method _pushState
             * @private
             * @param {Object} state an object with data, url and title properties
             */
            _pushState: function ( state, callback ) {
                var problemsWithState = checkImplementation(state, stateInterface),
                    app = this,
                    notification;

                if ( problemsWithState ) {
                    throw problemsWithState;
                } else {
                    notification = { 
                        initiator: App.getName(), 
                        type: App.events.app.PUSH_STATE, 
                        content: $.extend(true, { }, state)
                    };
                    app._notifyResponders(notification, function ( ) {
                        app._loadedStates.push(state);
                        if ( typeof callback === 'function' ) {
                            callback();
                        }
                    });
                }
            },
            /**
             * pop the current state from the loaded states
             * @method _popState
             */
            _popState: function ( callback ) {
                var app = this,
                    state = app.getCurrentState(),
                    notification = { 
                        initiator: App.getName(), 
                        type: App.events.app.POP_STATE,
                        content: state
                    };

                if ( !state ) {
                    throw 'Cannot popState() when none are loaded.';
                } else {
                    app._notifyResponders(notification, function ( ) {
                        app._loadedStates.pop();
                        //TODO selective modify browser state
                        app._history.pushState(state);
                        if ( typeof callback === 'function' ) {
                            callback();
                        }
                    });
                }
            }
        };
        App.defaults = {
            /**
             * a space-delimited list of the types of History APIs to support • currently only HTML5 supported
             * @attribute {String} historyApi
             * @default 'HTML5'
             */
            historyApi: 'HTML5',
            /**
             * the function to run when window.onpopstate is triggered
             * @attribute {Function} onpopstate
             * @default function ( e ) { console.log('onpopstate', e); }
             */
            onpopstate: function ( e ) {
                console.log('onpopstate', e);
            }
        };
        /**
         * a namespaced map of constants used to identify types of events
         * @property {Object} events
         * @static
         */
        App.events = {
            app: {
                PUSH_STATE: 1,
                POP_STATE: 2,
                ACTIVATE: 3,
                DEACTIVATE: 4
            }
        };
        // Add standard class properties to App().
        classify(App, 'App', 'sjs.app');
        // Merge initiator mixin with App().
        mixin(initiator, App, true);
        return App;
    }
);
