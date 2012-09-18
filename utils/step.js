define([ ], function ( ) {
    return function (process) {
        process.stepsRequired--;
        if ( !process.stepsRequired && typeof process.callback === 'function' ) {
            process.callback();
        }
    };
});
