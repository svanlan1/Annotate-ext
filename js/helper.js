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

function update_page_json() {
	for(var i in pageJson) {
		if(pageJson[i][sess_id]) {
			pageJson[i][sess_id] = [];
		}
	}
	$('.rectangle').each(function(i,v) {
			var obj = {
				'type': 'box',
				'left': $(v).offset().left,
				'top': $(v).offset().top,
				'width': $(v).width(),
				'height': $(v).height(),
				'box_color': $(v).css('border-color'),
				'box_width': $(v).css('border-width'),
				'box_bg_color': $(v).find('div').eq(0).css('background-color')
			}

		update_marker_page_obj(obj);		
	});

	$('a.marker_page_marker').each(function(i,v) {
		var obj = {
			'type': 'pin',
			'left': $(v).css('left'),
			'top': $(v).css('top'),
			'pin_size': $(v).attr('data-marker_pin_size'),
			'flag-color': $(v).attr('data_marker_flag_color'),
			'data-marker-count': $(v).attr('data-marker-count')
		}
		update_marker_page_obj(obj);
	});
	localStorage.setItem('pageJson', JSON.stringify(pageJson));
	sendUpdate();
}

function update_marker_page_obj(obj) {
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);	

	obj.win_w = w;
	obj.win_h = h;

	for(var i in pageJson) {
		if(pageJson[i][sess_id]) {
			pageJson[i][sess_id].push(obj);
		}
	}	
}

function get_page_json() {
	pageJson = $.parseJSON(localStorage.getItem('pageJson'));
	if(!pageJson) {
		pageJson = [];
	}
	var url = window.location.href;
	var time = Date.now();
	sess_id = time;
	var tempObj = {};
	tempObj[time] = [];
	tempObj['url'] = url;
	tempObj['date_time'] = timeStamp();
	tempObj['val'] = time;
	pageJson.push(tempObj);	
}

/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * @type {Date}
 */

function timeStamp() {
// Create a date object with the current time
  var now = new Date();

// Create an array with the current month, day and time
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

// Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";

// Convert hour from military time
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

// If hour is 0, set it to 12
  time[0] = time[0] || 12;

// If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }

// Return the formatted string
  return date.join("/") + " " + time.join(":") + " " + suffix;
}

function display_previous() {
	var url = window.location.href;
	for (var i in pageJson) {
		if(pageJson[i]['url'] === url) {
			var val = pageJson[i]['val'];
			var len = pageJson[i][val].length;
			if(len > 0) {
				$('.marker-panel-heading').prepend('<img style="padding-right: 5px;" src="' + chrome.extension.getURL('images/alarm.png') + '" title="You have previous markings on this page!" />');
				break;				
			}
		}
	}
}