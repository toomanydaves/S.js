define([ 'jquery', 'ls/ui/Navbar' ], function ( $, Navbar ) {
    /*
     * @plugin lsnavbar
     * @wrap ls.ui.Navbar
     */
    $.fn.lsnavbar = function ( args ) {
        var request = $.fn.lsnavbar.getRequest(this, args);

        return this.each(function ( index ) {
            var $this = $(this),
                navbar;

            if ( !request.errors[index] ) {
                if ( request.method === 'init' ) {
                    $this.data('lsnavbar', new Navbar($this, request.args)).addClass('lsnavbar');
                }
                else {
                    navbar = $this.data('lsnavbar');
                    navbar[request.method].apply(navbar, request.args);
                }
            }
            else {
                $.error(request.errors[index]);
            }
        });
    };
    $.fn.lsnavbar.getRequest = function ( $targets, args ) {
        var request = { method: '', args: null, errors: [ ] };
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
            var errors = [ ],
                navbar = $(this).data('lsnavbar');
            
            if ( request.method === 'init' ) {
                if ( lsnavbar ) {
                    errors.push('lsnavbar init() cannot be called on an already initialized lsnavbar.');
                }
            } else {
                if ( !navbar[request.method] ) {
                    errors.push('lsnavbar cannot match the request to a known method.');
                } 
                if ( request.method.charAt(0) === '_' ) {
                    errors.push('lsnavbar is not allowed to call a private method of ls.ui.Navbar');
                }
                if ( !lsdropdown ) {
                    errors.push('lsnavbar methods, aside from init, must be called on an initialized lsnavbar.'); 
                }
            }
            errors.length ? request.errors.push(errors.join(' ')) : request.errors.push(null);
        });
        return request; 
    };
});
