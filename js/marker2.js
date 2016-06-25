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
var issues = []; // Array of all of the failed items on the page from the Accessibility checker

/***********************************************************************************************************
*	run_marker() function sets up the iframe on the left and sets the original body element positioned right
***********************************************************************************************************/
function run_marker(welcome) {
	//Send message to background script letting it know that the application is currently active.
	chrome.runtime.sendMessage({
		greeting: 'start'
	});
	mCount = 1;

	//Variable controls whether or not clicking in the page should place a flag.  Default = false
	localStorage.setItem('marker_place_flag', 'false');
	localStorage.setItem('e_c', 'expanded');
	localStorage.setItem('draw', 'false');

	$('body').wrapInner('<div id="marker_body_wrap" />');
	$('<canvas />').attr('id', 'marker-canvas-element').appendTo('body');
	
	$('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href':  chrome.extension.getURL('css/railway.css')
	}).appendTo('head');

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': 'https://fonts.googleapis.com/css?family=Ubuntu'
		}).appendTo('head');		

	window.addEventListener("resize", resize_window);
	create_marker_panel();		
}

/*******************************************************
*	Create the tools panel and place it on the screen
*******************************************************/
function create_marker_panel() {
//Create the panel for the Marker! tools
	var left = localStorage.getItem('left'),
		top = localStorage.getItem('top');

	if(left > $(window).width()) {
		left = $(window).width - 100;
	}

	if(top > $(window).height()) {
		top = $(window).height() - 200;
	}
	var div = $('<div />').attr({
		'class': 'marker marker-controls',
		'id': 'marker-control-panel'
	}).draggable({
      stop: function() {
        $(this).css('position', 'fixed');
		$('#marker-control-panel').css('height', 'auto');
			localStorage.setItem('top', $(this).offset().top);
			localStorage.setItem('top', $(this).offset().left);
			chrome.runtime.sendMessage({
				greeting: 'store',
				left: $(this).offset().left,
				top: $(this).offset().top
			});	       
      }
    }).css({
		'left': left + 'px',
		'top': top + 'px',
		'position': 'fixed'
	}).appendTo('body');

	$('<div />').attr({
		'class': 'marker marker-panel-heading'
	}).text('Marker!').appendTo(div);

	//Add the links/options to the tool panel
	//Add the Accessibility! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_a11y',
		'class': 'marker_option',
		'title': 'Accessibility Quick Check'
	}).html('<img src="' + chrome.extension.getURL('images/check_24_inactive.png') + '" alt="Accessibility Quick Check" />').appendTo(div).click(function(e) {
		check_a11y();
	});	


	//Add the Select! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_draws',
		'class': 'marker_option',
		'title': 'Highlight an area of page'
	}).html('<img src="' + chrome.extension.getURL('images/select_24.png') + '" alt="Click to select a section of the page" />').appendTo(div).click(function(e) {
		if(localStorage.getItem('draw') === 'false') {
			unplace_marker();
			localStorage.setItem('marker_place_flag', 'false');
			$('#place_marker').find('img').attr('src', chrome.extension.getURL('images/pin_24_inactive.png'));
			
			$(this).find('img').attr('src', chrome.extension.getURL('images/select_24_active.jpg'));
			localStorage.setItem('draw', 'true');
			initDraw(document.getElementById('marker_body_wrap'));
			$('body').attr('style', 'cursor: crosshair');
		} else {
			$('#marker_body_wrap').css('cursor', 'default !important;');
			localStorage.setItem('draw', 'false');
			$(this).find('img').attr('src', chrome.extension.getURL('images/select_24.png'));
			stop_drawing_boxes(document.getElementById('marker_body_wrap'));
			$('body').attr('style', 'cursor: default');
		}
		
	});	

	//Add the Pin! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'place_marker',
		'class': 'marker_option',
		'title': 'Place markers on page'
	}).html('<img src="' + chrome.extension.getURL('images/pin_24_inactive.png') + '" alt="Click to place marker on page" />').click(function() {
		if(localStorage.getItem('marker_place_flag') == 'false') {
			$('#marker_draws').find('img').attr('src', chrome.extension.getURL('images/select_24.png'));
			$(this).find('img').attr('src', chrome.extension.getURL('images/pin_24.png'));
			localStorage.setItem('marker_place_flag', 'true');
			localStorage.setItem('draw', 'false');
			place_marker();	
			stop_drawing_boxes(document.getElementById('marker_body_wrap'));
		} else {
			$(this).find('img').attr('src', chrome.extension.getURL('images/pin_24_inactive.png'));
			localStorage.setItem('marker_place_flag', 'false');			
			unplace_marker();
		}

	}).appendTo(div);


	//Add Clear! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_clear',
		'class': 'marker_option',
		'title': 'Clear and start over'
	}).html('<img src="' + chrome.extension.getURL('images/clear.png') + '" alt="Start Over" />').appendTo(div).click(function(e) {
		$('.marker_page_marker, .marker_context_menu, .rectangle').remove();
		$(mifBody).find('.marker_side_text_selection').remove();
		mCount = 1;

	});

	//Add the Save! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_saves',
		'class': 'marker_option',
		'title': 'Save to PDF'
	}).html('<img src="' + chrome.extension.getURL('images/save_24.png') + '" alt="Save markings" />').appendTo(div).click(function(e) {
		saveToPdf();
		//alert('Save to PDF functionality coming');
	});	
	
}

/***********************************************
*	Place the actual pin icon on the screen
************************************************/
function place_marker() {
	$('#marker_body_wrap').css('cursor', 'pointer');
	$('#marker_body_wrap, #marker_body_wrap a, #marker_body_wrap button').bind('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var x = e.pageX,
			y = e.pageY;

		place_ind_marker(x,y);

		return false;
	});
}

function place_ind_marker(x,y,val) {
	var flag_wrap = $('<a />').attr('href', 'javascript:void(0);').attr('class', 'marker_page_marker').attr('data-marker-count', mCount).css({
		'position': 'absolute',
		'left': x + 'px',
		'top': y + 'px'
	}).bind('contextmenu', function(e) {
		e.preventDefault();
		createContextMenu($(this), e, val);
	}).click(function(e) {
		e.preventDefault();
		createContextMenu($(this), e, val);
		return false;
	}).appendTo('#marker_body_wrap').draggable({
  		stop: function() {
    		hideMenu('marker_context_menu' + $(this).attr('data-marker-count'));
  		}
    });

	var m = $('<img />').attr({
		'src': chrome.extension.getURL('images/pin_24.png'),
		'class': 'marker_page_marker',
		'data-marker-count': mCount
	}).attr('alt', 'Marker ' + mCount).appendTo(flag_wrap);

	mCount++;	
}

/***********************************************
*	Remove all pins placed on the screen
************************************************/
function unplace_marker() {
	$('#marker_body_wrap, #marker_body_wrap a, #marker_body_wrap button').unbind('click');
}

function createContextMenu(el, e, val) {
	var id = 'marker_context_menu' + $(el).attr('data-marker-count');
	if($('#' + id).length === 0) {
		var menu = $('<div />').addClass('marker_context_menu').css({
			'left': e.pageX + 35 + 'px',
			'top': $(el).css('top')
		}).attr('role', 'dialog').attr('id', id).attr('data-marker-dialog-count', $(el).attr('data-marker-count')).draggable({
      		stop: function() {
        		$('.marker_context_menu').css('height', 'auto');
      		}
	    }).css('position', 'absolute').appendTo('body');

		var close = $('<a />').attr({
			'class': 'marker_context_close',
			'href': 'javascript:void(0)'
		}).html('<span class="screen-reader-only">Close context menu for number' + $(el).attr('data-marker-count') + '</span><img src="'+chrome.extension.getURL('images/close.png')+'" alt="" />').appendTo(menu);

		$(close).click(function(e) {
			hideMenu('marker_context_menu' + $(el).attr('data-marker-count'));
		});
		$('<h2 />').addClass('marker').text('Add notes').appendTo(menu);
		
		var infoDiv = $('<div />').addClass('marker marker_info').appendTo(menu);
		$('<label />').attr('for', 'marker_select_box_' + mCount).addClass('instruction marker_required').text('Type of element?').appendTo(infoDiv);
		add_marker_select_options(infoDiv, el, val);		

		$('<button />').addClass('marker marker_fun_btn marker_save_note_btn').attr('value', 'Save Note').text('Save').click(function(e) {
			hideMenu('marker_context_menu' + $(el).attr('data-marker-count'));
		}).appendTo(menu);
		$('<button />').addClass('marker marker_fun_btn').attr('value', 'Delete').text('Delete this flag').click(function(e) {
			$(el).remove();
			$(mifBody).find('.marker_side_text_selection').eq($(mifBody).find('.marker_side_text_selection').length-1).remove();
			$(menu).remove();
			mCount--;
		}).appendTo(menu);
	} else {
		showMenu(id, val);
	}

}

function hideMenu(id) {
	$('#' + id).hide();
}

function showMenu(id,val) {
	$('#' + id).show();
	if(val) {
		$('#' + id).find('select').val(val);
	}
}

function add_marker_select_options(divItem, el, selVal) {
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
	var d = $('<div />').addClass('marker marker_recommendation').attr('id', 'marker_select_text_div_' + mCount).appendTo(divItem);
	var a = $('<a />').addClass('marker-a11y-rec-a').attr('aria-expanded', 'false').attr('href', 'javascript:void(0);').click(function(e) {
		if($(this).attr('aria-expanded') === 'false') {
			$(this).parent().find('.marker_recommendation_div').show();
			$(this).find('.marker-a11y-rec-note').text('[ expanded ]');
			$(this).attr('aria-expanded', 'true');
		} else {
			$(this).parent().find('.marker_recommendation_div').hide();
			$(this).find('.marker-a11y-rec-note').text('[ collapsed ]');
			$(this).attr('aria-expanded', 'false');
		}
		
	}).appendTo(d);
	var strong = $('<strong />').addClass('recommendation').text('Recommendation').appendTo(a);
	var span = $('<span />').addClass('marker-a11y-rec-note').text('[ collapsed ]').appendTo(strong);
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
	var type = el.nodeName;
	var text = $(el).text();
	if(selVal) {
		$(sel).val(selVal);
		$(sel).change();
	}
	console.log(type);
}


/****************************************
*	Function to save markings to PDF
*****************************************/
function saveToPdf() {
	var modal = $('<div />').attr({
		'id': 'marker-print-modal',
		'class': 'marker'
	}).appendTo('body');

	var div = $('<div />').attr({
		'id': 'marker-print-dialog',
		'class': 'marker'
	}).html('Thanks for using Marker!  In this initial release, there\'s no true "Save" feature.<br />Please <br /><br />').appendTo('body');

	
	var res = $('<div />').addClass('marker-print-res-cont').appendTo('body');

	var new_div = $('<ol />').appendTo(res);

	$('.marker_info').each(function(i,v) {
		var li = $('<li />').addClass('marker-a11y-res-list-type').text($(v).find('select').val()).appendTo(new_div);
		$(v).find('.marker_recommendation').clone().appendTo(li);
	})

	var btn = $('<button />').click(function() {
		$(modal).remove();
		$(div).remove();
		var b = $('#marker_body_wrap');
		var textDiv = $('<div />').addClass('marker-text-bottom-div').appendTo(b);
		$(mifBody).find('.marker_side_text_selection').each(function(i,v) {
			
			$(v).find('h3').clone().appendTo(textDiv);
			$(v).find('.marker_recommendation').clone().appendTo(textDiv);

		});		
		setTimeout(function() {
			e = jQuery.Event("keydown");        
			e.which = 83;
			e.ctrlKey = true;
			$(this).trigger(e);
			$(textDiv).remove();
		}, 100);
	}).addClass('marker-btn').text('Save to PDF').appendTo(div);

	var cancelBtn = $('<button />').click(function() {
		$(modal).remove();
		$(div).remove();
	}).addClass('marker-btn').text('Cancel').appendTo(div);
}


/****************************************
*	Run accessibility tests
*****************************************/
function check_a11y() {
	test_anchors();
	test_images();
	test_html();
	draw_results();
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
		$('#marker-control-panel').css('width', '203px');
		issues = [];
	}).appendTo(div);	

	$('<div />').attr({
		'class': 'marker marker-panel-heading',
		'id': 'marker-a11y-head'
	}).text('Accessibility Results').appendTo(div);


	//Create accessibility results iframe
	var iframe = $('<iframe />').attr({
		'id': 'marker-a11y-results-iframe',
		'class': 'marker'
	}).appendTo(div);

	//Set the global mif variables
	mif = $("#marker-a11y-results-iframe")[0].contentWindow.document;
	mifBody = $(mif).find('body');

	//Add the CSS files to the results panel
	$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': chrome.extension.getURL('css/marker.css')
		}).appendTo($(mif).find('head'));

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': chrome.extension.getURL('css/railway.css')
		}).appendTo($(mif).find('head')).appendTo('head');

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href':  chrome.extension.getURL('css/railway.css')
		}).appendTo($(mif).find('head'));

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': 'https://fonts.googleapis.com/css?family=Ubuntu'
		}).appendTo($(mif).find('head'));	

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': 'https://fonts.googleapis.com/css?family=Ubuntu'
		}).appendTo($(mif).find('head'));

	//Loop through the accessibility results and draw the results in the panel
	$(issues).each(function(i,v) {
		var tdiv = $('<div />').addClass('marker-a11y-res-group').appendTo($(mif).find('body'));
		var a = $('<a />').attr({
			'class': 'marker marker-a11y-top-anchor',
			'href': 'javascript:void(0);',
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


function initDraw(canvas) {
    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX;
            mouse.y = ev.pageY;
        } else if (ev.clientX) { //IE
            mouse.x = ev.clientX + document.body.scrollLeft;
            mouse.y = ev.clientY + document.body.scrollTop;
        }
    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;

    if(localStorage.getItem('draw') === 'true') {
    	canvas.onmousemove = function (e) {
	        setMousePosition(e);
	        if (element !== null) {
	            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
	            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
	            element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
	            element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
	            //canvas.style.cursor = "crosshair";
	        }
	    }

	    canvas.onclick = function (e) {
	        if (element !== null) {
	            element = null;
	            //canvas.style.cursor = "default";
	            console.log("finsihed.");
	        } else {
	            console.log("begun.");
	            e.preventDefault();
	            mouse.startX = mouse.x;
	            mouse.startY = mouse.y;
	            element = document.createElement('div');
	            element.className = 'rectangle'
	            element.style.left = mouse.x + 'px';
	            element.style.top = mouse.y + 'px';
	            canvas.appendChild(element)
	            //canvas.style.cursor = "crosshair";
	            $(element).draggable();
	        	$(element).resizable({
				  handles: "n, e, s, w",
				  resize: function( event, ui ) {
				  	stop_drawing_boxes(document.getElementById('marker_body_wrap'));
				  },
				  stop: function (event, ui ) {
				  	initDraw(document.getElementById('marker_body_wrap'));
				  }
				}); 
				return false;          
	        }
	    }    	
    }

}

function stop_drawing_boxes(canvas) {
    canvas.onmousemove = function (e) {
        
    }

    canvas.onclick = function (e) {
    	console.log('no longer drawing boxes :(')
    }
}


function resize_window() {
	if($('#marker_window_resize_msg').length === 0) {
		$('<div />').attr({
			'id': 'marker_window_resize_msg'
		}).html('<strong>Alert!</strong> <span style="padding: 5px;">Resizing the window does not automatically readjust your markers on the page.  You may need to reposition them (but don\'t worry, they\'re all totally draggable)</span>').appendTo('#marker_body_wrap').fadeIn('slow');

	} else {
		$('#marker_window_resize_msg').show();
	}
	setTimeout(function() {
		$('#marker_window_resize_msg').fadeOut('slow');
	}, 10000);	
}

function stop_marker() {
	console.log('stop marker!');
	$('*').removeClass('marker_body_wrap marker-flagged-issue')
	$('#marker-control-panel, .marker_context_menu, .marker_page_marker').remove();
	chrome.runtime.sendMessage({
		greeting: 'stop'
	});	
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if($('#marker-control-panel').length == 0) {
		localStorage.setItem('left', request.left);
		localStorage.setItem('top', request.top);		
		run_marker(request.welcome);
	} else {
		stop_marker();
	}
});