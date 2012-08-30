/**
 * @module components
 */
define([ 'jquery', 'ls/components' ], function ( $, components ) {
    /**
     * A solution for retrieving, displaying and paginating data lists.
     * @namespace components
     * @class List
     * @constructor
     * @param {Object} $el The jQuery object containing the element to use as the container for the list
     */
    components.List = function ( $el ) {
        /**
         * The active settings for the list instance
         * @property _settings
         * @type {Object}
         * @private
         */
        this._settings = components.List._defaults;
        /**
         * The internal state of the list
         * @property _state
         * @type {Object}
         * @private
         */
        this._state = {
            currentPage: 1,
            numberOfPages: null,
            numberOfRecords: 0,
            orderBy: '',
            ascending: true
        };
        /**
         * A jQuery object containing the element used for pagination
         * @property _$pagination
         * @type {Object}
         * @private
         */
        this._$pagination = null;
        /**
         * A jQuery object containing the element used as the basis for the list
         * @property _$el
         * @type {Object}
         * @private
         */
        this._$el = $el.addClass('lslist').data('lslist', this);
        components.List.instances.push(this);
    };
    /**
     * The name of the class
     * @property name
     * @type {String}
     * @final
     * @static
     */
    components.List.name = 'List';
    /**
     * An array of pointers to existing List instances
     * @property instances
     * @type {Array}
     * @static
     */
    components.List.instances = [ ];
    components.List.prototype = {
        /**
         * Make the list ready for use.
         * @method init
         * @param {Object} [options] A config object to override the default settings
         */
        init: function ( options ) {
            var lslist = this,
                $lslist = lslist._$el,
                settings = lslist._settings,
                state = lslist._state,
                cssSelectors = components.List.cssSelectors,
                $pagination,
                $selector,
                html,
                $th;

            if ( options ) {
                $.extend(settings, options);
            }
            if ( !settings.url ) {
                $.error('lslist needs a URL to be able to load list data.');
                return;
            }
            if ( settings.pageUrl ) {
                // Respond to browser events.
                window.onpopstate = function ( e ) {
                    if ( e.state && e.state.lslist ) {
                        settings.formData = e.state.lslist.formData;
                        settings.filters = e.state.lslist.filters;
                        lslist._updateForm();
                        lslist._loadList(e.state.lslist.page, true);
                    }
                };
            }
            // Initialize pagination controls.
            if ( settings.navElement ) {
                $pagination = lslist._$pagination = $(settings.navElement);
            } else {
                $pagination = lslist._$pagination = $(cssSelectors.pagination);
            } 
            if ( !$pagination.length ) {
                $.error('lslist needs elements for pagination');
                return;
            }
            $pagination.find(cssSelectors.goToFirstPage).unbind('click').click(function ( e ) {
                e.stopImmediatePropagation();
                if ( state.currentPage > 1 ) {
                    lslist.pageGoTo(1);
                }
                return false;
            });
            $pagination.find(cssSelectors.goToPreviousPage).unbind('click').click(function ( e ) {
                e.stopImmediatePropagation();
                if ( state.currentPage > 1 ) {
                lslist.pageGoTo(state.currentPage - 1);
                }
                return false;
            });
            $pagination.find(cssSelectors.goToNextPage).unbind('click').click(function ( e ) {
                e.stopImmediatePropagation();
                if ( state.currentPage < state.numberOfPages ) {
                    lslist.pageNext();
                }
                return false;
            });
            $pagination.find(cssSelectors.goToLastPage).unbind('click').click(function ( e ) {
                e.stopImmediatePropagation();
                if ( state.currentPage < state.numberOfPages ) {
                    lslist.pageGoTo(state.numberOfPages);
                }
                return false;
            });
            // Initialize sorting.
            if ( typeof settings.orderBy !== 'undefined' ) {
                lslist._state.orderBy = settings.orderBy;
            }
            if ( typeof settings.ascending !== 'undefined' ) {
                lslist._state.ascending = settings.ascending ? true : false;
            }
            $lslist.find('.orderby').each(function ( ) {
                var $this = $(this),
                    html  = $this.html();

                if ( $this.find('.sort-column').length ) {
                    html = $this.find('.sort-column').html();
                }
                $this.html([
                    '<a href="#" style="white-space: nowrap">',
                        '<span class="ui-icon ui-icon-triangle-2-n-s" style="float: left;"></span>',
                        '<span class="sort-column">',
                            html,
                        '</span>',
                    '</a>'
                ].join(''));
                $this.children().unbind('click').click(function ( e ) {
                    e.stopImmediatePropagation();
                    lslist._orderBy($(this));
                    return false;
                });
            }); 
            // Initialize multiselect.
            if ( settings.rowCheckboxSelector >= 0 && !($('.lslist-row-selector-master', $lslist).length) ) {
                html = '<th><input type="checkbox" class="lslist-row-selector-master" /></th>';
                $th = $lslist.find('th');
                if ( settings.rowCheckboxSelector >= $th.length ) {
                    $selector = $(html).insertAfter($th.eq($th.length - 1)).find('input');
                } else {
                    $selector = $(html).insertBefore($th.eq(settings.rowCheckboxSelector)).find('input');
                }                
                $selector.click(function ( ) {
                    var selectedRows = $lslist.data('selectedRows'),
                        isChecked = $(this).is(':checked');
            
                    if ( typeof selectedRows === 'undefined' ) {
                        selectedRows = [ ];
                    }
                    $('.lslist-row-selector', $lslist).each(function ( ) {
                        var $this = $(this),
                            value = $this.parents('tr').attr('id').split('-').pop(),
                            pos;

                        if ( isChecked ) {
                            $this.attr('checked', 'checked');
                            if ( selectedRows.indexOf(value) === -1 ) {
                                selectedRows.push(String(value));
                            }
                        } else {
                            $this.removeAttr('checked');
                            pos = selectedRows.indexOf(String(value));
                            if ( pos > -1 ) {
                                selectedRows.splice(pos, 1);
                            }
                        }
                    });
                    $lslist.data('selectedRows', selectedRows);
                });
            }
            if ( settings.rowRadioSelector >= 0 && !($('.lslist-row-radio-master', $lslist).length) ) {
                html = '<th class="lslist-row-radio-master"></th>';
                $th = $lslist.find('th');
                if ( settings.rowRadioSelector >= $th.length ) {
                    $th.eq($th.length - 1).after(html);
                } else {
                    $th.eq(settings.rowRadioSelector.before(html));
                }
            }
            // Use history to reset the state when the page is reloaded.
            if ( settings.pageUrl && window.history.state && window.history.state.lslist ) {
                settings.formData = window.history.state.lslist.formData;
                settings.filters = window.history.state.lslist.filters;
                lslist._updateForm();
                lslist._loadList(window.history.state.lslist.page, true);
            } else
            // Otherwise, only load the list if autoRun has been set.
            if ( settings.autoRun ) {
                lslist._loadList();
            }
        },
        /**
         * Get the value of a property of the list's current state
         * @method get
         * @param {String} property (Possibilities include: currentPage, numberOfPages, numberOfRecords, orderBy
         * or ascending)
         * @returns variable Data returned depends on the property selected (currentPage, numberOfPages,
         * numberOfRecords::Number; orderBy::String, ascending::Boolean)
         */
        get: function ( property ) {
            return this._state[property];
        },
        /**
         * Set the value of a property of the list's current state
         * @method set
         * @param {String} property The name of the property to set (possibilities include: orderBy or ascending)
         * @param variable value The type of the argument depends on the property selected (orderBy::String, matching a
         * column name; ascending::Boolean) 
         */
        set: function ( property, value ) {
            if (
                ( property === 'orderBy' && typeof value === 'string' ) ||
                ( property === 'ascending' && typeof value === 'boolean' ) 
            ) {
                this._state[property] = value;
            }
        },
        /**
         * Dynamically change the list's settings
         * @method options
         * @param {Object} config An object to override the current settings
         * @returns settings A copy of the current settings
         */
        options: function ( config ) {
            if ( config ) {
                $.extend(this._settings, config);
                if ( this._settings.navElement ) {
                    this._$pagination = $(this._settings.navElement);
                }
            }
            return $.extend({}, this._settings);
        },
        // THE FOLLOWING FOUR FUNCTIONS ARE NO LONGER USED INTERNALLY AND ARE ONLY INCLUDED TO MAINTAIN THE PREVIOUS
        // API. 
        /**
         * Go to the first page of the list
         * @method pageFirst
         * @depreciated
         */
        pageFirst: function ( ) {
            if ( this._state.currentPage > 1 ) {
                this.pageGoTo(1);
            }
            return false;
        },
        /**
         * Go to the previous page of the list
         * @method pagePrevious
         * @depreciated
         */
        pagePrevious: function ( ) {
            if ( this._state.currentPage > 1 ) {
                this.pageGoTo(this._state.currentPage - 1);
            }
            return false;
        },
        /**
         * Go to the next page of the list
         * @method pageNext
         * @depreciated
         */
        pageNext: function ( ) {
            if ( this._state.currentPage < this._state.numberOfPages ) {
                this.pageGoTo(this._state.currentPage + 1);
            }
            return false;
        },
        /**
         * Go to the last page of the list
         * @method pageLast
         * @depreciated
         */
        pageLast: function ( ) {
            if ( this._state.currentPage < this._state.numberOfPages ) {
                this.pageGoTo(this._state.numberOfPages);
            }
            return false;
        },
        /** 
         * Go to a specific page in the list
         * @method pageGoTo
         * @param {Number} pageNumber
         */
        pageGoTo: function ( pageNumber ) {
            var currentPage = this._state.currentPage;

            if ( isNaN(pageNumber) ) {
                return;
            }
            if ( pageNumber <= 0 || (pageNumber > this._state.numberOfPages && this._state.numberOfPages !== null) ) {
                return;
            }
            this._settings.beforePageChange(currentPage, pageNumber);
            this._loadList(pageNumber);
            this._settings.afterPageChange(currentPage, pageNumber); 
        },
        /**
         * Change the records in the list by applying a new set of filters
         * @method applyFilters
         * @param {String} formData The serialized values of filter form elements
         * @param {Array} [filters] A map of filter form element names to their values. Necessary in order to save the
         * state of the list in the browser's history
         */
        applyFilters: function ( formData, filters ) {
            this._settings.formData = formData;
            this._settings.filters = filters;
         },
        /**
         * Reload the current page in the list
         * @method reload
         */
        reload: function ( ) {
            this._loadList(this._state.currentPage, true);
        },
        /**
         * When a sortable table column has been clicked on reorder the list
         * @method _orderBy
         * @private
         * @params {Object} $a A jQuery object containing the anchor element of the table column 
         */
        _orderBy: function ( $a ) {
            var classes = $a.parent().attr('class').split(' '),
                state = this._state,
                orderByField,
                i;

            for ( i = 0; i < classes.length; i++ ) {
                if ( classes[i].indexOf('header-') === 0 ) {
                    orderByField = classes[i].substring(7);
                    if ( orderByField === state.orderBy ) {
                        state.ascending = !state.ascending;
                    } else {
                        state.ascending = true;
                    }
                    state.orderBy = orderByField;
                    break;
                }
                this._loadList(1); 
            }
         },
        /**
         * Update the records in the list using an XHR get request.
         * @method _loadList
         * @private
         * @param {Number} [pageNumber] The page number of the list to retrieve (no value will retrieve the first page)
         * @param {Boolean} [reloadedFromHistory] An optional flag to set when the newly retrieve list should not be
         * pushed to the browser's history
         */
        _loadList: function ( pageNumber, reloadedFromHistory ) {
            var lslist = this,
                $lslist = lslist._$el,
                settings = lslist._settings,
                state = lslist._state,
                cssSelectors = components.List.cssSelectors,
                $recordTemplate = $lslist.find(cssSelectors.record + '.template'),
                formData = settings.formData,
                orderBy = state.orderBy;

            settings.loadingIndicatorStarted();
            settings.beforeLoad();
            // Prepare query string for request.
            if ( settings.recordsPerPage ) {
                if ( formData.length ) {
                    formData += '&';
                }
                formData += 'recordsPerPage=' + String(settings.recordsPerPage);
            } 
            if ( pageNumber ) {
                if ( formData.length ) {
                    formData += '&';
                }
                formData += 'page=' + String(pageNumber);
            }
            if ( orderBy && orderBy.length ) {
                if ( formData.length ) {
                    formData += '&';
                }
                formData += 'orderBy=' + String(orderBy) + '&ascending=' + ( state.ascending ? '1' : '0' );
            }
            // Send Ajax request.
            $.get(
                settings.url, 
                formData, 
                null, 
                'json'
            ).success(function ( response ) {
                var $pagination = lslist._$pagination,
                    $goToPage,
                    firstPage,
                    pageNumber,
                    selectedRows,
                    selectedRow,
                    record,
                    $row,
                    $td,
                    html,
                    i;

                // Remove existing records.
                $lslist.find(cssSelectors.record + ':not(.template)').remove();
                // Update state data.
                state.currentPage = response.currentPage;
                state.numberOfPages = response.numberOfPages;
                state.numberOfRecords = response.numberOfRecords;
                // Populate list with new records.
                for ( i = 0; i < response.records.length; i++ ) {
                    record = response.records[i];
                    $row = $recordTemplate.clone().removeClass('template');
                    $td = $row.find('td');
                    // Add zebra-striping.    
                    if ( i % 2 ) {
                        $row.addClass('odd');
                    }
                    // Support multi-select.
                    if ( settings.rowCheckboxSelector >= 0 ) {
                        html = '<td><input type="checkbox" class="lslist-row-selector" /></td>';
                        if ( settings.rowCheckboxSelector >= $td.length ) {
                            $td.eq($td.length - 1).after(html);
                        } else {
                            $td.eq(settings.rowCheckboxSelector).before(html);
                        } 
                    }
                    if ( settings.rowRadioSelector >= 0 ) {
                        html = [
                            '<td>',
                                '<input type="radio" name="lslist-radio-selector" class="lslist-radio-selector" />',
                            '</td>'
                        ].join('');
                        if ( settings.rowRadioSelector >= $td.length ) {
                            $td.eq($td.length - 1).after(html);
                        } else {
                            $td.eq(settings.rowRadioSelector).before(html);
                        }
                    }
                    // Add the row to the end of the list.
                    $lslist.find(cssSelectors.record + ':last').after($row);
                    // Fill the cells with data.
                    $.each(record, function ( key, value ) {
                        if ( key === 'id' || key === 'identifier' ) {
                            $row.attr('id', [ $lslist.attr('id'), value ].join('-'));
                            if ( settings.rowCheckboxSelector >= 0 && value !== null ) {
                                selectedRows = $lslist.data('selectedRows');
                                if ( typeof selectedRows !== 'undefined' && selectedRows.indexOf(String(value)) >= 0 ) {
                                    $('.lslist-row-selector', $row).attr('checked', 'checked');
                                }              
                            }
                            if ( settings.rowRadioSelector >= 0 && value !== null ) {
                                selectedRow = $lslist.data('selectedRow');
                                if ( typeof selectedRow !== 'undefined' && selectedRow === value ) {
                                    $('.lslist-radio-selector', $row).attr('checked', 'checked');
                                }
                            }
                        }
                        $row.find('.field-' + key).each(function ( ) {
                            $(this).append(lslist._format($(this), value));
                        }); 
                    });
                    // Add row selection behaviors.
                    $('.lslist-row-selector', $row).click(function ( e ) {
                        var selectedRows = $lslist.data('selectedRows'),
                            $this = $(this),
                            value = $this.parents('tr').attr('id').split('-').pop(),
                            pos;

                        e.stopImmediatePropagation();
                        if ( typeof selectedRows === 'undefined' ) {
                            selectedRows = [ ];
                        }
                        if ( $this.is(':checked') && selectedRows.indexOf(value) === -1 ) {
                            selectedRows.push(String(value));
                        } else if ( !$this.is(':checked') ) {
                            pos = selectedRows.indexOf(String(value));
                            if ( pos > -1 ) {
                                selectedRows.splice(pos, 1);
                            }                 
                        }
                        $lslist.data('selectedRows', selectedRows); 
                    });
                    $('.lslist-radio-selector', $row).click(function ( e ) {
                        var $this = $(this),
                            recordId = $this.parents('tr').attr('id').split('-').pop(),
                            selectedRow = $lslist.data('selectedRow');

                        e.stopImmediatePropagation();
                        if ( $this.is(':checked') ) {
                            $lslist.data('selectedRow', recordId);
                        } else if ( typeof selectedRow !== 'undefined' && recordId === selectedRow ) {
                            $lslist.data('selectedRow', null);
                        }
                    });
                    settings.loadRecord(i, record, $row);
                }
                // Update pagination.
                if ( $pagination ) {
                    $goToPage = $pagination.find(cssSelectors.goToPage);
                    $goToPage.empty();
                    if ( !response.numberOfPages || response.numberOfPages === 0 ) {
                        $pagination.hide();
                        $(cssSelectors.noResults, $lslist).show();
                        $(cssSelectors.hasResults, $lslist).hide();
                    } else {
                        $pagination.show();
                        $(cssSelectors.noResults, $lslist).hide();
                        $(cssSelectors.hasResults, $lslist).show();
                        firstPage = state.currentPage - Math.floor(settings.numberOfPageNavLinks / 2);
                        if ( firstPage + settings.numberOfPageNavLinks > state.numberOfPages ) {
                            firstPage = state.numberOfPages - settings.numberOfPageNavLinks;
                        }
                        if ( firstPage < 1 ) {
                            firstPage = 1;
                        }
                        for ( i = 0; i <= settings.numberOfPageNavLinks; i++ ) {
                            pageNumber = firstPage + i;
                            if ( pageNumber > state.numberOfPages) {
                                break;
                            }
                            if ( pageNumber === state.currentPage ) {
                                $goToPage.append('<span>' + state.currentPage + '</span>');
                            } else {
                                $goToPage.append(
                                    $('<a href="#">' + String(pageNumber) + '</a>').click(function ( e ) {
                                        e.stopImmediatePropagation();
                                        lslist.pageGoTo(pageNumber);
                                        return false;
                                    })
                                );
                            }
                        }
                    }
                    $pagination.find(cssSelectors.noOfResults).each(function ( ) {
                        var $this = $(this),
                            html = $this.html();

                        if ( html ) {
                            $this.html(html.replace(
                                '%results%',
                                '<span>' + String(response.numberOfRecords) + '</span>'
                            ));
                        }
                    });
                }
                // If the list isn't being loaded from history...
                if ( settings.pageUrl && !reloadedFromHistory ) {
                    // ... save the list as a new state.
                    window.history.pushState(
                        { lslist: { page: state.currentPage, formData: formData, filters: settings.filters } },
                        null,
                        settings.pageUrl + '?page=' + state.currentPage
                    );
                }
                settings.loadingIndicatorFinished(true);
                settings.afterLoad(true, response);
            }).error(function ( ) {
                settings.loadingIndicatorFinished(false);
                settings.afterLoad(false);
                $.error('Error requesting ' + settings.url);
            });
        },
        /**
         * Format a given table cell according to the type of value given.
         * @method _format
         * @private
         * @param {Object} $td A jQuery object containing the table cell to be formatted
         * @param variable value The data to be contained in the table cell
         */
        _format: function ( $td, value ) {
            var date;

            if ( $td.hasClass('boolean') ) {
                if ( value === true ) {
                    value = '<span class="ui-icon ui-icon-check"></span>';
                } else if ( value === false ) {
                    value = '<span class="ui-icon ui-icon-close"></span>';
                }
            } else if ( $td.hasClass('datetime') ) {
                if ( isNaN(value) ) {
                    value = value.date;
                } else {
                    date = new Date(value * 1000);
                    value = date.toLocaleString();
                }
            } else if ( $td.hasClass('date') ) {
                if ( isNaN(value) ) {
                    value = value.date;
                    value = value.split(/\s+/g)[0];
                } else {
                    date = new Date(value * 1000);
                    value = date.toLocaleDateString();
                }
            } else if ( $td.hasClass('time') ) {
                if ( isNaN(value) ) {
                    value = value.date;
                    value = value.split(/\s+/g)[0];
                } else {
                    date = new Date(value * 1000);
                    value = date.toLocaleTimeString();
                }
            } else {
                value = String(value);
            }
            return value;                    
        },
        /**
         * Show the loading indicator while the Ajax request is being sent, received and processed.
         * @method _startLoading
         * @private
         */
        _startLoading: function ( ) {
            var lslist = this,
                settings = lslist._settings,
                $lslist = lslist._$el,
                cssSelectors = components.List.cssSelectors,
                $ajaxLoadingDialog,
                x,
                y;

            if ( settings.loadingIndicator ) {
                $ajaxLoadingDialog = $(settings.loadingIndicator);
                if ( $ajaxLoadingDialog.length ) {
                    $ajaxLoadingDialog.show();
                }
            } else {
                $ajaxLoadingDialog = $(cssSelectors.ajaxRequestLoading);
                if ( $ajaxLoadingDialog.length ) {
                    x = $lslist.offset().left + ( Math.abs($lslist.width() - $ajaxLoadingDialog.width()) / 2 );
                    y = $lslist.position().top + ( Math.abs($lslist.height() - $ajaxLoadingDialog.height()) / 2 );
                    $ajaxLoadingDialog.css({ left: x, top: y, zIndex: 9999 }).show();
                }
            }
        },
        /**
         * Hide the loading indicator and, in the case of unsuccessful requests, show a request failed dialog
         * @method _finishLoading
         * @private
         * @params {Boolean} success
         */
        _finishLoading: function ( success ) {
            var settings = this._settings,
                cssSelectors = components.List,
                $ajaxLoadingDialog,
                $ajaxFailedDialog;

            $ajaxLoadingDialog = 
                settings.loadingIndicator ? $(settings.loadingIndicator) : $(cssSelectors.ajaxRequestLoading);
            if ( $ajaxLoadingDialog.length ) {
                $ajaxLoadingDialog.hide();
            }
            if ( !success ) {
                $ajaxFailedDialog = $(cssSelectors.ajaxRequestFailed);
                if ( $ajaxFailedDialog.length ) {
                    $ajaxFailedDialog.dialog();
                }
            }
        },
        /**
         * When loading a previous state from history, update the filter form elements to match the state. 
         * @method _updateForm
         * @private
         */
        _updateForm: function ( ) {
            $.each(this._settings.filters, function ( ) {
                $('[name="' + this.name + '"]').val(this.value);
            });
        }
    };
    components.List._cssSelectors = {
        ajaxRequestFailed  : '#lslist-ajax-failed',
        ajaxRequestLoading : '#lslist-ajax-loading',
        noResults          : '.lslist-no-results',
        hasResults         : '.lslist-has-results',
        pagination         : '.lslist-pagination',
        goToFirstPage      : '.lslist-page-first',
        goToNextPage       : '.lslist-page-next',
        goToPage           : '.lslist-page',
        goToPreviousPage   : '.lslist-page-previous',
        goToLastPage       : '.lslist-page-last',
        record             : '.lslist-record',
        noOfResults        : '.lslist-no-of-results'
    };
    components.List._defaults = {
        /**
         * Whether the list should automatically load after initialization
         * @attribute autoRun
         * @type {Boolean} 
         * @static
         * @default true
         */
        autoRun: true,
        /**
         * The url to use when requesting list data
         * @attribute url
         * @type {String}
         * @static
         * @default null
         */
        url: null,
        /**
         * Both a flag for using the History API and the base URL to use when pushing states to the browser's history
         * @attribute pageUrl
         * @type {String}
         * @static
         * @default null
         */
        pageUrl: null,
        /**
         * The serialized value of filter form elements
         * @attribute formData
         * @type {String}
         * @static
         * @default null
         */
        formData: null,
        /**
         * A map of filter form field names to their values used to return filter form elements to a previous state
         * @attribute filters
         * @type {Array}
         * @static
         * @default null
         */
        filters: null,
        /**
         * The maximum number of records to display on one page
         * @attribute recordsPerPage
         * @type {Number}
         * @static
         * @default 20
         */
        recordsPerPage: 20,
        /**
         * The number of individual links to show for pages surrounding the current one
         * @attribute numberOfPageNavLinks
         * @type {Number}
         * @static
         * @default 6
         */
        numberOfPageNavLinks: 6,
        /**
         * Both a flag for implementing multiselect for list rows (< 0 to opt out) and the index of the column BEFORE
         * which to insert the checkbox
         * @attribute rowCheckboxSelector
         * @type {Number}
         * @static
         * @default -1
         */
        rowCheckboxSelector: -1,
        /**
         *
         * @attribute rowRadioSelector
         * @type {Number}
         * @static
         * @default -1
         */
        rowRadioSelector: -1,
        /**
         * A selector string to an element that will be used for pagination controls. Elements should contain the same
         * classes as those found in components.List.cssSelectors 
         * @attribute navElement
         * @type {String} 
         * @static
         * @default null
         */
        navElement: null,
        /**
         * A function to process record data after it has been retreived
         * @attribute loadRecord
         * @type {Function}
         * @static
         * @default function ( index, record, rowElement ) { }
         */
        loadRecord: function ( index, record, rowElement ) { },
        /**
         * A function to run before a record is loaded from the server 
         * @attribute beforeLoad
         * @type {Function}
         * @static
         * @default function ( ) { }
         */
        beforeLoad: function ( ) { },
        /**
         * A function to run after a records data has been retreived and processed
         * @attribute afterLoad
         * @type {Function}
         * @static
         * @default function ( success, response ) { }
         */ 
        afterLoad: function ( success, response ) { },
        /**
         * A selector string to an element to display when the list is loading
         * @attribute loadingIndicator
         * @type {String}
         * @static
         * @default null
         */
        loadingIndicator: null,
        /**
         * A function to run before a pagination event
         * @attribute beforePageChange
         * @type {Function}
         * @static
         * @default function ( oldPageNumber, newPageNumber ) { }
         */
        beforePageChange: function ( oldPageNumber, newPageNumber ) { },
        /**
         * A function to run after a pagination event
         * @attribute afterPageChange
         * @type {Function}
         * @static
         * @default function ( oldPageNumber, newPageNumber ) { }
         */
        afterPageChange: function ( oldPageNumber, newPageNumber ) { }
    };
    // return the constructor for AMD 
    return components.List;
});
