//To The Top button functionality
jQuery(window).load(function() {
	var e = jQuery('.tothetop');
	var currentColor = jQuery(e).css('background-color');
	if (!currentColor) return;
	var lastComma = currentColor.lastIndexOf(')');
	var newColor = currentColor.slice(0, lastComma) + ", " + 0.5 + ")";
	newColor = [newColor.slice(0, 3), 'a', newColor.slice(3)].join('');
	if (jQuery(window).scrollTop() + jQuery(window).height() == jQuery(document).height()) {
		jQuery('.tothetop').fadeIn();
		jQuery(e).css('background-color', currentColor);
	}
	jQuery(window).scroll(function () {
		if (jQuery(window).scrollTop() + jQuery(window).height() == jQuery(document).height()) {
			jQuery(e).css('background-color', currentColor);
		}
		else {
			jQuery(e).css('background-color', newColor);
		}
		clearTimeout(jQuery.data(this, 'scrollTimer'));
		jQuery.data(this, 'scrollTimer', setTimeout(function () {

			if (!(jQuery(window).scrollTop() + jQuery(window).height() == jQuery(document).height())) {
				jQuery('.tothetop').fadeOut();
			}
		}, 4000));
		if (jQuery(this).scrollTop() > 50) {
			jQuery('.tothetop').fadeIn();
		} else {
			jQuery('.tothetop').fadeOut();
		}
	});
});
