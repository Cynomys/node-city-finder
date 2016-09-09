// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {

  $('#zip_code').inputmask("99999");
  $('#range-viewer').html($('#radius').val());

});
