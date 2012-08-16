/**
 * The View module is responsible for the user interface of the application.
 * @module view
 */
define(
    [ 'jquery', 'utility/jquery.step', 'underscore', 'ls/view', 'ls/view/Path', 'ls/view/Viewport' ], 
    function ( $, step, _, view, Path, Viewport ) {
        /**
         * Viewer is a solution for communicating the user's current context within the application. Context in this 
         * sense refers to a set of related viewpoints. Each viewpoint has a name recognizable to the user and a unique 
         * reference to its contents.
         *
         * Viewer uses a Viewport and a Path instance for display purposes. The path shows the name and order of 
         * viewpoints in the current context; the viewport displays the contents of the viewpoints.
         * 
         * @namespace view
         * @class Viewer
         * @constructor
         * @param {Object} $el jQuery object containing the element to use as the basis for the viewer
         * @param {Object} [options] An object to use to override the default settings
         */
        view.Viewer = function ( $el, options ) {
            /**
             * The configuration for the current viewer instance
             * @property _settings
             * @type {Object}
             * @private
             */
            this._settings = $.extend({}, view.Viewer.defaults, options);
            /**
             * Active is a flag to capture whether the viewer is in a stable, active state and can accept commands, or 
             * in the process of changing, during which it must be deactivated.
             * @property _active
             * @type {Boolean}
             * @default true
             * @private
             */
            this._active = true;
            /**
             * Viewpoints is an array of all the viewpoints loaded in the viewer with the active viewpoint on top.
             * @property _viewpoints
             * @type {Array}
             * @private
             */
            this._viewpoints = [];
            /**
             * The path is a reference to the view.Path instance responsible for displaying the name of the active 
             * viewpoint and its parents.
             * @property _path
             * @type {Object}
             * @private
             */
            this._path = new Path($('<div></div>').appendTo($el), options);
            /**
             * The viewport is a reference to the LS.Viewport instance responsible for displaying the markup returned by 
             * a call to a viewpoint URL.
             * @property _viewport
             * @type {Object}
             * @private
             */
            this._viewport = new Viewport($('<div></div>').appendTo($el), options);
            /**
             * A jQuery object containing the element used as the basis for the view
             * @property _$el
             * @type {Object}
             * @private
             */
            this._$el = $el.addClass('lsviewer').data('lsviewer', this);
            view.Viewer.count++;
        };
        /**
         * The number of existing Viewer instances
         * @property count
         * @type {Number}
         * @static
         */
        view.Viewer.count = 0;
        /**
         * The default settings that will be used when a new viewer is created
         * @property
         * @type {Object}
         * @static
         */
        view.Viewer.defaults = {
            /**
             * When removing then adding new viewpoints, the amount to pause in between.
             * @attribute delay
             * @type {Number}
             * @static
             * @default 300(ms)
             */
            delay: 300,
            /**
             * The duration for a viewpoint to come into/out of position
             * @attribute duration
             * @type {Number}
             * @static
             * @default 700(ms)
             */
            duration: 700,
            /**
             * The padding to insert between entries in the path
             * @attribute pathPadding
             * @type {Number}
             * @static
             * @default 8(px)
             */
            pathPadding: 8,
            /**
             * The padding to insert around screens in the viewport
             * @attribute viewportPadding
             * @type {Number}
             * @static
             * @default 8(px)
             */
            viewportPadding: 8,
            /**
             * The path to the GIF animation to use when waiting for data to load in a screen
             * @attribute loadingGif
             * @type {String}
             * @static
             * @default '/images/ajax/loading.gif'
             */
            loadingGif: '/images/ajax/loading.gif',
            /**
             * The path to the image to use for the pointer underneath the path
             * @attribute pointerPng
             * @type {String}
             * @static
             * @default '/js/jquery/plugins/jquery.lsview.pointer.png'
             */
            pointerPng: '/js/jquery/plugins/jquery.lsview.pointer.png'
        };
        view.Viewer.prototype = {
            /**
             * Activate the path and viewport, and change viewer status to active.
             * @method _activate
             * @private
             * @param {Function} [callback] A function to call once the viewer is active
             */
            _activate: function ( callback ) {
                var viewer = this,
                    process;
            
                process = {
                    stepsRequired: 2,
                    callback: function ( ) {
                        viewer._active = true;
                        if ( callback ) {
                            callback();
                        }
                    }
                };
                this._path.activate(step(process));
                this._viewport.activate(step(process));
            },
            /**
             * Deactivate the path and viewport, and change viewer status to not active
             * @method _deactivate
             * @private
             * @param {Function} [callback] A function to call once the viewer is active
             */
            _deactivate: function ( callback ) {
                var viewer = this,
                    process;
            
                process = {
                    stepsRequired: 2,
                    callback: function ( ) {
                        viewer._active = false;
                        if ( callback ) {
                            callback();
                        }
                    }
                };
                this._path.deactivate(step(process));
                this._viewport.deactivate(step(process));
            },
            /**
             * Add an array of viewpoints to the viewer.
             * @method _addViewpoints
             * @private
             * @param {Array} viewpoints An array of objects containing a name and a URL
             * @param {Function} [callback] A function to call once the path and viewport have finished loading the 
             * viewpoints' content
             */
            addViewpoints: function ( viewpoints, callback ) {
                var viewer = this,
                    viewpoint,
                    process;

                process = {
                    stepsRequired: 2,
                    callback: function ( ) {
                        viewer._viewpoints.push(viewpoint);
                        viewer.addViewpoints(viewpoints, callback);
                    }
                };
                if ( this._active ) {
                    this._deactivate();
                }
                if ( viewpoints.length ) {
                    viewpoint = viewpoints.shift();
                    this._path.push(
                        viewpoint.name,
                        function ( ) { step(process); }
                    );            
                    this._viewport.shiftLeft(
                        viewpoint.url,
                        viewpoint.data ? viewpoint.data : {},
                        function ( ) { step(process); }
                    );
                } else {
                    this._activate();
                    if ( callback ) {
                        callback();
                    }
                }
            },
            /**
             * Remove viewpoints from the viewer.
             * @method _removeViewpoints
             * @private
             * @param {Number} numberOfViewpoints The number of viewpoints to remove from the current context
             * @param {Function} [callback] A function to call once the viewpoints have been removed and a parent 
             * viewpoint has been made active in the path and viewport
             */
            removeViewpoints: function ( numberOfViewpoints, callback ) {
                var viewer = this,
                    process;
             
                process = {
                    stepsRequired: 2,
                    callback: function ( ) {
                        viewer._viewpoints.pop();
                        viewer.removeViewpoints(numberOfViewpoints - 1, callback);
                    }
                };
                if ( this._active ) {
                    this._deactivate();
                }
                if ( numberOfViewpoints ) {
                    this._path.pop(function ( ) { step(process); });
                    this._viewport.shiftRight(function ( ) { step(process); });
                } else {
                    this._activate();
                    if ( callback ) {
                        callback();
                    }
                }
            },
            /**
             * The viewpoints passed to the method will be compared with those currently loaded until a point of 
             * diversion is found. From that point on all existing viewpoints will be removed and any new viewpoints 
             * will be added.
             * @method establishContext
             * @param {Array} viewpoints An array of objects containing a name and a url
             * @param {Function} [callback] A function to call once the path and viewport have finished loading the 
             * viewpoints' content
             */
            replaceViewpoints: function ( viewpoints, callback ) {
                var viewer = this,
                    index = 0;

                // If there are any existing viewpoints...
                if ( this._viewpoints.length ) {
                    // ... compare them with the new viewpoints...
                    for ( index; index < this._viewpoints.length; index++ ) {
                        // ... to find the point where they diverge.
                        if ( !viewpoints[index] || viewpoints[index].url !== this._viewpoints[index].url ) { break; }
                        if ( !viewpoints[index].data || $.isEmptyObject(viewpoints[index].data ) ) {
                            if ( !($.isEmptyObject(this._viewpoints[index].data)) ) { break; }
                        } else if ( typeof viewpoints[index].data === 'string' ) {
                            if ( 
                                typeof this._viewpoints[index].data !== 'string' ||
                                viewpoints[index].data !== this._viewpoints[index].data 
                            ) { break; }
                        } else if ( typeof viewpoints[index].data === 'object' ) {
                            if ( !(_.isEqual(viewpoints[index].data, this._viewpoints[index].data)) ) { break; }
                        }
                    }
                }    
                // Remove any viewpoints beyond the point of divergence,...
                this.removeViewpoints(this._viewpoints.length - index, function ( ) {
                    // ... then pause for a moment (if viewpoints were removed)...
                    setTimeout(
                        function ( ) {
                            // ... before adding any new ones.
                            viewer.addViewpoints(_.rest(viewpoints, index), callback);
                        },
                        viewer._viewpoints.length - index ? viewer._settings.delay : 0
                    ); 
                });             
            },
            /** 
             * Clean up and remove the viewer.
             * @method remove
             * @param {Function} [callback] A function to call once the viewer has been removed 
             */
             remove: function ( callback ) {
                var viewer = this,
                    process;

                process = {
                    stepsRequired: 2,
                    callback: function ( ) {
                        viewer._$el.removeClass('lsviewer').data('lsviewer', null);
                        view.Viewer.count--;
                        if ( callback ) {
                            callback();
                        }
                    }
                };
                this._path.remove(step(process));
                this._viewport.remove(step(process));
            }
        };
        return view.Viewer;
    }
);
