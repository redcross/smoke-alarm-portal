if (typeof gigya == 'undefined') gigya = { isGigya: true };
if (!gigya.defaultEventMaps) gigya.defaultEventMaps = [];

// Support for Google Analytics

// ga.js queue creation
var _gaq = _gaq || [];

// mapp gigya events to ga,js events
; (function () {
	var getCategoryFunction = function (apiName) {
		return function (e) { return (e.source ? 'Gigya ' + e.source : 'Gigya ' + apiName + ' API') }
	}
	var _gaq_trackSocial = function() {
		_gaq.push(['_trackSocial'].concat(Array.prototype.slice.call(arguments)));
	}
	var _gaq_trackEvent = function() {
		_gaq.push(['_trackEvent'].concat(Array.prototype.slice.call(arguments)));
	}
	var onSendDone = function(a,b,c) {
		var arProviders = a.split(',');
		for (var i=0; i<arProviders.length; i++) {
			_gaq_trackSocial(arProviders[i],b,c);
		}
	}
	gigya.defaultEventMaps.push(
	{
		defaultMethod: _gaq_trackEvent,
		eventMap: [
			{ events: "sendDone", method: onSendDone, args: ['$providers', 'Gigya $source - Share Published', '$targetURL', document.location.href] },
			{ events: "followClicked", method: _gaq_trackSocial, args: ['$button.provider', 'Gigya Follow - button clicked', '$button.actionURL', document.location.href] },
			{ events: "reactionClicked", args: ['Gigya Reaction Bar', 'Button Clicked', '$reaction.text'] },
			{ events: "reactionUnclicked", args: ['Gigya Reaction Bar', 'Button Unclicked', '$reaction.text'] },
			{ events: "commentSubmitted", args: [function (e) {return (e.mode == 'reviews' ? 'Gigya Reviews' : 'Gigya Comments') }, function (e) { return (e.mode == 'reviews' ? 'Review Published' : 'Comment Published') }, '$streamID'] },
			{ events: "commentVoted", args: [function (e) {return (e.mode == 'reviews' ? 'Gigya Reviews' : 'Gigya Comments') }, function (e) { return (e.mode == 'reviews' ? 'Review Voted' : 'Comment Voted')}, '$streamID']},
			{ events: "login", args: [getCategoryFunction('Login'), 'Social Login', '$provider'] },
			{ events: "logout", args: [getCategoryFunction('Logout'), 'Logout'] },
			{ events: "connectionAdded", args: [getCategoryFunction('Add Connection'), 'Social Connection Added', '$provider'] },
			{ events: "connectionRemoved", args: [getCategoryFunction('Remove Connection'), 'Social Connection Removed', '$provider'] }
		]
	});
})();

// Support for Google Universal Analytics

// analytics.js queue creation
(function (_win, _doc, _ga) {
    _win['GoogleAnalyticsObject'] = _ga;
    _win[_ga] = _win[_ga] || function () {
        (_win[_ga].q = _win[_ga].q || []).push(arguments);
    };
})(window, document, 'ga');

// map gigya events to analytics.js events
; (function () {
    var getCategoryFunction = function (apiName) {
        return function (e) {
            return (e.source ? 'Gigya ' + e.source : 'Gigya ' + apiName + ' API');
        };
    };

    var _gaq_trackSocial = function (socialNetwork, actionDescription, actionURL, currentPageURL) {
        ga('send', {
            'hitType': 'social',
            'socialNetwork': socialNetwork,
            'socialAction': actionDescription,
            'socialTarget': actionURL,
            'page': currentPageURL
        });
    };

    var _gaq_trackEvent = function (category, actionDescription, target, currentPageURL) {
        ga('send', {
            'hitType': 'event',
            'eventCategory': category,
            'eventAction': actionDescription,
            'eventLabel': target,
            'eventValue': currentPageURL
        });
    };

    var onSendDone = function (a, b, c) {
        var arProviders = a.split(',');
        for (var i = 0; i < arProviders.length; i++) {
            _gaq_trackSocial(arProviders[i], b, c);
        }
    };

    gigya.defaultEventMaps.push(
	{
	    defaultMethod: _gaq_trackEvent,
	    eventMap: [
			{ events: "sendDone", method: onSendDone, args: ['$providers', 'Gigya $source - Share Published', '$targetURL', document.location.href] },
			{ events: "followClicked", method: _gaq_trackSocial, args: ['$button.provider', 'Gigya Follow - button clicked', '$button.actionURL', document.location.href] },
			{ events: "reactionClicked", args: ['Gigya Reaction Bar', 'Button Clicked', '$reaction.text'] },
			{ events: "reactionUnclicked", args: ['Gigya Reaction Bar', 'Button Unclicked', '$reaction.text'] },
			{ events: "commentSubmitted", args: [function (e) { return (e.mode == 'reviews' ? 'Gigya Reviews' : 'Gigya Comments') }, function (e) { return (e.mode == 'reviews' ? 'Review Published' : 'Comment Published') }, '$streamID'] },
			{ events: "commentVoted", args: [function (e) { return (e.mode == 'reviews' ? 'Gigya Reviews' : 'Gigya Comments') }, function (e) { return (e.mode == 'reviews' ? 'Review Voted' : 'Comment Voted') }, '$streamID'] },
			{ events: "login", args: [getCategoryFunction('Login'), 'Social Login', '$provider'] },
			{ events: "logout", args: [getCategoryFunction('Logout'), 'Logout'] },
			{ events: "connectionAdded", args: [getCategoryFunction('Add Connection'), 'Social Connection Added', '$provider'] },
			{ events: "connectionRemoved", args: [getCategoryFunction('Remove Connection'), 'Social Connection Removed', '$provider'] }
	    ]
	});
})();
