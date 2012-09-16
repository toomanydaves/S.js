define([ 'utils/pluginFactory', 'app/Path' ], function ( pluginFactory, Path ) {
    return pluginFactory.newJQueryPlugin(Path, true);
});
