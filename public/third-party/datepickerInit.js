// Initialize the datepicker widgets
$(document).ready(function() {
    $(".datepickerTrigger").datepicker({
        buttonImage: "/third-party/Farm-Fresh_calendar_view_month.png",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        dateFormat: "yy-mm-dd",
        showOn: 'both',
	onSelect: function(dateText) {
	    // $(this) gets the input field to which the datepicker is attached.
        var wrapper =  $(this).closest(".datepickerWrapper")
        // put the selected date in the hidden input whose value will be used for filtering.
        wrapper.find(".form-control").val(dateText);
        // Also display the selected date so the user can see it.
        wrapper.find(".pickedDate").text(dateText);
        
	}
    });
});

