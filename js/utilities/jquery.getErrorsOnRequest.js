define([ 'jquery' ], function ( $ ) {
    return $.getErrorsOnRequest = function ( $target, method, pluginName ) {
        var errors = [ ],
            plugin = $target.data(pluginName);

        if ( !method ) {
            errors.push(pluginName + ' could not determine the requested method.');
        } else {
            if ( method === 'init' ) {
                if ( plugin ) {
                    errors.push(pluginName + ' init() cannot be called on an existing ' + pluginName + '.');
                }
            } else {
                if ( method.charAt(0) === '_' ) {
                    errors.push(pluginName + ' cannot call a private method of ' + $.fn[pluginName].baseClass.getName());
                }
                if ( !plugin ) {
                    errors.push(
                        pluginName + ' methods, aside from init(), must be called on an initialized ' + pluginName + '.'
                    ); 
                } else {
                    if ( !(plugin[method] && typeof plugin[method] === 'function') ) {
                        errors.push(pluginName + ' cannot match the request to a known method.');
                    }
                }
            }
        }
        return errors.length ? errors.join(' ') : null;
    };
});
