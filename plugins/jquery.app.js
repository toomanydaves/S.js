define([ 'utils/pluginFactory', 'app/AppClass' ], function ( pluginFactory, AppClass ) {
    return pluginFactory.newJQueryPlugin(AppClass, true);
});
