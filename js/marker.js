/**************************************************
*	Filename: 	Marker.js
*	Author: 	Shea VanLaningham
*	Website: 	https://github.com/svanlan1/Marker
*
***************************************************/

//Declare global variables
var mif; // Marker iframe
var mifBody; //Marker iframe body element
var mCount = 1; // Running tally of how many flags have been placed on the page

/***********************************************************************************************************
*	run_marker() function sets up the iframe on the left and sets the original body element positioned right
***********************************************************************************************************/
function run_marker() {
	//Send message to background script letting it know that the application is currently active.
	chrome.runtime.sendMessage({
		greeting: 'start'
	});

	//Variable controls whether or not clicking in the page should place a flag.  Default = false
	localStorage.setItem('marker_place_flag', 'false');

	//Wrap the original body element in a <DIV> and set the width appropriately
	var width = $(window).width() - 300 + 'px';
	$('body').wrapInner('<div class="marker_body_wrap" style="width:'+width+'" />');
	$('body').prepend('<div class="shim"></div>');

	//var marker_div_container = $('<div />').attr('id', 'marker_div_container').before('body');
	//Create the MARKER iframe and append it to the <HTML> element
	$('<iframe />').attr({
		'id': 'marker_iframe',
		'class': 'marker'
	}).appendTo('html');

	//Set the global variables to their correct values
	mif = $("#marker_iframe")[0].contentWindow.document;
	mifBody = $(mif).find('body');

	//Setting up <iframe> with CSS files and welcome text
	$('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href': chrome.extension.getURL('css/marker.css')
	}).appendTo($(mif).find('head'));

	$('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href': chrome.extension.getURL('css/railway.css')
	}).appendTo($(mif).find('head'));

	$('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href':  chrome.extension.getURL('css/railway.css')
	}).appendTo('head');	

	$('<h1 />').attr('class', 'marker').html('Marker <img src="' + chrome.extension.getURL('images/marker_32.png') + '" alt="" />').appendTo(mifBody);
	$('<div />').attr({
		'class': 'marker welcome'
	}).text('a tool for making accessibility recommendations').appendTo(mifBody);
	$('<div />').attr({
		'class': 'marker welcome'
	}).text('To begin, select an option below to either place a flag or select an area that you\'d like to confine your annotations to.').appendTo(mifBody);	
	$('<div />').attr({
		'class': 'marker welcome'
	}).text('Once you place a flag, you will be able to choose what type of element you think it should be').appendTo(mifBody);

	$('<div />').attr({
		'class': 'marker welcome'
	}).text('To add notes to or remove a flag, simply right click on it and choose your desired action').appendTo(mifBody);	

	//getStarted() will draw the rest of the contents in the <iframe>.  Separating them to keep functions small and light.
	getStarted();

}

/******************************************************************************
* getStarted() function draws the remaining startup UI elements in the <iframe>
*******************************************************************************/
function getStarted() {
	
	//Create <div> container for the actionable elements
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

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_draws',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/select_24.png') + '" alt="Click to select a section of the page" />').appendTo(marker_options_div).click(function(e) {
		alert('Select area of page functionality coming soon');
	});	

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_clear',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/clear.png') + '" alt="Start Over" />').appendTo(marker_options_div).click(function(e) {
		$('.marker_page_marker, .marker_context_menu').remove();
		$(mifBody).find('.marker_side_text_selection').remove();
		mCount = 1;

	});

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_saves',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/save_24.png') + '" alt="Save markings" />').appendTo(marker_options_div).click(function(e) {
		alert('Save to PDF functionality coming');
	});	

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_expand',
		'class': 'marker_option'
	}).html('<img src="' + chrome.extension.getURL('images/expand_collapse_24.png') + '" alt="Expand/Collapse All" />').appendTo(marker_options_div).click(function(e) {
		$(mifBody).find('.marker_info').slideUp();
		$(mifBody).find('.collapse').text('Expand');
	});	
	

	$('<div />').attr('class', 'marker_side_text_container').attr('role', 'list').appendTo(mifBody);


	$('<div />').addClass('screen-reader-only').html('<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
	$('<div />').attr('class', 'screen-reader-only').html('<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
	$('<div />').addClass('screen-reader-only').html('<div>Icons made by <a href="http://www.flaticon.com/authors/nice-and-serious" title="Nice and Serious">Nice and Serious</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
	$('<div />').addClass('screen-reader-only').html('<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
	$('<div />').addClass('screen-reader-only').html('<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
	$('<div />').addClass('screen-reader-only').html('<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>').appendTo(mifBody);
}


function place_marker() {
	$('.marker_body_wrap').css('cursor', 'pointer');
	$('.marker_body_wrap, a, button').bind('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var x = e.pageX - 10,
			y = e.pageY - 15;

		var flag_wrap = $('<a />').attr('href', 'javascript:void(0);').attr('class', 'marker_page_marker').attr('data-marker-count', mCount).css({
			'position': 'absolute',
			'left': x + 'px',
			'top': y + 'px'
		}).bind('contextmenu', function(e) {
			e.preventDefault();
			createContextMenu($(this), e);
		}).click(function(e) {
			e.preventDefault();
			$(mifBody).find('#marker_select_box_' + $(this).attr('data-marker-count')).focus();
			return false;
		}).appendTo('body').draggable({ helper: "original" });
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

function createContextMenu(el, e) {
	var id = 'marker_context_menu' + $(el).attr('data-marker-count');
	if($('#' + id).length === 0) {
		var menu = $('<div />').addClass('marker_context_menu').css({
			'left': e.pageX + 35 + 'px',
			'top': $(el).css('top')
		}).attr('role', 'dialog').attr('id', id).appendTo('body');

		var close = $('<a />').attr({
			'class': 'marker_context_close',
			'href': 'javascript:void(0)'
		}).html('<span class="screen-reader-only">Close context menu for number' + $(el).attr('data-marker-count') + '</span><img src="'+chrome.extension.getURL('images/close.png')+'" alt="" />').appendTo(menu);

		$(close).click(function(e) {
			hideMenu('marker_context_menu' + $(el).attr('data-marker-count'));
		});

		$('<label />').addClass('marker').attr('for', 'marker_textarea_' + $(el).attr('data-marker-count')).text('Add notes').appendTo(menu);
		$('<textarea />').addClass('marker marker_note').attr('id', 'marker_textarea_' + $(el).attr('data-marker-count')).appendTo(menu);
		$('<button />').addClass('marker marker_fun_btn marker_save_note_btn').attr('value', 'Save').text('Save').click(function(e) {
			var text = $('#marker_textarea_' + $(el).attr('data-marker-count')).val().replace('<', '&lt;').replace('<', '&gt;'),
				side_box = $(mifBody).find('#marker_select_box_' + $(el).attr('data-marker-count')).parent();
			if($(side_box).find('.marker_user_note_side').length > 0) {
				$(side_box).find('.marker_user_note_side').remove();
			}
			$(side_box).append('<div class="marker marker_user_note_side"><strong>User note:</strong>' + text + '</div>');

		}).appendTo(menu);
		$('<button />').addClass('marker marker_fun_btn').attr('value', 'Delete').text('Delete this flag').click(function(e) {
			$(el).remove();
			$(mifBody).find('.marker_side_text_selection').eq($(mifBody).find('.marker_side_text_selection').length-1).remove();
			$(menu).remove();
			mCount--;
		}).appendTo(menu);
	} else {
		showMenu(id);
	}

}

function hideMenu(id) {
	$('#' + id).hide();
}

function showMenu(id) {
	$('#' + id).show();
}

function add_marker_text() {
	var divItem = $('<div />').attr({
		'class': 'marker_side_text_selection',
		'data-marker-count': mCount,
		'role': 'listitem'
	}).appendTo($(mifBody).find('.marker_side_text_container'));

	var h3 = $('<h3 />').text(mCount + ':').appendTo(divItem);
	$('<span />').addClass('marker_ele_type').appendTo(h3);
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'class': 'marker expand_collapse'
	}).html('<span class="collapse">Collapse</span> <span class="screen-reader-only"> Flag Number' + mCount).click(function(e) {
		if($(this).find('.collapse').text() === "Collapse") {
			$(this).find('.collapse').text('Expand');
			$(divItem).find('.marker_info').slideUp();
		} else {
			$(this).find('.collapse').text('Collapse');
			$(divItem).find('.marker_info').slideDown();
		}
		
	}).appendTo(divItem);
	var infoDiv = $('<div />').addClass('marker marker_info').appendTo(divItem);
	$('<label />').attr('for', 'marker_select_box_' + mCount).addClass('instruction marker_required').text('Type of element?').appendTo(infoDiv);
	add_marker_select_options(infoDiv);
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

	var sel = $('<select />').attr('id', 'marker_select_box_' + mCount).attr('aria-required', 'true').appendTo(divItem);
	var d = $('<div />').addClass('marker marker_recommendation').attr('id', 'marker_select_text_div_' + mCount).html('<strong>Recommendations:</strong>').appendTo(divItem);
	$(options).each(function(i,v) {
		$('<option />').attr('value', v.Value).attr('data-marker-rec', v.Rec).text(v.QuickName).appendTo(sel);
	});

	$(sel).change(function() {
		var val = $(this).val();
		$(this).find('option').each(function(i,v) {
			if(val === $(v).attr('value')) {
				var recDiv = $('<div />').addClass('marker marker_recommendation_div').html($(v).attr('data-marker-rec'));
				$(this).parent(0).parent().parent().find('.marker_ele_type').text($(v).text());
				$(this).parent().parent().find('.marker_recommendation_div').remove();
				$(this).parent().parent().find('.marker_recommendation').append(recDiv);
				return false;
			}
		});
	});
}

function displayContextMenu() {
	console.log('test');
}

function stop_marker() {
	console.log('stop marker!');
	$('*').removeClass('marker_body_wrap')
	$('#marker_iframe, .marker_context_menu, .marker_page_marker').remove();
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