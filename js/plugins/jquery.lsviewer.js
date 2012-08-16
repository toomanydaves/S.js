define([ 'jquery', 'ls/view/Viewer' ], function ($, Viewer) {
    /*
     * There cannot be more than one lsviewer at a time. To initialize a new viewer, with one element selected, call 
     * lsviewer with no arguments, with the string "init", with a configuration object, or with an array where the first 
     * item is the string "init" and, optionally, the following item is a configuration object.
     *
     * For example,
     *     $('body').lsviewer();
     * or
     *     $('body').lsviewer('init');
     * or
     *     $('body').lsviewer({ duration: 800, delay: 300 });
     * or
     *     $('body').lsviewer([ 'init', { duration: 800, delay: 400 } ]);
     *
     * To call a method on an existing lsviewer, with the element selected, call lsviewer and pass the method's name as 
     * a string or an array where the first element is the method's name and subsequent elements are arguments for the
     * method.
     *
     * For example,
     *     $('.lsviewer').lsviewer([ 'addViewpoints', [ { name: 'Courses', url: '/course/index.php' } ] ]);
     * or
     *     $('.lsviewer').lsviewer([ 'removeViewpoints', 2, function ( ) { console.log('Viewpoints removed!'); } ]);
     * @plugin lsview
     * @for LS.view.Viewer
     */
    $.fn.lsviewer = function ( args ) {
        // Submit the request for validation before calling the api methods.
        var request = $.fn.lsviewer.getRequest(this, args);
        // Return the jQuery object to allow method chaining.
        return this.each(function ( index ) {
                // If there are no errors at this index...
                if ( !request.errors[index] ) {
                    // ... and the plugin has yet to be instantiated on the element,...
                    if ( request.method === 'init' ) {
                        // ... create a new plugin instance and bind it to the data object of the element.
                        $(this).data('lsviewer', new Viewer($(this), request.args));
                    }
                    // When there is already a plugin instance, retrieve it from the data object and call a method.
                    else {
                        Viewer.prototype[request.method].call($(this).data('lsviewer', request.args));
                    }
                }
                // If there are errors, output them.
                else {
                    $.error(request.errors[index]);
                }
            });
    };
    $.fn.lsviewer.getRequest = function ( $targets, args ) {
        var request = { method: '', args: null, errors: []};
        // Retrieve the requested method and passed arguments.
        if ( !args ) {
            request.method = 'init';
        } else 
        if ( typeof args === 'string' ) {
            request.method = args;
        } else
        if ( typeof args === 'object' ) {
            if ( Object.prototype.toString.call(args) === '[object Array]' ) {
                request.method = args.shift();
                if ( request.method === 'init' ) {
                    request.args = args.shift();
                } else {
                    request.args = args;
                }
            } else {
                request.method = 'init';
                request.args   = args;
            }
        }
        // Determine if there are any errors for each target element. 
        $targets.each(function ( ) {
            var errors = [];
            
            if ( $targets.length > 1 ) {
                errors.push('lsviewer must be called on a jQuery object containing one HTML element.');
            }
            if ( request.method === 'init' ) {
                if ( $(this).data('lsviewer') ) {
                    errors.push('lsviewer init cannot be called on an already initialized lsviewer.');
                } else
                if ( Viewer.count ) {
                    errors.push('The existing lsviewer must be removed before initializing another.');
                }
            } else {
                if ( !Viewer.prototype[request.method] ) {
                    errors.push('lsviewer cannot match the request to a known method.');
                } 
                if ( !$(this).data('lsviewer') ) {
                    errors.push('lsviewer methods, aside from init, must be called on an initialized lsviewer.'); 
                }
            }
            if ( errors.length ) {
                 request.errors.push(errors.join(' '));
            } else {
                 request.errors.push(null);
            }
        });
        return request; 
    };
});
