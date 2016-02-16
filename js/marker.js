var mif;
var mifBody;
function run_marker() {
	console.log('start marker!');
	$('body').wrap('<div id="marker_body_wrap" />');
	var marker_div_container = $('<div />').attr('id', 'marker_div_container').appendTo('body');
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

	$('<h1 />').attr('class', 'marker').html('Marker <img src="' + chrome.extension.getURL('images/marker_64.png') + '" alt="" />').appendTo(mifBody);
	$('<span />').attr({
		'class': 'marker instruction'
	}).text('Select an option below to begin').appendTo(mifBody);

	var marker_options_div = $('<div />').attr('id', 'marker_options').appendTo(mifBody);

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'place_marker',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/flag_24.png') + '" alt="Click to place marker on page" />').appendTo(marker_options_div);

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_draws',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/select_32.png') + '" alt="Click to select a section of the page" />').appendTo(marker_options_div);	


}

function stop_marker() {
	console.log('stop marker!');
	$('body').unwrap();
	$('#marker_iframe').remove();
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.greeting == 'start') {
		run_marker();
	}

	if(request.greeting == "stop") {
		stop_marker();
	}
});