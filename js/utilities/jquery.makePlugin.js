define(
    [ 'jquery', 'utility/jquery.getRequestFromArgs', 'utility/jquery.getErrorsOnRequest' ],
    function ( $, getRequestFromArgs, getErrorsOnRequest ) {
    return $.makePlugin = function ( BaseClass, prefix ) {
        var className = BaseClass.getName(),
            pluginName;
       
        if ( !className ) {
            $.error('In order to be the basis for a plugin, a class must respond to getName().');
            return;
        }
        pluginName = (prefix ? prefix : '') + className.toLowerCase(); 
        if ( $.fn[pluginName] ) {
            $.error(pluginName + ' already exists.');
            return;
        } 
        $.fn[pluginName] = function ( ) {
            var args = $.makeArray(arguments),
                request = getRequestFromArgs(args);

            return this.each(function ( ) {
                var $this = $(this),
                    errors = getErrorsOnRequest($this, request.method, pluginName),
                    plugin;
        
                if ( errors ) {
                    $.error(errors);
                } else {
                    if ( request.method === 'init' ) {
                        new BaseClass($this);
                    }
                    plugin = $(this).data(pluginName);
                    plugin[request.method].apply(plugin, request.args);
                }
            });
        };
        $.fn[pluginName].baseClass = BaseClass;
        return $.fn[pluginName];
    };
});
