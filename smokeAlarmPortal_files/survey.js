(function ($) {

    var pageType = "std";

    // Config Section
    // **************************************
    var daysToBlockSurveys = 30;

    // **************************************
    
    if (courseSurveyEnabled!='' && courseSurveyEnabled=='true') {
        var curURLPath = window.location.href;
        var noSurvey = getCookie("no-survey");
        if (checkForMatch(noSurveyPages,curURLPath)) noSurvey = "false";
        if (checkForMatch(courseSurveyPages,curURLPath)) pageType = "courses-cart";		
		if (pageType == "courses-cart") {
			setCookie("cart","course-cart-abandonment");
		}
		if (noSurvey==null || noSurvey=="") {
			var cartValue = getCookie("cart");
			if (cartValue!=null && cartValue!="") {
				if (courseSurveyEnabled && cartValue=="course-cart-abandonment") launchSurveyModal("course-cart-abandonment");
			}
		}
		if (checkForMatch(timeBasedSurveyPages,curURLPath)) {
			if (getCookie("no-survey")==null) {
				setTimeout(function(){launchSurveyModal("course-cart-abandonment")}, courseSurveyPopUpDelay);
			}
		}
    }

    function checkForMatch(arrType,strURL) {
        var flag = false;
        $.each(arrType, function(k,v) {
            if( strURL.indexOf(v) !== -1 ) {flag = true;}
        });
        return flag;
    }

    function getUrlVar(key,strURL){
        var result = new RegExp(key + "=([^&]*)", "i").exec(strURL);
        return result && result[1] || "";
    }

    function launchSurveyModal(surveyType) {
        setCookie("no-survey",surveyType,daysToBlockSurveys);
        eraseCookie("cart");
        var modalHTML = "<style>.cancel{height:16px;padding:4px 0;margin-left: 20px;}.action,.cancel{width:120px;float:left;}</style><div class='secondary-header'><h1>"+courseSurveyHeader+"</h1></div><div class='secondary-content'><p>"+courseSurveyBody+"</p><div class='action'><div class='bw'><a href='" + courseSurveyURL + "' class='button' title='Continue' target='_blank' onclick='jQuery.colorbox.close();'>"+courseSurveyYes+"</a></div></div><div class='cancel'><a href='#' class='' title='No, thanks.' onclick='jQuery.colorbox.close();return false;'>"+courseSurveyNo+"</a></div></div>";
        sentLightboxEvent ();
        $.colorbox({html: modalHTML,width: 500});
    }

    function sentLightboxEvent () {
        //_gaq.push(['_trackPageview', window.location.href]);
        _GA.trackEvent('PhssSurveyModal', 'View', 'SurveyGizmo-course-availability',0,true);
        return true;
    }
    
    function getCookie(c_name) {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++) {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name) {
                return unescape(y);
            }
        }
    }

    function setCookie(c_name,value,exdays) {
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString()) + "; path=/;";
        document.cookie=c_name + "=" + c_value;
    }

    function eraseCookie(c_name) {
        setCookie(c_name,"",-1);
    }

    function gaEvent(a,b){
        var i,j,L,E,delim="|";
        if(a&&b){b=b.split(delim);L=b.length;E=[]}else{return true;}
        log(t,a,b); // remove or comment out this line in production
        E.push(a);
        for(i=0,j=E.length;i<L;i++){if(!isNaN(parseFloat(b[i]))&&isFinite(b[i])){E[j]=parseFloat(b[i]);}else{E[j]=b[i];}j++;}
        _GA.trackEvent(E);return true;
    }

    function gaClick(){
        var $el=$(this);
        return gaEvent("SurveyModal",$el.attr("data-ga-action"));
      }

})(jQuery)
