define (
    [ 
        'jquery', 
        'libs/underscore',
        'app/History',
        'utils/Class',
        'utils/classify', 
        'utils/mixin',
        'mixins/initiator',
        'utils/checkImplementation',
        'interfaces/state'
    ], 
    function ( $, _, History, Class, classify, mixin, initiator, checkImplementation, stateInterface ) {
        var 
        /** 
            @class App used to manage the state of the application running on the client.
            @namespace app
            @constructor
         */
        App = function ( ) {
            // Create an object to define private properties for class instances.
            var 
            _ = {
                /**
                    @property jQuery $el the container for the app
                    @private
                 */
                $el: null,
                /**
                    @property {Array} loadedStates the current and all related states
                    @private
                 */
                loadedStates: [ ],
                /**
                    @property app.History history interface to the browser's history
                    @private
                 */
                history: null,
                /**
                    @property {Object} settings the settings for the app
                    @private
                 */
                settings: { },
                /**
                    @method pushStates adds states to the app
                    @private
                    @param {Array} states a collection of objects with url, title and data properties
                */
                pushStates: function ( states, callback ) {
                    var app = this,
                        state;

                    if ( states.length ) {
                        state = states.shift();
                        app._call('pushState', state, function ( ) {
                            app._call('pushStates', states, callback);
                        });                         
                    } else if ( typeof callback === 'function' ) {
                        callback();
                    }
                },
                /**
                    @method popStates removes states from the app
                    @private
                    @param {Number} howMany the number of states to pop off the stack
                    @param {Function} [callback] the function to call when the operation is completed
                */
                popStates: function ( howMany, callback ) {
                    var app = this;

                    if ( howMany ) {
                        howMany--;
                        app._call('popState', function ( ) {
                            app._call('popStates', howMany, callback);
                        });
                    } else if ( typeof callback === 'function' ) {
                        callback();
                    }
                },
                /**
                    @method _pushState push a new current state on to the loaded states 
                    @private
                    @param {Object} state an object with data, url and title properties
                 */
                pushState: function ( state, callback ) {
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
                        app.notifyResponders(notification, function ( ) {
                            app._get('loadedStates').push(state);
                            if ( typeof callback === 'function' ) {
                                callback();
                            }
                        });
                    }
                },
                /**
                    @method _popState pops the current state from the loaded states
                    @private
                    @param {Function} [callback] the function to run when the operation is finished
                 */
                popState: function ( callback ) {
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
                        app.notifyResponders(notification, function ( ) {
                            app._get('loadedStates').pop();
                            //TODO selective modify browser state
                            app._get('history').pushState(state);
                            if ( typeof callback === 'function' ) {
                                callback();
                            }
                        });
                    }
                }
            };
            // Call the parent constructor before modifying the instance...
            App.prototype.constructor.call(this, _);
            this.constructor = App;
            /**
                @method init initialize and configure the app
                @privileged
                @param {Object} $el a jQuery set containing the element to use as the container for the app • unless 
                there is a good reason not to, the body element should be used
                @param {Object} [options] a configuration object to override the default settings
             */
            this.init = function ( $el, options ) {
                var app = this,
                    settings; 

                // Call the method on the parent.
                App.prototype.constructor.prototype.init.apply(this, arguments);
                // Initialize private, instance variables. 
                settings = app._get('settings');
                app._set('settings', $.extend(settings, App.defaults, options));
                app._set('history', new History(settings.historyApi, settings.onpopstate));
                app._$el = $el.addClass('app').data('app', app).click(function ( e ) {
                    var $link = $(e.target).is('a') ? $(e.target) : $(e.target).closest('a'),
                        state = {
                            url: $link.attr('href'),
                            title: $link.attr('title'),
                            data: $link.data('state')
                        };;
                        
                    if ( $link.length !== 1 || !state.url ) {
                        return;
                    } else {
                    	if ( !state.title ) {
                    		state.title = $link.text().trim();
                    	}
                        if ( !state.title ) {
                            $link.find('span').each(function ( ) {
                                state.title = state.title + $(this).text();
                            });
                        }
                        if ( !state.title ) {
                            state.title = $link.find('img').attr('alt');
                        }
                        if ( state.title ) {
                            if ( $link.hasClass('push-state') ) {
                            	app.pushStates([ state ]);
                            } else {
                            	app.replaceStates([ state ]);
                            }
                            return false;
                        } else {
                            return;
                        }
                    }
                });
                // Add a reference to the instance on the constructor.
                App.addInstance(app);
            };
            /**
             * remove all traces of the app
             * @method remove
             * @privileged
             */
            this.remove = function ( ) {
                var $el = this._get('$el');

                // Call the method on the parent.
                App.prototype.constructor.prototype.remove.apply(this, arguments);
                // Remove DOM elements and events.
                if ( $el && $el.length ) {
                    $el.empty().remove();
                }
                // Delete the reference to the instance on the constructor.
                App.removeInstance(this);
            };
        };
        // Use the parent object as the prototype for the constructor function to establish inheritance.
        App.prototype = new Class(); 
        // Extend the prototype to add new public methods to instances of the class.
        /**
         * The states passed to the method will be compared with those currently loaded until a point of 
         * diversion is found. From that point on all existing states will be removed and any new states 
         * will be added.
         * @method replaceStates
         * @param {Array} states An array of objects containing title, data and url properties
         * @param {Function} [callback] A function to call once the operation is finished
         */
        App.prototype.replaceStates = function ( states, callback ) {
            var app = this,
                name = App.getName(),
                loadedStates = app._get('loadedStates'),
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

            app.notifyResponders(deactivation, function ( ) {
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
                app._call('popStates', loadedStates.length - index, function ( ) {
                    // ... then pause for a moment (if states were removed)...
                    setTimeout(
                        function ( ) {
                            // ... before adding any new ones.
                            app.pushStates(_.rest(states, index), function ( ) {
                                app._get('history').pushState(state);
                                app.notifyResponders(activation, function ( ) {
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
        };
        /**
         * add a collection of states to the app
         * @method pushStates
         * @param {Array} states A collection of objects with data, title and url properties
         */
        App.prototype.pushStates = function ( states, callback ) {
            var app = this,
                state = _.last(states);

            app._call('pushStates', states, function ( ) {
                app._get('history').pushState(state);
                if ( typeof callback === 'function' ) {
                    callback();
                }
            });
        };
        App.prototype.popStates = function ( howMany, callback ) {
            var app = this,
                loadedStates = app._get('loadedStates'),
                state = loadedStates[loadedStates.length - howMany - 1];

            app._call('popStates', howMany, function ( ) {
                app._get('history').pushState(state);
                if ( typeof callback === 'function' ) {
                    callback();
                }
            });
        };
        App.prototype.getCurrentState = function ( ) {
            var loadedStates = this._get('loadedStates'),
                numberOfLoadedStates = loadedStates.length,
                currentState;
            
            if ( numberOfLoadedStates ) {
                currentState = loadedStates[numberOfLoadedStates - 1];
            }
            return currentState;
        };
        // Extend the constructor function to add static properties and methods.
        /**
         * default config for all app instances
         * @property defaults map of property-values
         * @type {Object}
         * @static
         */
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
             * @default function ( e ) { }
             */
            onpopstate: function ( e ) { }
        };
        /**
         * a namespaced map of constants used to identify types of events
         * @property {Object} events
         * a map of class names to objects containing constant names and values used to identify types of events
         * @property events
         * @type {Object}
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
        classify(App, 'App', 'app');
        // Merge initiator mixin with App().
        mixin(initiator, App, true);
        // AMD: return the constructor for use as a parameter when calling define/require
        return App;
    }
);
