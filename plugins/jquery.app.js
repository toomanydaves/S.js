define([ 'utils/pluginFactory', 'app/App' ], function ( pluginFactory, App ) {
    return pluginFactory.newJQueryPlugin(App, true);
});