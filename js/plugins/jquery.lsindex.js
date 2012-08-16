define([ 'jquery', 'ls/screen/Index' ], function ( $, Index ) {
    var methods;

    // Extend the jQuery prototype with the plugin.
    $.fn.lsindex = function ( config ) {
        var defaults,
            settings;

        defaults = {
            instructions: [
                'Choose from the options below.'
            ],
            addScreen: 'Open',
            customScreen: 'Custom screen',
            addList: 'Custom list'
        };
        settings = $.extend({}, defaults, config);
        this.each(function ( ) {
            var $lsindex = $(this),
                selectedLists = [],
                $lists,
                $list,
                $instructions,
                instructions,
                listActionButtons,
                $openScreenButton,
                $customListButton,
                i;
            // Don't reinitialize.
            if ( $lsindex.hasClass('lsindex') ) {
                return $.error($lsindex + ' is already an lsindex');
            }
            // Add instructions.
            $instructions = $('<div class="lsindex-instructions"></div>').appendTo($lsindex);
            for ( i = 0; i < settings.instructions.length; i++ ) {
                // Make first line bold.
                if ( !i ) {
                    instructions = '<strong>' + settings.instructions[i] + '</strong>';
                } else {
                    instructions += settings.instructions[i];
                }
                // Add a line break if there's more coming.
                if ( i < settings.instructions.length - 1 ) {
                    instructions += '<br />';
                }
            }
            $instructions.html(instructions);
            // Create lists.
            for ( i = 0; i < settings.lists.length; i++ ) {
                $list = $(
                    '<div class="lsindex-list">' +
                        '<div class="lsindex-list-actions">' +
                            '<div class="button-wrapper"></div>' +
                        '</div>' +
                    '</div>'
                ).appendTo($lsindex).data('id', settings.lists[i].id);                
                listActionButtons = 
                    '<div class="lsindex-list-print button"><img src="/images/button/print.png" /></div>' +
                    '<div class="lsindex-list-export-excel button"><img src="/images/button/export-excel.png" /></div>' +
                    '<div class="lsindex-list-export-pdf button"><img src="/images/button/export-pdf.png" /></div>';
                $('.button-wrapper', $list).html(listActionButtons); 
                $list.append(
                    '<div class="lsindex-list-title">' +
                        '<input type="checkbox" value="1" />' +
                        '<span>' + settings.lists[i].title + '</span>' +
                    '</div>' +
                    '<div class="lsindex-list-description">' +
                        settings.lists[i].description +
                    '<div>'
                );
            }
            // Create index actions.
            $lsindex.append(
                '<div class="lsindex-actions">' +
                    '<div class="button-wrapper">' +
                        '<div class="lsindex-add-screen button option">' +
                            '<span>' + 
                                settings.addScreen + ' (<span class="number-of-selected-lists">0</span>)' + 
                            '</span>' +
                        '</div>' +
                        '<div class="lsindex-add-list button">' +
                            '<span>' + settings.addList + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
            // Add interaction.
            $lists = $('.lsindex-list', $lsindex);
            $addScreenButton = $('.lsindex-add-screen', $lsindex);
            $addListButton = $('.lsindex-add-list', $lsindex);
            $lists.hover(
                function ( ) {
                    // Show list actions on mouse over list,...
                    $('.lsindex-list-actions', $(this)).show();
                }, function ( ) {
                    //  ... hide them on mouse out.
                    $('.lsindex-list-actions', $(this)).hide();
                }
            );
            $('input', $lists).change(function ( ) {
                var $list = $(this).closest('.lsindex-list');
                // When a list has been selected...
                if ( $(this).attr('checked') ) {
                    // ... add its id to the array of selected lists...
                    selectedLists.push($list.data('id'));
                    // ... and update the data.        
                    $lsindex.data('selectedLists', selectedLists);
                }
                // When a list has been deselected...
                else {
                    // ... remove its id from the array of selected lists...
                    selectedLists = $lsindex.data('selectedLists');
                    selectedLists.splice(selectedLists.indexOf($list.data('id')), 1);
                    // ... and update the data.
                    $lsindex.data('selectedLists', selectedLists);
                }
            });
            $lsindex.bind('changeData', function (e, key) {
                var numberOfSelectedLists;
                // When the selected lists data changes...
                if ( key === 'selectedLists' ) {
                    numberOfSelectedLists = $(this).data(key).length;
                    // ... update related texts.
                    $('.number-of-selected-lists', $(this)).text(numberOfSelectedLists);
                    // If there are selected lists...
                    if ( numberOfSelectedLists ) {
                        // ... make sure the add screen button is being shown.
                        $addScreenButton.show(300);
                    } else {
                        // Otherwise, hide the button.
                        $addScreenButton.hide(300);
                    }
                        
                }
            });
            // When the add screen button is clicked...
            $addScreenButton.click(function ( ) {
                $('.lsview').lsview(
                    [ 
                        'expandContext', 
                        [{
                            name: settings.customScreen,
                            url: '/b2bCustomer/composite.html',
                            data: { 
                                lists: $lsindex.data('selectedLists')
                            }
                        }]
                    ]
                );
            });
            // When the add list button is clicked...
            $addListButton.click(function ( ) {
                alert('TODO: Open dialog with filters for list!');
            });
            // When a list title is clicked...
            $('.lsindex-list-title span', $lists).click(function ( ) {
                $('.lsview').lsview([ 'expandContext', [{ 
                    name: $(this).text(),
                    url: '/course/list.html',
                    data: $(this).closest('.lsindex-list').data('id') 
                }]]);
            });
        }); // end this.each()
        return this;
    }; // end lsindex()
});
