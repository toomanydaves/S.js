define([ 'utils/Class' ], function ( Class ) {
    var 
    /** 
        Used to wrap and extend the functionality of the global window object
        @class WindowClass 
        @namespace app
        @extends utils.Class
        @constructor 
    */
    WindowClass = function ( ) {
        var 
        _ = {
            /**
                @property window saves a reference to the browser's global window object
                @type {Object}
                @private
            */
            'window': window
        };

        // app.window requires the browser.
        if ( !_.window ) {
            throw('Cannot init app.window because app is not running in a browser');
        }
        WindowClass.prototype.constructor.call(this, _);
        this.constructor = WindowClass;
    };

    WindowClass.prototype = new Class();
	// AMD: return a singleton to pass as a parameter in calls to require/define.
	return new WindowClass();
});
