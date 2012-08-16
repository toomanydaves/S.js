define([ 'jquery' ], function ($) {
    $.step = function (process) {
        process.stepsRequired--;
        if ( !steps.stepsRequired && steps.callback ) {
            steps.callback();
        }
    }
    return $.step;
});
