/* *********************************************************************************************************************
PLUGIN lsnavbar
    @description: A navbar is a generic UI component for presenting navigations options in a bar across the screen.
    @methods:
        - init
            @params
            @description
        - remove
            @params
            @description
    @events:
********************************************************************************************************************* */
!function ($) {
	var api,
	    defaults,
        validate,
	    plugin;

    api = {
    	init: function ( options, i18n ) { plugin.init(this, options, i18n); },
    	remove: function ( ) { plugin.remove(); } 
    }; 
    defaults = {
    };
    validate = function ( $el, args ) {
        var error;

        if ( $el.length !== 1 || !($el[0] instanceof HTMLElement) ) {
            error = 'lsmenu must be called on one element';
        } else
        if ( typeof args !== 'object' || !(typeof api[args[0]] === 'function') ) {
            error = 'lsmenu can only be called with an array, ' + 
                'the first item of which matches the name of a plugin method.';
        } else
        if ( args[0] === 'init' && $el.is('.lsmenu') ) {
            error = 'lsmenu.init cannot be called on an already initialized lsmenu';
        } else 
        if ( args[0] === 'init' && $('.lsmenu').length ) {
            error = 'lsmenu init cannot be called when there are existing lsmenus';
        } else 
        if ( args[0] !== 'init' &&  !($el.is('.lsmenu')) ) {
            error = 'lsmenu methods, aside from init, must be called on an initialized lsmenu';
        }
        return error;
    };
    plugin = {
        // PRIVATE VARIABLES
        $el: null,
        settings: null,
        i18n: null,
        // PRIVATE METHODS
    	init: function ( $el, options, i18n ) {
            this.$el       = $el;
    		this.settings  = $.extend({ }, defaults, options);
    		this.i18n      = i18n;
    		this.$el.addClass('lsnavbar');
            this.initLeft();
            this.initRight();
    	}, 
        initLeft: function ( ) {
            this.initHome();
            this.addDivider();
            this.initDomain();
            this.addDivider();
            this.initActions();
        },
        initHome: function ( ) {
            // code.
        },
        addDivider: function ( ) {
            // code.
        },
        initDomain: function () {
            // code.
        },
        initActions: function () {
            // code.
        },
        initRight: function ( ) {
            this.initProfile();
            this.addDivider();
            this.initHelp();
        },
        initProfile: function ( ) {
            // code.
        },
        initHelp: function ( ) {
            // code.
        },
    	remove: function ( ) {
    		this.settings = null;
    		this.$el.empty().removeClass('lsnavbar');
    		this.$el = null;
    	} 
    };
/* =================================================================================================================
   PLUGIN DEFINITION
   Make the API reachable via a plugin on the jquery prototype.
   ================================================================================================================= */
    $.fn.lsnavbar = function ( args ) {
    	var error;

        // Validate before calling the API.
        error = validate(this, args);
        if ( !error ) {
            api[args.shift()].call(this, args);
        } else {
        	$.error(error);
        }
        // Return the jquery object to allow chaining.
        return this;
    };
}(window.jQuery);
