define([ 'jquery', 'views/ViewClass' ], function ( $, ViewClass ) {
    var parent = new ViewClass(),
        /**
         * a class of views for showing an index of other views.
         * @class IndexViewClass 
         * @namespace view
         * @extends views.ViewClass
         * @constructor
         */
        Index = function ( ) {
            // Use the properties of a local variable to define private variables for the instance.
            var _ = {
                // Define private properties for the instance.
                /**
                 * the jQuery set consisting of the element that is the container for the index
                 * @property $el
                 * @type {Object}
                 * @private
                 */
                $el: null,
                /**
                 * the currently selected lists
                 * @property selectedLists
                 * @type {Array}
                 * @private
                 */
                selectedLists: [ ]
                // Define private methods for the instance.
                /**
                 * Set the contents of the element for the instructions for the index
                 * @method setInstructions
                 * @private
                 * @param {Array} [instructions] an array of strings containing the text of the instructions (if not
                 * present, the value of the instructions property of the settings will be used)
                 */
                setInstructions: function ( instructions ) {
                    var index = this,
                        name = Index.getName().toLowerCase(),
                        $el = index.get_('$el'),
                        $instructions = $('.' + name + '-instructions'),
                        instructions = instructions || index.get('settings').instructions,
                        instructionsLength = instructions.length;

                    if ( !$instructions.length ) {
                        $instructions = $('<div class="' + name + '-instructions"></div>').appendTo($el);
                    }
                    // Add a line break to the end of each line except the last
                    $.each(instructions, function ( i ) {
                        if ( i < instructionsLength - 1 ) {
                            this = this + '<br />';
                        }
                    });         
                    // Make the first line bold.
                    instructions[0] = '<strong>' + instructions[0] + '</strong>'; 
                    // Add the elements to the DOM.
                    $instructions.html(instructions.join(''));
                },
                /**
                 * set the contents of the element for the lists of the index
                 * @method setLists
                 * @private
                 * @param {Array} [lists] an array of objects with id, title and description properties
                 */
                setLists: function ( lists ) {
                    var index = this,
                        name = Index.getName().toLowerCase(),
                        $el = index.get_('$el'),
                        selectedLists = index.get_('selectedLists'),
                        $numberOfSelectedLists = $('.number-of-selected-lists', $el),
                        $lists = $('.' + name + '-lists'),
                        lists = lists || index.get_('settings').lists,
                        listHtml = [
                            '<div class="' + name + '-list">',
                                '<div class="' + name '-list-actions">',
                                    '<div class="button-wrapper"></div>',
                                '</div>',
                            '</div>
                        ],
                        listActionsHtml = [
                            '<div class="' + name + '-list-print button">',
                                '<img src="/media/images/ui/button.print.png" />',
                            '</div>',
                            '<div class="' + name + '-list-export-excel button">',
                                '<img src="/media/images/ui/button.export-excel.png" />',
                            '</div>',
                            '<div class="' + name + '-list-export-pdf button">',
                                '<img src="/media/images/ui/button.export-pdf.png" />',
                            '</div>'
                        ],
                        $list,
                        list;
                    
                    if ( !$lists.length ) {
                        $lists = $('<div class="' + name + '-lists"></div>').appendTo($el);
                    }
                    $.each(lists, function ( ) {
                        $list = $(listHtml.join('')).appendTo($lists);
                        list = this;
                        $('.button-wrapper', $list).html(listActionsHtml.join(''));
                        $list.append([
                            '<div class="' + name + '-list-title">',
                                '<input type="checkbox" value="1" />',
                                '<span>' + list.title + '</span>',
                            '</div>',
                            '<div class="' + name + '-list-description">' + list.description + '</div>'
                        ].join(''));
                        $list.hover(
                            function ( ) {
                                $('.' + name + '-list-actions', $(this)).show();
                            }, 
                            function ( ) {
                                $('.' + name + '-list-actions', $(this)).hide();
                            }
                        );
                        $('input', $list).change(function ( ) {
                            var numberOfSelectedLists;

                            if ( $(this).attr('checked') ) {
                                selectedLists.push(list.id);
                            } else {
                                if ( selectedLists.indexOf(list.id) >= 0 ) {
                                    selectedLists.splice(selectedLists.indexOf(list.id), 1);
                                }
                            }
                            numberOfSelectedLists = selectedLists.length;
                            $numberOfSelectedLists.text(numberOfSelectedLists.toString());
                            if ( numberOfSelectedLists ) {
                                $('.' + name + '-add-screen', $el).show(300);
                            } else {
                                $('.' + name + '-add-screen', $el).hide(300);
                            } 
                                
                        });
                        $('.' + name + '-list-title span', $list).click(function ( ) {
                            //TODO
                            console.log('CHANGE STATE');
                        });
                    });
                },
                /**
                 * set the actions for the index
                 * @method setActions
                 * @private
                 */
                setActions: function ( ) {
                    var index = this,
                        name = Index.getName().toLowerCase(),
                        i18n = index.get_('settings').i18n,
                        $actions;

                    $actions = $([
                        '<div class="' + name + '-actions">',
                            '<div class="button-wrapper">',
                                '<div class="' + name + '-add-screen button option">',
                                    '<span>',
                                        i18n.addScreen + ' (<span class="number-of-selected-lists">0</span>)', 
                                    '</span>',
                                '</div>',
                                '<div class="' + name + '-add-list button">',
                                    '<span>' + i18n.addList + '</span>',
                                '</div>',
                            '</div>',
                        '</div>'
                    ].join('')).appendTo(index.get_('$el'));
                    $('.' + name + '-add-screen', $actions).click(function ( ) {
                        //TODO
                        alert('CHANGE STATE');
                    });
                    $('.' + name + '-add-list', $actions).click(function ( ) {
                        //TODO
                        alert('OPEN DIALOG WITH FILTERS FOR LIST');
                    });
                }
            };

            // Call the parent object's constructor with a reference to the local variable defining thte private 
            // properties to be added to the instance.
            parent.constructor.call(this, _);
            // Set the constructor property on the instance to the constructor function.
            this.constructor = Index;
            // Create privileged methods.
            /**
             * initialize and configure
             * @method init
             * @param {Object} $el a jQuery set containing the element to use as the container for the index
             * @param {Object} [options] a configuration object to override the default settings
             */
            this.init = function ( $el, options ) {
                var index = this,
                    settings; 

                // Call the method on the parent.
                parent.init.apply(this, arguments);
                // Initialize private, instance variables. 
                settings = index.get_('settings');
                index.set_('settings', $.extend(settings, App.defaults, options));
                index.set_('$el', $el.addClass('index').data('index', index));
                // Add elements to the DOM.
                index.call_('setInstructions');
                index.call_('setLists');
                index.call_('setActions');
                // Add a reference to the instance on the constructor.
                Index.addInstance(index);
            };
            /**
             * remove all traces of the instance
             * @method remove
             */
            this.remove = function ( ) {
                var $el = this.get_('$el');

                // Call the method on the parent.
                parent.remove.apply(this, arguments);
                // Remove DOM elements and events.
                if ( $el && $el.length ) {
                    $el.empty().remove();
                }
                // Delete the reference to the instance on the constructor.
                Index.removeInstance(this);
            };
        };

    // Use the parent object as the prototype for the constructor function to establish inheritance.
    Index.prototype = parent; 
    // Extend the prototype to add new public methods to instances of the class.
    // TODO
    // Extend the constructor function to add static properties and methods.
    /**
     * default config for all index instances
     * @property defaults map of property-values
     * @type {Object}
     * @static
     */
    Index.defaults = {
        //TODO
        /**
         * translations for texts
         * @attribute i18n
         * @type {Object}
         */
        i18n: {
            instructions: 'Choose from the options below.',
            addScreen: 'Open',
            customScreen: 'Custom screen',
            addList: 'Custom list'
        }
    };
    // Add standard class properties to Index
    classify(Index, 'Index', 'view');
    // AMD: return the constructor for use as a parameter when calling define/require
    return Index;
});
