/*
 * Takes a timespan in seconds
 * Fills a countdown span
 * Redirects page after timespan
 * 
 * Inspired by: http://stackoverflow.com/a/16532611/6005068
*/
function refresh (timespan) {
    msTimespan = timespan*1000;
    $("#countdown").html(timespan);
    if (timespan > 0) {
        timespan = timespan - 1;
        setTimeout(function(){ refresh(timespan); }, '1000');
    }
    else {
        window.location = "/";
    }
};


$(document).ready(function() {
    refresh('30');
});
