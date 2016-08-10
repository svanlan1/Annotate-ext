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
	} else if(localStorage.getItem('set') === 'custom') {
		options = JSON.parse(localStorage.getItem('custom_preset'));
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

	if(!sess_id) {
		sess_id = Date.now();
	}	
	//jsel[sess_id] = [];


	for(var i in pageJson) {
		if(pageJson[i][sess_id]) {
			pageJson[i][sess_id] = [];
		}

	}
	$('.rectangle').each(function(i,v) {
			var obj = {
				type: "box",
				left: $(v).offset().left,
				top: $(v).offset().top,
				width: $(v).width(),
				height: $(v).height(),
				box_color: $(v).css('border-color'),
				box_width: $(v).css('border-width'),
				box_bg_color: $(v).find('div').eq(0).css('background-color'),
				opacity: $(v).find('div').eq(0).css('opacity')
			}
		jsel.push(obj);
		update_marker_page_obj(obj);		
	});

	$('a.marker_page_marker').each(function(i,v) {
		var obj = {
			type: "pin",
			left: $(v).css('left'),
			top: $(v).css('top'),
			pin_size: $(v).attr('data-marker_pin_size'),
			flag_color: $(v).attr('data_marker_flag_color'),
			data_marker_count: $(v).attr('data-marker-count')
		}
		jsel.push(obj);
		update_marker_page_obj(obj);
	});

	$('textarea.marker_text_note_marker_textarea').each(function(i,v) {
		var obj = {
			type: "text",
			left: $(v).parent().css('left'),
			top: $(v).parent().css('top'),
			text: escape($(v).val()),
			color: $(v).css('color'),
			background: $(v).css('background-color'),
			border_w: $(v).parent().css('border-width'),
			border_c: $(v).parent().css('border-color'),
			width: $(v).parent().css('width'),
			height: $(v).parent().css('height'),
			font: $(v).css('font-size'),
			font_family: $(v).css('font-family').replace(/"/g, ''),
			shadow: $(v).css('text-shadow'),
			opaque_disp: $(v).parent().find('.marker_bg_opaque').css('background')
		}
		jsel.push(obj);
		update_marker_page_obj(obj);
	});

	$('.marker_context_menu').each(function(i,v) {
		var x = $('#marker-context-menu-' + $(v).attr('data-marker-dialog-count'))[0].contentWindow.document;
		var obj = {
			type: "context",
			left: $(v).css('left'),
			top: $(v).css('top'),
			qRec: $(x).find('select').val(),
			rec: escape($(x).find('.marker_recommendation_div').text()),
			ex: escape($(x).find('.marker-rec-ex').next('div').text()),
			notes: escape($(x).find('.marker_textarea_notes').val()),
			count: $(v).attr('data-marker-dialog-count')
		}
		jsel.push(obj);
		update_marker_page_obj(obj);
	});

	if(localStorage.getItem('userID') !== "") {
		if(!an_tech_sess_id || an_tech_sess_id === "") {
			var url = window.location.href;
		} else {
			var url2 = window.location.href;
			var x = url2.indexOf('?annotate=true');
			if(x !== -1) {
				var url = url2.substring(0,x);
			} else {
				var url = url2;
			}			
		}	

		var data = {'url': url, 'obj': jsel, 'page_title': document.title, 'userID': localStorage.getItem('userID'), 'session_id': sess_id, 'username': localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName')}
		chrome.runtime.sendMessage({
			greeting: 'save_annotations',
			data: data
		});		
	} else {
		if(!pageJson) {
			pageJson = {};
		}
		jsel['url'] = window.location.href;
		jsel[0]['url'] = window.location.href;
		pageJson[sess_id] = jsel;
		localStorage.setItem('pageJson', JSON.stringify(pageJson));
		get_page_json();
		//pageJson = localStorage.getItem('pageJson');
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
	if(localStorage.getItem('userID') !== "") {
		var url = window.location.href;
		var x = url.indexOf('?annotate=true');
		if(x !== -1) {
			var substr = url.substring(0,x);	
		} else {
			var substr = url;
		}
		
		var data = {'url': substr, 'userID': localStorage.getItem('userID')};
		chrome.runtime.sendMessage({
			greeting: 'get_annotations',
			data: data
		});	
	} else {
		pageJson = $.parseJSON(localStorage.getItem('pageJson'))
	}

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
	tempObj['user'] = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
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

function display_previous_annotations(index) {
	//console.log(ob);
	
	$('.rectangle, .marker_page_marker, .marker_text_note_marker').remove();

	for (var i in pageJson) {
		if(localStorage.getItem('userID') === "") {
			if(i === index) {
				ob = pageJson[i];
			}
		} else {
			for (var x in pageJson[i]) {
				if(x === index) {
					ob = pageJson[i][x];
				}
			}
		}
	}


	$(ob).each(function(i,v) {
		var type = v.type;
		switch (type) {
			case 'box':
				var div = $('<div class="rectangle" />').css({
					'border-width': v.box_width,
					'border-color': v.box_color,
					'width': v.width,
					'height': v.height,
					'position': 'absolute',
					'left': v.left + 'px',
					'top': v.top + 'px'
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
					'data-marker-count': v['data_marker_count'],
					'data-marker_pin_size': v['pin_size'],
					'data_marker_flag_color': v['flag_color'],
					'href': 'javascript:void(0);'
				}).bind('contextmenu', function(e) {
					e.preventDefault();
					createContextMenu($(this), null, '', null, null, true);
				}).css({
					'position': 'absolute',
					'top': v.top,
					'left': v.left
				}).appendTo('#marker_body_wrap');

				var img = $('<img />').attr({
					'src': chrome.extension.getURL('images/pins/pin_24_' + v['flag_color']+ '.png'),
					'alt': v['flag_color'] + ' pin'
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
					'font-family': v['font_family']
				}).attr('id','marker_text_note_textarea_' + nCount).addClass('marker_text_note_marker_textarea').val(unescape(v.text)).appendTo(div);

				//$(t).attr('style', 'min-height: 0 !important;')
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
			case 'context':
				$('.marker_page_marker').each(function(g,b) {
					if($(b).attr('data-marker-count') === v.count) {
						createContextMenu($(b), null, v.qRec, true, ob[i], true);
					}
				})
				
				break;
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
	var x = url.indexOf('?annotate=true');
	if(x !== -1) {
		var substr = url.substring(0,x);
	} else {
		var substr = url;
	}
	
	var an_len = get_ann_length(substr);
	for (var i in pageJson) {
			if(localStorage.getItem('userID') !== "") {
				var len = pageJson.length;
				if(len > 0) {
					$('.marker-panel-heading').prepend('<a id="ann-alarm" href="javascript:void(0);" title="You have previous annotations on this page!  Click to view."><span class="ann-circle marker"><img src="'+chrome.extension.getURL('images/previous.png')+'" alt="" /></span></a>');
					var img = $('#ann-alarm');
					$(img).click(function() {
						if($('.ann-prev-list-cont').length === 0) {
							show_previous_dialog();
						} else {
							$('.ann-prev-list-cont').remove();
						}
						
					});
					break;				
				}
			} else {
				var len = pageJson[i].length;
				if(len > 0 && pageJson[i][0]['url'] === window.location.href) {
					$('.marker-panel-heading').prepend('<a id="ann-alarm" href="javascript:void(0);" title="You have previous annotations on this page!  Click to view."><span class="ann-circle marker"><img src="'+chrome.extension.getURL('images/previous.png')+'" alt="" /></span></a>');
					var img = $('#ann-alarm');
					$(img).click(function() {
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

	if(an_tech_sess_id) {
		show_previous_dialog();
		$('.ann-prev-list-item a').eq(0).click();
	}
}

function show_previous_dialog() {
	var url = window.location.href;
	var x = url.indexOf('?annotate=true');
	if(x !== -1) {
		var substr = url.substring(0,x);
	} else {
		var substr = url;
	}
	var temp = [],
		container = $('<div />').addClass('ann-prev-list-cont').appendTo('.marker-panel-heading');
	for (var i in pageJson) {
		if(localStorage.getItem('userID') === "") {
			val = i;
			var d = new Date($.parseJSON(i));
			var datestring = (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear() + ', ' + d.getTime();		
			if(pageJson[i].length > 0 && pageJson[i][0]['url'] === window.location.href) {
				var div = $('<div />').addClass('ann-prev-list-item').appendTo(container);
				var a = $('<a />').attr('href', 'javascript:void(0);').attr('data-ann-val', val).html(returnDate(datestring) + '<br /><span class="small">' + pageJson[i].length + ' annotations</span>').appendTo(div);
				$(a).click(function(e) {
					$('.ann-prev-list-cont').remove();
					display_previous_annotations($(this).attr('data-ann-val'));
					page_val = $(this).attr('data-ann-val');
				});
		    	$(a).bind('contextmenu',function(e) {
		    		e.preventDefault();
		    		if(confirm('Do you really want to remove this set of annotations?')) {
		    			remove_row_from_json(this);
		    		}
		    		
		    	});							
			}			
		} else {
			for (var x in pageJson[i]) {
				var val = x;
				var d = new Date($.parseJSON(x));
				var datestring = (d.getMonth()+1) + "/" + d.getDate()  + "/" + d.getFullYear() + ', ' + d.getTime();		
				if(pageJson[i][x].length > 0) {
					if(!an_tech_sess_id || an_tech_sess_id === "") {
						var div = $('<div />').addClass('ann-prev-list-item').appendTo(container);
						var a = $('<a />').attr('href', 'javascript:void(0);').attr('data-ann-val', val).html(returnDate(datestring) + '<br /><span class="small">' + pageJson[i][x].length + ' annotations</span>').appendTo(div);
						$(a).click(function(e) {
							$('.ann-prev-list-cont').remove();
							display_previous_annotations($(this).attr('data-ann-val'));
							page_val = $(this).attr('data-ann-val');
						});
				    	$(a).bind('contextmenu',function(e) {
				    		e.preventDefault();
				    		if(confirm('Do you really want to remove this set of annotations?')) {
				    			remove_row_from_json(this);
				    		}
				    		
				    	});					
					} else {
						if(val === an_tech_sess_id) {
							var div = $('<div />').addClass('ann-prev-list-item').appendTo(container);
							var a = $('<a />').attr('href', 'javascript:void(0);').attr('data-ann-val', val).html(returnDate(datestring) + '<br /><span class="small">' + pageJson[i][x].length + ' annotations</span>').appendTo(div);
							$(a).click(function(e) {
								$('.ann-prev-list-cont').remove();
								page_val = an_tech_sess_id;
								display_previous_annotations($(this).attr('data-ann-val'));
							});
					    	$(a).bind('contextmenu',function(e) {
					    		e.preventDefault();
					    		if(confirm('Do you really want to remove this set of annotations?')) {
					    			remove_row_from_json(this);
					    		}
					    		
					    	});
						}
					}		
				}			
			}
		}
	}

	$('#marker_body_wrap').click(function() {
		$('.ann-prev-list-cont').remove();
	})
}

function remove_row_from_json(el) {
	var val = parseInt($(el).attr('data-ann-val'));
	for (var i in pageJson) {
		if(pageJson[i]['val'] === val) {
			$('.ann-prev-list-cont').remove();
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
}