/*************************************************************************************************
*	Filename: 	marker_a11y.js
*	Author: 	Shea VanLaningham
*	Website: 	https://github.com/svanlan1/Marker
*	Purpose: 	This file controls the accessibility portion of Marker
*				It is currently not being invoked from anywhere
*
**************************************************************************************************/


/****************************************
*	Run accessibility tests
*****************************************/
function check_a11y() {
	test_anchors();
	test_images();
	test_html();
	if(issues.length > 0) {
		draw_results();
		$('#marker_a11y img').attr('src', chrome.extension.getURL('images/check_24_error.png'));
		$('#marker_a11y').attr('title', 'Accessibility Quick Check - '+issues.length+' issues detected!');

	} else {
		$('#marker_a11y img').attr('src', chrome.extension.getURL('images/check_24_pass.png'));
		$('#marker_a11y').attr('title', 'Accessibility Quick Check - No issues detected!');
	}
}

/*************************************************
*	Draw the accessibility results on the screen
**************************************************/
function draw_results() {
	//Create accessibility results panel
	var div = $('<div />').attr({
		'class': 'marker marker-a11y-results',
		'id': 'marker-a11y-results'
	}).appendTo('#marker-control-panel');

	$('#marker-control-panel').css('width', 'auto');
	$('#marker-control-panel').css('height', 'auto');

	$('<a />').attr({
		'id': 'marker-panel-close',
		'class': 'marker'
	}).html('<img src="'+chrome.extension.getURL('images/close.png') + '" alt="Close Panel" />').click(function(e) {
		$(div).remove();
		$('#marker-control-panel').css('width', '164px');
		issues = [];
	}).appendTo(div);	

	$('<div />').attr({
		'class': 'marker marker-panel-heading',
		'id': 'marker-a11y-head'
	}).text('Accessibility Results').appendTo(div);


	//Create accessibility results iframe
	var iframe = create_iframe('marker-a11y-results-iframe', div, 'marker');
	mifBody = get_iframe_bod('marker-a11y-results-iframe');
	var mifHead = get_iframe_head('marker-a11y-results-iframe');	


	//Add the CSS files to the results panel
	append_scripts_to_head('', mifHead);

	//Loop through the accessibility results and draw the results in the panel
	$(issues).each(function(i,v) {
		var tdiv = $('<div />').addClass('marker-a11y-res-group').appendTo($(mif).find('body'));
		var a = $('<a />').attr({
			'class': 'marker marker-a11y-top-anchor marker_anchor',
			'aria-expanded': 'false'
		}).appendTo(tdiv).click(function(e) {
			if($(this).attr('aria-expanded') === 'false') {
				$(this).parent().find('span').css('display', 'block');
				$(this).attr('aria-expanded', 'true');
				$(this).find('.marker-expanded-ind').text('[ expanded ]');
			} else {
				$(this).parent().find('span').css('display', 'none');
				$(this).attr('aria-expanded', 'false');
				$(this).find('.marker-expanded-ind').text('');
			}
			
		});
		$('<h3 />').addClass('marker marker-a11y-results-h3').text(v.Issue).appendTo(a);
		$('<span />').addClass('marker marker-expanded-ind').text('').appendTo(a);
		$('<span />').addClass('marker marker-a11y-results-span').text(v.Recommendation).appendTo(tdiv);
		$('<span />').addClass('marker marker-a11y-results-code').text(v.HTML).appendTo(tdiv);
	});
}
