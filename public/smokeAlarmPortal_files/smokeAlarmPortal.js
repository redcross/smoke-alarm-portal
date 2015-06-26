function showPreferedRow(e) {
  // Make contact fields (dis)appear based on user's preferred method.
  // At first I was doing fancy stuff with e["target"] and whatnot, but
  // with the asymmetrical logic of having #phone-row visible if the user
  // prefers either phone contact or text contact or both, it was cleaner
  // just to address each case separately. Not fancy, but clear.
  var phoneDisplay = document.getElementById("phone-preference").checked || document.getElementById("text-preference").checked ? "block" : "none";
  var emailDisplay = document.getElementById("email-preference").checked ? "block" : "none";
  $("#phone-row").css("display", phoneDisplay);
  $("#email-row").css("display", emailDisplay);
}

$().ready(function() {
  // Add red stars to labels with "required" attribute
    //  $("label[required]").each(function() {this.text(this.text() + "&nbsp;*");});
 
  // This makes our checkboxes look nice instead of horrible.
  $("#phone-preference").altCheckbox({
    outlineUnchecked: false, 
    sizeClass: "small"
  });
  $("#text-preference").altCheckbox({
    outlineUnchecked: false, 
    sizeClass: "small"
  });
  $("#email-preference").altCheckbox({
    outlineUnchecked: false, 
    sizeClass: "small"
  });

  // Add click handlers to the contact preference checkboxes.
  // Actually we add them to an <a> element that is inserted
  // before the <input> element by the altCheckbox script.
  $("#phone-preference").prev("a").click(showPreferedRow);
  $("#text-preference").prev("a").click(showPreferedRow);
  $("#email-preference").prev("a").click(showPreferedRow);
});