require([ 'utilities/jquery.makePlugin', 'ls/component/List'], function ( makePlugin, List ) {
    /*
     * @plugin lslist
     * @baseClass ls.component.List
     */
    return makePlugin(List, 'ls');
});
