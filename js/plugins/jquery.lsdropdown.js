define([ 'jquery', 'ls/ui/Dropdown' ], function ( $, Dropdown ) {
    /*
     * @plugin lsdropdown
     * @wrap LS.ui.Dropdown
     */
    $.fn.lsdropdown = function ( args ) {
        var request = $.fn.lsdropdown.getRequest(this, args);
        return this.each(function ( index ) {
            var $this = $(this),
                plugin;
            // If the request is valid for this element...
            if ( !request.errors[index] ) {
                // ... and the plugin has yet to be instantiated on the element,...
                if ( request.method === 'init' ) {
                    // ... create a new plugin instance and bind it to the data object of the element.
                    new Dropdown($this, request.args);
                }
                // When there is already a plugin instance, retrieve it from the data object and call a method.
                else {
                    Dropdown.prototype[request.method].call($this.data('lsdropdown'), request.args);
                }
            }
            // Otherwise, output any errors
            else {
                $.error(request.errors[index]);
            }
        });
    };
    $.fn.lsdropdown.getRequest = function ( $targets, args ) {
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
            
            if ( request.method === 'init' ) {
                if ( $(this).data('lsdropdown') ) {
                    errors.push('lsdropdown init() cannot be called on an already initialized lsdropdown.');
                }
            } else {
                if ( !Dropdown.prototype[request.method] ) {
                    errors.push('lsdropdown cannot match the request to a known method.');
                } 
                if ( request.method.charAt(0) === '_' ) {
                    errors.push('lsdropdown is not allowed to call a private method of ls.ui.Dropdown');
                }
                if ( !$(this).data('lsdropdown') ) {
                    errors.push('lsdropdown methods, aside from init, must be called on an initialized lsdropdown.'); 
                }
            }
            errors.length ? request.errors.push(errors.join(' ')) : request.errors.push(null);
        });
        return request; 
    };
});
