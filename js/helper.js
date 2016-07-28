/***********************************************************************************************************
*	Filename: 	helper.js
*	Author: 	Shea VanLaningham
*	Website: 	https://github.com/svanlan1/Annotate
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
		var len = pageJson[i][window.location.href];
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

function returnDate(date) {
	var val = date.split('/');
	var temp = '';
	switch(val[0]) {
		case '1':
			temp += 'January ';
			break;
		case '2':
			temp += 'February ';
			break;
		case '3':
			temp += 'March ';
			break;
		case '4':
			temp += 'April ';
			break;
		case '5':
			temp += 'May ';
			break;
		case '6':
			temp += 'June ';
			break;
		case '7':
			temp += 'July ';
			break;
		case '8':
			temp += 'August ';
			break;
		case '9':
			temp += 'September ';
			break;
		case '10':
			temp += 'October ';
			break;
		case '11':
			temp += 'November ';
			break;
		case '12':
			temp += 'December ';
			break;
		default:
			break;
	}

	temp += val[1] + ', ' + val[2];
	return temp;
}

function display_previous_annotations(ob) {
	console.log(ob);
	
	$('.rectangle, .marker_page_marker, .marker_text_note_marker').remove();

	var val = ob.val;
	$(ob[val]).each(function(i,v) {
		var type = v.type;
		switch (type) {
			case 'box':
				var div = $('<div class="rectangle" />').css({
					'border-width': v.box_width,
					'border-color': v.box_color,
					'width': v.width,
					'height': v.height,
					'position': 'absolute',
					'left': v.left,
					'top': v.top
				}).appendTo('#marker_body_wrap');

				var inside_div = $('<div />').css({
					'background-color': v.box_bg_color,
					'opacity': '.3',
					'width': '100%',
					'height': '100%'
				}).appendTo(div);
	            $(div).draggable();
	        	$(div).resizable({
				  containment: "parent",
				  handles: "n, e, s, w, ne, nw, se, sw",
				  resize: function( event, ui ) {
				  	stop_drawing_boxes(document.getElementById('marker_body_wrap'));
					$('#place_marker').find('img').attr('src', chrome.extension.getURL('images/pins/pin_24_inactive.png'));
					localStorage.setItem('marker_place_flag', 'false');	
					$('#marker-pin-colors-drawer').remove();		
					unplace_marker();				  	
				  },
				  stop: function (event, ui ) {
				  	initDraw(document.getElementById('marker_body_wrap'));
				  }
				});	
		    	$('.rectangle').bind('contextmenu',function(e) {
		    		e.preventDefault();
		    		$(this).remove();
		    	});								
				break;
			case 'pin':
				var a = $('<a />').addClass('marker_page_marker marker_anchor').attr({
					'data-marker-count': v['data-marker-count'],
					'href': 'javascript:void(0);'
				}).css({
					'position': 'absolute',
					'top': v.top,
					'left': v.left
				}).appendTo('#marker_body_wrap');

				var img = $('<img />').attr({
					'src': chrome.extension.getURL('images/pins/pin_24_' + v['flag-color']+ '.png'),
					'alt': v['flag-color'] + ' pin'
				}).css({
					'width': v['pin_size'] + 'px'
				}).appendTo(a);
				break;
			case 'note':
				break
			default:
				break;
		}
	})
}

function display_previous() {
	var url = window.location.href;
	for (var i in pageJson) {
		if(pageJson[i]['url'] === url) {
			var val = pageJson[i]['val'];
			var len = pageJson[i][val].length;
			if(len > 0) {
				$('.marker-panel-heading').prepend('<a href="javascript:void(0);"><img id="ann-alarm" style="padding-right: 5px; vertical-align: baseline; width: 20px;" src="' + chrome.extension.getURL('images/alarm.png') + '" title="You have previous markings on this page!" /></a>');
				var img = $('#ann-alarm').parent();
				$(img).click(function() {
					//display_previous_annotations(pageJson[i]);
					if($('.ann-prev-list-cont').length === 0) {
						show_previous_dialog();
					} else {
						$('.ann-prev-list-cont').remove();
					}
					
				});
				
				break;				
			}
		}
	}
}

function show_previous_dialog() {
	var temp = [],
		container = $('<div />').addClass('ann-prev-list-cont').appendTo('.marker-panel-heading');
	$(pageJson).each(function(i,v) {
		var val = v.val;
		if(v.url === window.location.href) {
			var div = $('<div />').addClass('ann-prev-list-item').appendTo(container);
			var a = $('<a />').attr('href', 'javascript:void(0);').attr('data-ann-val', val).html(returnDate(v.date_time) + '<br /><span class="small">' + v[val].length + ' annotations</span>').appendTo(div);
			var click_val = v;
			$(a).click(function(e) {
				$('.ann-prev-list-cont').remove();
				display_previous_annotations(click_val);
			});
		}
	});

	$('#marker_body_wrap').click(function() {
		$('.ann-prev-list-cont').remove();
	})
}