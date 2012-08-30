define([ 'jquery' ], function ( $ ) {
    return $.getRequestFromArgs = function ( args ) {
        var request = { method: '', args: null };

        // No arguments means init.
        if ( !args.length ) {
            request.method = "init";
        } else
        // A string as the first argument means a call to a method (can be init).
        if ( typeof args[0] === 'string' ) {
            request.method = args.shift();
            request.args   = args;
        // An object as the first argument means a config object and init.
        } else if ( typeof args[0] === 'object' ) {
            request.method = "init";
            request.args   = args;
        } 
        return request;
    };
});
