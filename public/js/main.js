var requestSmokeAlarm = function() {
	var setLocale = function(locale) {
		document.cookie = "locale=" + locale;
		location.reload(); 
	};

	var initForm = function() {
		var $stateDropdown = $('#state'),
			locale = jQuery.cookie('locale');

		$stateDropdown.addClass('state-not-yet-selected');
		// bind focus event for dropdown
		$stateDropdown.on('focus', function() {
			$(this).children('option[value="state-not-yet-selected"]').remove();
			$(this).removeClass('state-not-yet-selected');
		});
	};

	return {
		initForm : initForm,
		setLocale : setLocale
	}
}();

$(document).ready(function() {
	requestSmokeAlarm.initForm();

	var locale = /locale=([^;]+)/.exec(document.cookie);

	$('.language-toggle').on('click', function() {
		var lang = $(this).data('lang');
		requestSmokeAlarm.setLocale(lang);
	});
})