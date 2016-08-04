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
		'href': chrome.extension.getURL('css/annotate.css')
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
	//REMOVE THIS IN ORDER TO PROVIDE LIST OF FULL RESULTS/SAVES - not just this page.
	var jsel = [];
	if(page_val) {
		sess_id = page_val;
	}
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
				'box_bg_color': $(v).find('div').eq(0).css('background-color'),
				'opacity': $(v).find('div').eq(0).css('opacity')
			}
		jsel.push(obj);
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
		jsel.push(obj);
		update_marker_page_obj(obj);
	});

	$('textarea.marker_text_note_marker_textarea').each(function(i,v) {
		var obj = {
			'type': 'text',
			'left': $(v).parent().css('left'),
			'top': $(v).parent().css('top'),
			'text': $(v).val(),
			'color': $(v).css('color'),
			'background': $(v).css('background-color'),
			'border_w': $(v).parent().css('border-width'),
			'border_c': $(v).parent().css('border-color'),
			'width': $(v).parent().css('width'),
			'height': $(v).parent().css('height'),
			'font': $(v).css('font-size'),
			'font-family': $(v).css('font-family'),
			'shadow': $(v).css('text-shadow'),
			'opaque_disp': $(v).parent().find('.marker_bg_opaque').css('background')
		}
		jsel.push(obj);
		update_marker_page_obj(obj);
	});

	if(localStorage.getItem('userID') !== "") {
		localStorage.setItem('pageJson', JSON.stringify(pageJson));
		var data = {'url': window.location.href, 'obj': JSON.stringify(pageJson), 'userID': localStorage.getItem('userID')}
		chrome.runtime.sendMessage({
			greeting: 'save_annotations',
			data: data
		});	
	}	
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
	var url = window.location.href;
	var data = {'url': url, 'userID': localStorage.getItem('userID')};
	chrome.runtime.sendMessage({
		greeting: 'get_annotations',
		data: data
	});	
}

function write_page_json_to_memory() {
	//pageJson = $.parseJSON(localStorage.getItem('pageJson'));
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
	//console.log(ob);
	
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
					'opacity': v.opacity,
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
					'data-marker_pin_size': v['pin_size'],
					'data_marker_flag_color': v['flag-color'],
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
					'width': v['pin_size']
				}).appendTo(a);
				mCount++;
				break;
			case 'text':
				var div = $('<div />').addClass('marker_text_note_marker').attr('id', 'marker_text_note_' + nCount).css({
					'position': 'absolute',
					'top': v.top,
					'left': v.left,
					'width': v.width,
					'height': v.height,
					'border-color': v.border_c,
					'border-width': v.border_w,
					'border-style': 'solid'
				}).resizable({
			  		handles: "n, e, s, w, ne, nw, se, sw",
			  		containment: "parent",
			  		resize: function() {
			  			$(div).find('textarea').css('width', $(div).width() - 10 + 'px');
			  		},
			  		stop: function() {
			  			//$(div).find('textarea').css('width', $(div).width() - 10 + 'px');
			  		}
				}).draggable({
					containment: 'parent'
				}).attr({
					'id': 'marker_text_note_' + nCount,
					'class': 'marker_text_note_marker',
					'tabinex': '-1'
				}).draggable({
					containment: 'parent'
				}).appendTo('#marker_body_wrap');

				var bg = localStorage.getItem('text_background'),
					opacity = parseInt(localStorage.getItem('text_bg_opacity')) * .01;
				$('<div />').css({
					'opacity': opacity,
					'background-color': bg,
					'background': v.opaque_disp,
					'width': '100%',
					'height': '100%',
					'border': 'solid 1px #' + v.border_c
				}).addClass('marker_bg_opaque').appendTo(div);

				var t = $('<textarea />').css({
					'background-color': v.background,
					'color': v.color,
					'width': $(div).width() - 10 + 'px',
					'height': '100%',
					'font-size': v.font,
					'text-shadow': v.shadow,
					'font-family': v['font-family']
				}).attr('id','marker_text_note_textarea_' + nCount).addClass('marker_text_note_marker_textarea').val(v.text).appendTo(div);

				$(t).attr('style', 'min-height: 0 !important;')
				var timeout;
				$(div).hover(
					function() {
				        timeout = setTimeout(function(){
				            $(div).find('img').fadeIn('slow');
				            draw_textbox_options(t, nCount-1);
				        }, 500);
				    },
				    function(){
				        clearTimeout(timeout);
				        $(div).find('img').fadeOut('slow');
				        remove_textbox_options(t, nCount-1);
				    }		  
				);

				$(t).bind('mousewheel', function(e){
			        e.preventDefault();
			        if(e.originalEvent.wheelDelta /120 > 0) {
						var val = parseInt($(this).css('font-size').split('p')[0]);
						val = val + 1;
						$(this).css('font-size', val + 'px');
			        }
			        else{
						var val = $(this).css('font-size').split('p')[0];
						val = val - 1;
						$(this).css('font-size', val + 'px');
			        }
			    });

				var img = $('<img />').attr('src', chrome.extension.getURL('images/notes.png')).attr('title', 'Right click to delete').attr('alt', 'Note ' + nCount).css({
					'position': 'absolute',
					'width': '24px',
					'left': '-26px',
					'display': 'none'
				}).bind('contextmenu', function(e) {
					e.preventDefault();
					$(div).remove();
				}).prependTo(div);

				$(img).hover(
					function() {
						return false;
					}
				);

				nCount++;				
				break
			default:
				break;
		}
	})
}

function get_ann_length(url) {
	var len = 0;
	for (var i in pageJson) {
		if(pageJson[i]['url'] === url) {
			var val = pageJson[i]['val'];
			if(pageJson[i][val].length > 0) {
				len++;
			}
			
		}
	}

	return len;
}

function display_previous() {
	var url = window.location.href;
	var an_len = get_ann_length(url);
	for (var i in pageJson) {
		if(pageJson[i]['url'] === url) {
			var val = pageJson[i]['val'];
			var len = pageJson[i][val].length;
			if(len > 0) {
				$('.marker-panel-heading').prepend('<a id="ann-alarm" href="javascript:void(0);" title="You have previous annotations on this page!  Click to view."><span class="ann-circle marker"><img src="'+chrome.extension.getURL('images/previous.png')+'" alt="" /></span></a>');
				var img = $('#ann-alarm');
				$(img).click(function() {
					//display_previous_annotations(pageJson[i]);
					if($('.ann-prev-list-cont').length === 0) {
						//$('#ann-alarm').attr('src', chrome.extension.getURL('images/list_active.png'));
						show_previous_dialog();
					} else {
						$('.ann-prev-list-cont').remove();
						//$('#ann-alarm').attr('src', chrome.extension.getURL('images/list_inactive.png'));
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
		if(v[val].length > 0) {
			if(v.url === window.location.href) {
				var div = $('<div />').addClass('ann-prev-list-item').appendTo(container);
				var a = $('<a />').attr('href', 'javascript:void(0);').attr('data-ann-val', val).html(returnDate(v.date_time) + '<br /><span class="small">' + v[val].length + ' annotations</span>').appendTo(div);
				var click_val = v;
				$(a).click(function(e) {
					$('.ann-prev-list-cont').remove();
					//$('#ann-alarm').attr('src', chrome.extension.getURL('images/list_inactive.png'));
					page_val = v.val;
					display_previous_annotations(click_val);
				});
		    	$(a).bind('contextmenu',function(e) {
		    		e.preventDefault();
		    		if(confirm('Do you really want to remove this set of annotations?')) {
		    			remove_row_from_json(this);
		    		}
		    		
		    	});					
			}
		}
	});

	$('#marker_body_wrap').click(function() {
		$('.ann-prev-list-cont').remove();
		//$('#ann-alarm').attr('src', chrome.extension.getURL('images/list_inactive.png'));
	})
}

function remove_row_from_json(el) {
	var val = parseInt($(el).attr('data-ann-val'));
	for (var i in pageJson) {
		if(pageJson[i]['val'] === val) {
			$('.ann-prev-list-cont').remove();
			//pageJson.splice( parseInt(i), 1 );
			pageJson[i][val] = [];
			update_page_json();
			var num = $('.ann-prev-list-item a').length;
			$('.ann-circle').text(num);
			if(num === 0) {
				$('#ann-alarm').remove();
			}
			page_val = '';
			
		}
	}
	console.log(el);
}