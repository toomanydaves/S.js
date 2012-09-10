define([ 'jquery' ], function ( $ ) {
	// AMD: returns function for use as a parameter in define/require
	return function ( mixin, target, merge, override ) {
		var targetType = typeof target,
            properties,
            property;

        if ( targetType === 'function' ) {
            if ( mixin.staticProperties ) {
                for ( property in mixin.staticProperties ) {
                    if ( !target[property] || override ) {
                        target[property] = mixin.staticProperties[property];
                    } else if ( typeof target[property] === 'object' && merge ) {
                    	var merged = $.extend(
                    	    true, 
                    	    { },
                    	    target[property], mixin.staticProperties[property]);
                    	target[property] = merged;
                        // $.extend(true, target[property], mixin.staticProperties[property]);
                    }
                }
            }
            properties = mixin.instanceProperties ? mixin.instanceProperties : mixin;
            for ( property in properties ) {
                if ( !target.prototype[property] || override ) {
                    target.prototype[property] = properties[property];
                } else if ( typeof target.prototype[property] === 'object' && merge ) {
                    $.extend(true, target.prototype[property], properties[property]);
                }
            }
        } else if ( targetType === 'object' ) {
            properties = mixin.instanceProperties ? mixin.instanceProperties : mixin; 
            for ( property in properties ) {
                if (!target[property] || override ) {
                    target[property] = properties[property];
                } else if ( typeof target[property] === 'object' && merge ) {
                    $.extend(true, target[property], properties[property]);
                }
            }
        } else {
        	$.error('Data type of target, ' + targetType + ', cannot be used with mixin.');
        }
	};
});
