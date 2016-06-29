/***********************************************************************************************************
*	Filename: 	helper.js
*	Author: 	Shea VanLaningham
*	Website: 	https://github.com/svanlan1/Marker
*	Purpose: 	This file contains all of the helper functions that create, append, remove, return, etc.
*
************************************************************************************************************/

function append_scripts_to_head(head, iframehead) {
	var raleway = $('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href':  chrome.extension.getURL('css/railway.css')
	});

	var ubuntu = $('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href': 'https://fonts.googleapis.com/css?family=Ubuntu'
	});

	var marker = $('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href': chrome.extension.getURL('css/marker.css')
	});

	if(head) {
		$(raleway, ubuntu, marker).appendTo(head);
	}

	if(iframehead) {
		$(marker).appendTo(iframehead);
		$(raleway).appendTo(iframehead);
		$(ubuntu).appendTo(iframehead);
	}
}

function create_iframe(id, loc, className) {
	var iframe = $('<iframe />').attr({'id': id}).appendTo(loc);
	if(className) {
		$(iframe).addClass(className);
	}

	return iframe;
}

function get_iframe_bod(id) {
	var doc = $('#'+id)[0].contentWindow.document,
		body = $(doc).find('body');	

	return body;
}

function get_iframe_head(id) {
	var doc = $('#'+id)[0].contentWindow.document,
		head = $(doc).find('head');	

	return head;
}

function hideMenu(id) {
	$('#' + id).fadeOut('1000');
}

function showMenu(id,val) {
	$('#' + id).fadeIn('fast');
	if(val) {
		$('#' + id).find('select').val(val);
	}
}

function getOptions() {
	if(localStorage.getItem('set') === 'a11y' && !localStorage.getItem('preset')) {
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
	} else {
		options = $.parseJSON(localStorage.getItem('preset'));
	}

	return options;	
}


function get_select_options() {
	var options;
	$.ajax({
		url: chrome.extension.getURL('js/types.json'),
		dataType: 'text',
		'type': 'GET',
		async: false,
		crossDomain: false,
		success: function(data) {
			//options = $.parseJSON(data);
			localStorage.setItem('preset', data);
		}
	});		

}