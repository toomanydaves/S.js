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
            Used to manage the state of the application running on the client.
            @class AppClass 
            @namespace app
            @module app
            @extends utils.Class
            @constructor
         */
        App = function ( ) {
            // Create an object to define private properties for class instances.
            var 
            _ = {
                /**
                    The container for the app
                    @property jQuery $el 
                    @private
                 */
                $el: null,
                /**
                    The current and all related states
                    @property {Array} loadedStates 
                    @private
                 */
                loadedStates: [ ],
                /**
                    Interface to the browser's history
                    @property app.History history 
                    @private
                 */
                history: null,
                /**
                    The settings for the app
                    @property {Object} settings 
                    @private
                 */
                settings: { },
                /**
                    Adds states to the app
                    @method pushStates 
                    @private
                    @param {Array} states A collection of objects with url, title and data properties
                */
                pushStates: function ( states, callback ) {
                    var app = this,
                        state;

                    if ( states.length ) {
                        state = states.shift();
                        app.call_('pushState', state, function ( ) {
                            app.call_('pushStates', states, callback);
                        });                         
                    } else if ( typeof callback === 'function' ) {
                        callback();
                    }
                },
                /**
                    Removes states from the app
                    @method popStates 
                    @private
                    @param {Number} howMany The number of states to pop off the stack
                    @param {Function} [callback] The function to call when the operation is completed
                */
                popStates: function ( howMany, callback ) {
                    var app = this;

                    if ( howMany ) {
                        howMany--;
                        app.call_('popState', function ( ) {
                            app.call_('popStates', howMany, callback);
                        });
                    } else if ( typeof callback === 'function' ) {
                        callback();
                    }
                },
                /**
                    Push a new current state on to the loaded states 
                    @method pushState 
                    @private
                    @param {Object} state An object with data, url and title properties
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
                            app.get_('loadedStates').push(state);
                            if ( typeof callback === 'function' ) {
                                callback();
                            }
                        });
                    }
                },
                /**
                    Pops the current state from the loaded states
                    @method popState 
                    @private
                    @param {Function} [callback] The function to run when the operation is finished
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
                            app.get_('loadedStates').pop();
                            //TODO selective modify browser state
                            app.get_('history').pushState(state);
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
                Initialize and configure the app
                @method init 
                @param {Object} $el A jQuery set containing the element to use as the container for the app • unless there is a good reason not to, the body element should be used
                @param {Object} [options] A configuration object to override the default settings
             */
            this.init = function ( $el, options ) {
                var app = this,
                    settings; 

                // Call the method on the parent.
                App.prototype.constructor.prototype.init.apply(this, arguments);
                // Initialize private, instance variables. 
                settings = app._get('settings');
                app.set_('settings', $.extend(settings, App.defaults, options));
                app.set_('history', new History(settings.historyApi, settings.onpopstate));
                app.set_('$el', $el.addClass('app').data('app', app).click(function ( e ) {
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
                }));
                // Add a reference to the instance on the constructor.
                App.addInstance(app);
            };
            /**
                Remove all traces of the app
                @method remove
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
            The states passed to the method will be compared with those currently loaded until a point of  diversion is found. From that point on all existing states will be removed and any new states will be added.
            @method replaceStates
            @param {Array} states An array of objects containing title, data and url properties
            @param {Function} [callback] A function to call once the operation is finished
         */
        App.prototype.replaceStates = function ( states, callback ) {
            var app = this,
                name = App.getName(),
                loadedStates = app.get_('loadedStates'),
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
                app.call_('popStates', loadedStates.length - index, function ( ) {
                    // ... then pause for a moment (if states were removed)...
                    setTimeout(
                        function ( ) {
                            // ... before adding any new ones.
                            app.pushStates(_.rest(states, index), function ( ) {
                                app.get_('history').pushState(state);
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
            Add a collection of states to the app
            @method pushStates
            @param {Array} states A collection of objects with data, title and url properties
         */
        App.prototype.pushStates = function ( states, callback ) {
            var app = this,
                state = _.last(states);

            app.call_('pushStates', states, function ( ) {
                app.get_('history').pushState(state);
                if ( typeof callback === 'function' ) {
                    callback();
                }
            });
        };
        App.prototype.popStates = function ( howMany, callback ) {
            var app = this,
                loadedStates = app.get_('loadedStates'),
                state = loadedStates[loadedStates.length - howMany - 1];

            app.call_('popStates', howMany, function ( ) {
                app.get_('history').pushState(state);
                if ( typeof callback === 'function' ) {
                    callback();
                }
            });
        };
        App.prototype.getCurrentState = function ( ) {
            var loadedStates = this.get_('loadedStates'),
                numberOfLoadedStates = loadedStates.length,
                currentState;
            
            if ( numberOfLoadedStates ) {
                currentState = loadedStates[numberOfLoadedStates - 1];
            }
            return currentState;
        };
        // Extend the constructor function to add static properties and methods.
        /**
            Default config for all app instances
            @property defaults Map of property-values
            @type {Object}
            @static
         */
        App.defaults = {
            /**
                A space-delimited list of the types of History APIs to support • currently only HTML5 supported
                @attribute {String} historyApi
                @default 'HTML5'
            */
            historyApi: 'HTML5',
            /**
                The function to run when window.onpopstate is triggered
                @attribute {Function} onpopstate
                @default function ( e ) { console.log('onpopstate', e); }
             */
            onpopstate: function ( e ) { }
        };
        /**
            A namespaced map of constants used to identify types of events
            @property {Object} events A map of class names to objects containing constant names and values used to identify types of events
            @property events
            @type {Object}
            @static
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
