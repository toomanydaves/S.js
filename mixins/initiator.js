define(
    [ 'utils/checkImplementation', 'interfaces/responder' ], 
    function ( checkImplemetation, responderInterface ) {
        return {
            staticProperties: {
                events: {
                    initiator: {
                        SUCCESS: 1,
                        FAILURE: 2,
                        PROCEED: 3,
                        STOP:    4,
                        WAIT:    5
                    }
                }
            },
            instanceProperties: {
                _responders : [ ],
                addResponder: function ( responder ) {
                    var problemsWithResponder = checkImplementation(responder, responderInterface);

                    if ( problemsWithResponder ) {
                        throw(problemsWithResponder);
                    } else {
                        this._responders.push(responder);
                        return true;
                    }
                },
                removeResponder: function ( responder ) {
                	var index = this._responders.indexOf(responder);

                	if ( index >= 0 ) {
                		this._responders.splice(index, 1);
                	} else {
                		throw('Responder could not be identified, and thus, not removed.');
                	}
                },
                notifyResponders: function ( 
                    notification, 
                    callback, 
                    timeLimit, 
                    logTimeout, 
                    abortOnTimeout, 
                    errorOnTimeout 
                ) {
                    var responders = this._responders,
                        waitFor = { responses: responders.length },
                        events = this.constructor.events.initiator,
                        result = events.SUCCESS,
                        timer;

                    for ( var i = 0; i < responders.length; i++ ) {
                        var response,
                            responseRequired = typeof callback === 'function';
                        
                        response = responders[i].respondToNotification(notification, waitFor, callback);
                        if ( responseRequired ) {
                            if ( !response ) {
                                throw('Observer did not respond to the notification.');
                            } else if ( response === events.PROCEED ) {
                                waitFor.responses--;
                                if ( !(waitFor.responses) ) {
                                    callback();
                                }
                            } else if ( response === events.WAIT ) {
                                result = events.WAITING;
                            } else {
                                throw('Observer\'s response, ' + response + ', could not be parsed.');
                            }
                            if ( timeLimit ) {
                                timer = window.setInterval(
                                    function ( ) {
                                        if ( waitFor.responses ) {
                                            if ( logTimeout ) {
                                                console.log(
                                                    waitFor.responses +
                                                    ' observer(s) did not respond to the notification before ' +
                                                    'time elapsed.'
                                                );
                                            }
                                            if ( !errorOnTimeout ) {
                                                if ( !abortOnTimeout ) {
                                                    callback();
                                                } 
                                            } else {
                                                throw(
                                                    waitFor.responses + 
                                                    ' observer(s) did not respond to the notification before ' +
                                                    'time elapsed.'
                                                );
                                            }
                                        }
                                    },
                                    timeLimit
                                );
                            }
                        }
                    }
                }
            }
        }
    }
);
