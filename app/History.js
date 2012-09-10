define([ 'utilities/classify' ], function ( classify ) {
	History = function ( supportedApis, popStateHandler ) {
		this.supportedApis = supportedApis.split(' ');
		if ( this.supportedApis.indexOf('HTML5') >= 0 ) {
			window.onpopstate = function ( e ) {
				if ( typeof popStateHandler === 'function' ) {
                    popStateHandler(e);
                }
			};
		}
	};
	classify(History, 'History', 'sjs.app');
	History.prototype = {
		pushState: function ( state ) {
			if ( this.supportedApis.indexOf('HTML5') >= 0 ) {
				window.history.pushState(state);
			}
		}
	};
	// AMD: return constructor function to use as parameter when calling define/require
	return History;
});
