var mif;
var mifBody;
var mCount = 1;
function run_marker() {
	chrome.runtime.sendMessage({
		greeting: 'start'
	});
	localStorage.setItem('marker_place_flag', 'false');
	$('body').wrap('<div class="marker_body_wrap" />').css({
		'width': $(window).width() - 300 + 'px'
	});
	var marker_div_container = $('<div />').attr('id', 'marker_div_container').prependTo('body');
	$('<iframe />').attr({
		'id': 'marker_iframe',
		'class': 'marker'
	}).appendTo(marker_div_container);

	mif = $("#marker_iframe")[0].contentWindow.document;
	mifBody = $(mif).find('body');

	$('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href': chrome.extension.getURL('css/marker.css')
	}).appendTo($(mif).find('head'));

	$('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href': 'https://fonts.googleapis.com/css?family=Raleway'
	}).appendTo($(mif).find('head'));

	$('<h1 />').attr('class', 'marker').html('Marker <img src="' + chrome.extension.getURL('images/marker_32.png') + '" alt="" />').appendTo(mifBody);
	$('<span />').attr({
		'class': 'marker instruction'
	}).text('Select an option below to begin').appendTo(mifBody);

	var marker_options_div = $('<div />').attr('id', 'marker_options').appendTo(mifBody);

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'place_marker',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/flag_24_inactive.png') + '" alt="Click to place marker on page" />').click(function() {
		if(localStorage.getItem('marker_place_flag') == 'false') {
			$(this).find('img').attr('src', chrome.extension.getURL('images/flag_24.png'));
			localStorage.setItem('marker_place_flag', 'true');
			place_marker();			
		} else {
			$(this).find('img').attr('src', chrome.extension.getURL('images/flag_24_inactive.png'));
			localStorage.setItem('marker_place_flag', 'false');			
			unplace_marker();
		}

	}).appendTo(marker_options_div);

	/*$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_draws',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/select_32.png') + '" alt="Click to select a section of the page" />').appendTo(marker_options_div);	
*/
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_saves',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/save_24.png') + '" alt="Save markings" />').appendTo(marker_options_div);	
	

	$('<div />').attr('class', 'marker_side_text_container').attr('role', 'list').appendTo(mifBody);


	$('<div />').addClass('screen-reader-only').html('<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
	$('<div />').attr('class', 'screen-reader-only').html('<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
	$('<div />').addClass('screen-reader-only').html('<div>Icons made by <a href="http://www.flaticon.com/authors/nice-and-serious" title="Nice and Serious">Nice and Serious</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
}

function place_marker() {
	$('.marker_body_wrap').css('cursor', 'pointer');
	$('.marker_body_wrap, .marker_body_wrap a, .marker_body_wrap button').bind('click', function(e) {
		var x = e.pageX - 310,
			y = e.pageY - 15;

		console.log('X: ' + x + ', Y:' + y);

		var flag_wrap = $('<a />').attr('href', 'javascript:void(0);').attr('class', 'marker_page_marker').attr('data-marker-count', mCount).css({
			'position': 'absolute',
			'left': x + 'px',
			'top': y + 'px'
		}).click(function(e) {
			e.preventDefault();
			$(mifBody).find('#marker_select_box_' + $(this).attr('data-marker-count')).focus();
			

			return false;
		}).appendTo('body');
		var m = $('<img />').attr({
			'src': chrome.extension.getURL('images/flag_24.png'),
			'class': 'marker_page_marker',
			'data-marker-count': mCount
		}).attr('alt', 'Marker ' + mCount).appendTo(flag_wrap);

		add_marker_text();

		mCount++;
		return false;
	});
}

function unplace_marker() {
	$('.marker_body_wrap, .marker_body_wrap a, .marker_body_wrap button').unbind('click');
}

function add_marker_text() {
	var divItem = $('<div />').attr({
		'class': 'marker_side_text_selection',
		'data-marker-count': mCount,
		'role': 'listitem'
	}).appendTo($(mifBody).find('.marker_side_text_container'));

	$('<h3 />').text(mCount + ':').appendTo(divItem);
	$('<label />').attr('for', 'marker_select_box_' + mCount).addClass('instruction').text('Type of element?').appendTo(divItem);
	add_marker_select_options(divItem);
}

function add_marker_select_options(divItem) {
	var options;
	$.ajax({
		url: chrome.extension.getURL('js/types.json'),
		dataType: 'text',
		'type': 'GET',
		async: false,
		crossDomain: false,
		success: function(data) {
			options = $.parseJSON(data);
		}
	});

	var sel = $('<select />').attr('id', 'marker_select_box_' + mCount).appendTo(divItem);
	$(options).each(function(i,v) {
		$('<option />').attr('value', v.Value).text(v.QuickName).appendTo(sel);
	});
}

function stop_marker() {
	console.log('stop marker!');
	$('body').unwrap();
	$('#marker_iframe').remove();
	chrome.runtime.sendMessage({
		greeting: 'stop'
	});	
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if($('#marker_iframe').length == 0) {
		run_marker();
	} else {
		stop_marker();
	}
});