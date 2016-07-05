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
var nCount = 1; // Running tally of how many notes have been placed on the page
var pageJson = []; // Create a json object to track all of pages markings
var issues = []; // Array of all of the failed items on the page from the Accessibility checker
var sess_id = "";//Create session ID for the saving of page markings
//Variable controls whether or not clicking in the page should place a flag.  Default = false
localStorage.setItem('marker_place_flag', 'false'); // Do not place a Marker by default
 localStorage.setItem('e_c', 'expanded');
localStorage.setItem('draw', 'false'); // Do not draw a box by default

/****************************************************************************************************************
*	run_marker() function sets up the iframe on the left and sets the original body element positioned right
****************************************************************************************************************/
function run_marker(welcome) {
	//Send message to background script letting it know that the application is currently active.
	chrome.runtime.sendMessage({
		greeting: 'start'
	});
	mCount = 1;

	//Wrap the body element content in a div.  This is so that we can place the markers and draw the boxes on the correct spot on the page
	$('body').wrapInner('<div id="marker_body_wrap" />');
	$('<canvas />').attr('id', 'marker-canvas-element').appendTo('body');
	
	//Add CSS to head of the document so Marker can access it
	append_scripts_to_head('head');		

	//Add resize function.  Displays a flag when the window is resized
	window.addEventListener("resize", resize_window);

	//Create Marker panel which will be displayed
	create_marker_panel();	
	$('.marker_anchor').attr('href', 'javascript:void(0);');

	//Get pageJson object.  This object determines if previous markings have been made on the page.
	//This feature will not do much until the paid version of this is released.
	//get_page_json();

	//display_previous();
}

/*******************************************************
*	Create the tools panel and place it on the screen
*******************************************************/
function create_marker_panel() {
	//Create the panel for the Marker! tools
	var left = localStorage.getItem('left'),
		top = localStorage.getItem('top');

	//Determine the location of the Marker panel.  If it is too close to the left or top of the screen, position it somewhere the user will be able to see it fully
	if(parseInt(left) > $(window).width()) {
		left = $(window).width - 100;
	}

	if(parseInt(top) > $(window).height()) {
		top = $(window).height() - 200;
	}

	if(parseInt(top) < 0) {
		top = 50;
	}

	if(parseInt(left) < 0) {
		left = 50;
	}

	//Create Marker panel div and make sure it's draggable
	var div = $('<div />').attr({
		'class': 'marker marker-controls',
		'id': 'marker-control-panel'
	}).draggable({
      containment: 'parent',
      stop: function() {
        $(this).css('position', 'fixed');
		$('#marker-control-panel').css('height', 'auto');
		localStorage.setItem('top', $(this).offset().top);
		localStorage.setItem('left', $(this).offset().left);
		sendUpdate();       
      }
    }).css({
		'left': left + 'px',
		'top': top + 'px',
		'position': 'fixed',
		'width': '210px'
	}).appendTo('body');

    //Draw the Marker panel heading
	var h = $('<div />').attr({
		'class': 'marker marker-panel-heading'
	}).text('Marker!').appendTo(div);

	var res_a = $('<a />').attr({
		'href': 'javascript:void(0);',
		'title': 'Hide Marker!',
		'aria-selected': 'false',
		'class': 'marker_window_resize_anchor'
	}).appendTo(div);

	var res_a_img = $('<img />').attr({
		'src': chrome.extension.getURL('images/minimize.png'),
		'alt': 'Hide Marker!'
	}).appendTo(res_a);

	$(res_a).click(function() {
		$(div).css({
			'top': 'auto',
			'right': '0',
			'left':'auto',
			'bottom': '0'
		});
	});

	//Add the Select! button
	$('<a />').attr({
		'id': 'marker_draws',
		'class': 'marker_option marker_anchor',
		'title': 'Highlight an area of page'
	}).html('<img src="' + chrome.extension.getURL('images/select_24.png') + '" alt="Click to select a section of the page" />').appendTo(div).click(function(e) {
		if(localStorage.getItem('draw') === 'false') {
			unplace_marker();
			stop_writing_text();
			
			localStorage.setItem('marker_place_flag', 'false');
			$('#place_marker').find('img').attr('src', chrome.extension.getURL('images/pins/pin_24_inactive.png'));
			$(this).find('img').attr('src', chrome.extension.getURL('images/select_24_active.jpg'));
			localStorage.setItem('draw', 'true');
			initDraw(document.getElementById('marker_body_wrap'));
			//$('#marker_body_wrap').attr('style', 'cursor: url("'+chrome.extension.getURL('images/cursor_draw.png'+'"), default;'));
			$('#marker_body_wrap').attr('style', 'cursor: copy');
			if(localStorage.getItem('show_tips') === 'true') {
				draw_tips_panel('To draw a box around an area on the page, click once and let the mouse draw the box.  The box is resizable and draggable.  So if you don\'t get the box in the perfect location, do not fret.  You can adjust it later.  <strong>Do not attempt to draw the box with the left mouse button pressed.  It will not work</strong>');
			}
			draw_select_color_options();
		} else {
			$('#marker_body_wrap').css('cursor', 'default !important;');
			localStorage.setItem('draw', 'false');
			$(this).find('img').attr('src', chrome.extension.getURL('images/select_24.png'));
			stop_drawing_boxes(document.getElementById('marker_body_wrap'));
			$('body').removeAttr('style');
		}
		
	});	

	//Add the Pin! button
	$('<a />').attr({
		'id': 'place_marker',
		'class': 'marker_option marker_anchor',
		'title': 'Place markers on page'
	}).html('<img src="' + chrome.extension.getURL('images/pins/pin_24_inactive.png') + '" alt="Click to place marker on page" />').click(function() {
		if(localStorage.getItem('marker_place_flag') == 'false') {
			$('#marker_draws').find('img').attr('src', chrome.extension.getURL('images/select_24.png'));
			$(this).find('img').attr('src', chrome.extension.getURL('images/pins/pin_24_'+localStorage.getItem('flag-color')+'.png'));
			localStorage.setItem('marker_place_flag', 'true');
			localStorage.setItem('draw', 'false');
			stop_writing_text();
			stop_drawing_boxes(document.getElementById('marker_body_wrap'));
			place_marker();	
			draw_new_marker_options();
			draw_tips_panel('To place a marker on the screen, simply select the pin you\'d like to place and click on the screen.  To edit the pin\'s note, "Right click" on the note.  <strong>Note:</strong> All pins are draggable.  You can reposition them anywhere on the page.<br />');
		} else {
			$(this).find('img').attr('src', chrome.extension.getURL('images/pins/pin_24_inactive.png'));		
			unplace_marker();
		}

	}).appendTo(div);

		//Add the Text button
	$('<a />').attr({
		'id': 'marker_add_text',
		'class': 'marker_option marker_anchor',
		'title': 'Add text to screen'
	}).html('<img src="' + chrome.extension.getURL('images/add_text_24_inactive.png') + '" alt="" />').appendTo(div).click(function(e) {
		var val = localStorage.getItem('addText');
		if(val === 'false') {
			stop_drawing_boxes(document.getElementById('marker_body_wrap'));
			unplace_marker();		
			$(this).find('img').attr('src', chrome.extension.getURL('images/add_text_24.png'));
			localStorage.setItem('addText', 'true');
			localStorage.setItem('draw', 'false');

			$('#marker_body_wrap').css('cursor', 'default !important;');
			$('#marker_draws img').attr('src', chrome.extension.getURL('images/select_24.png'));
			$('#place_marker img').attr('src', chrome.extension.getURL('images/pins/pin_24_inactive.png'))
			draw_text_options();	
			add_note();
			
		} else {
			stop_writing_text();
			$('#marker_body_wrap').removeAttr('style');
		}
	});

	//Add the Save! button
	$('<a />').attr({
		'id': 'marker_saves',
		'class': 'marker_option marker_anchor',
		'title': 'Save markings'
	}).html('<img src="' + chrome.extension.getURL('images/save_24.png') + '" alt="Save markings" />').appendTo(div).click(function(e) {
		saveToPdf();	
	});	

	//Add Clear! button
	$('<a />').attr({
		'id': 'marker_clear',
		'class': 'marker_option marker_anchor',
		'title': 'Clear and start over'
	}).html('<img src="' + chrome.extension.getURL('images/clear.png') + '" alt="Start Over" />').appendTo(div).click(function(e) {
		$('.marker_page_marker, .marker_context_menu, .rectangle, .marker-print-res-cont, #marker_window_resize_msg').remove();
		$(mifBody).find('.marker_side_text_selection').remove();
		mCount = 1;

	});



	//Add the links/options to the tool panel
	//Add the Accessibility! button
	/*This is currently disabled.  Once the flag gets set to 'a11y', the accessibility check options will be added.  This feature will be available in a later release.
	if(localStorage.getItem('set') === 'a11y_hoorah') {
		$('<a />').attr({
			'href': 'javascript:void(0);',
			'id': 'marker_a11y',
			'class': 'marker_option',
			'title': 'Accessibility Quick Check'
		}).html('<img src="' + chrome.extension.getURL('images/check_24_inactive.png') + '" alt="Accessibility Quick Check" />').appendTo(div).click(function(e) {
			check_a11y();
			unplace_marker();
			$('#marker-pin-colors-drawer').remove();
			stop_drawing_boxes(document.getElementById('marker_body_wrap'));
		});			
	}*/	

	//Display the Marker panel, fade in quickly
	$(div).fadeIn('fast');
	draw_tips_panel('Thanks for using Marker!  In this area, you\'ll find tips as you navigate your way through the page<br />');
}



/****************************************
*	Function to save markings to PDF
*****************************************/
function saveToPdf() {
	
	//update_page_json();


	$('#marker-results-ifr').remove();
	var modal = $('<div />').attr({
		'id': 'marker-print-modal',
		'class': 'marker'
	}).appendTo('body');

	var div = $('<div />').attr({
		'id': 'marker-print-dialog',
		'class': 'marker'
	}).html('Thanks for using Marker!  In this initial release, there\'s no true "Save" feature.<br />Please close this dialog and press  <kbd>Ctrl</kbd> + <kbd>S</kbd> to save this as a .html file<br /><br />At the bottom of this page, you\'ll find all of the recommendations that you\'ve made.').appendTo('body');

	var h = create_iframe('marker-results-ifr', 'body'),
		bod = get_iframe_bod('marker-results-ifr'),
		head = get_iframe_head('marker-results-ifr');			

	append_scripts_to_head('', head);	

	var res = $('<div />').addClass('marker-print-res-cont').appendTo(bod);
	if(localStorage.getItem('user') !== '') {
		var user = localStorage.getItem('user');
	} else {
		var user = ' [ no username set!  set username in Marker! options. ] '
	}
	$('<div />').addClass(' marker marker-display-timestamp').html('<strong>Created by: </strong>' + user).appendTo(res);
	$('<div />').addClass(' marker marker-display-timestamp').html(timeStamp()).appendTo(res);

	var new_div = $('<ol />').addClass('marker-res').appendTo(res);

	$('.marker_context_menu').each(function(i,v) {
		var id = $(v).find('iframe').attr('id');
		var ifr = $('#' + id)[0].contentWindow.document,
			ifrBody = $(ifr).find('body');

		var seltext = $(ifrBody).find('select option:selected').text();
		var li = $('<li />').addClass('marker-a11y-res-list-type').appendTo(new_div);
		var strongtext = $(ifrBody).find('.marker_recommendation_div').html();
		if(strongtext) {
			$('<div class="marker-res-type-issue" />').text(seltext).appendTo(li);
			$('<strong class="recommendations" />').text('Recommendation').appendTo(li);
			$('<div />').html(strongtext).appendTo(li);			
		}
		//$(ifrBody).find('.marker_recommendation').clone().appendTo(li);
		var noteTa = $(ifrBody).find('textarea').val();
		if(noteTa !== "") {
			$('<div />').html('<span class="marker_user_note">' + noteTa + '</span></div>').appendTo(li);
		}
	});

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


	}).addClass('marker_fun_btn').css({
		'border': '2px solid #000',
		'color': '#000',
		'width': '98%',
		'font-size': '20px !important',
		'font-weight': 'bold'
	}).text('Ok!').appendTo(div);
}

function draw_tips_panel(msg) {
	$('.marker-tips-456').remove();
	var pan = $('<div />');
	$(pan).addClass('marker-tips-456').html(msg);
	var chk = $('<input />').attr({
		'type': 'checkbox',
		'id': 'marker-welcome-tips-chk',
		'style': 'width: auto;'
	}).change(function() {
		if($(this).prop('checked') === true) {
			localStorage.setItem('show_tips', 'false');
			sendUpdate();
			$('#marker_window_resize_msg').slideUp('slow');
			setTimeout(function() {
				$('#marker_window_resize_msg').remove();
			}, 5000);

		}
	}).appendTo(pan);
	var lbl = $('<label />').attr({
		'class': 'marker_options_edit',
		'for': 'marker-welcome-tips-chk',
		'style': 'display: inline;'
	}).text('Don\'t show tips ever again!').appendTo(pan);

	if(localStorage.getItem('show_tips') === 'true') {
		resize_window(true, pan, true);
	}
	
}

function resize_window(tip, text, val) {

	var cur_wid = $(window).width()
	var time;
	if($('#marker_window_resize_msg').length === 0) {
		var d = $('<div />').attr({
			'id': 'marker_window_resize_msg'
		}).appendTo('#marker_body_wrap');

		if(!val) {
			$(d).html('<strong>Alert!</strong> <span style="padding: 5px;">Resizing the window does not automatically readjust your markers on the page.  You may need to reposition them.<br /><br />  All markers and moveable and boxes are moveable and resizable.</span>');
		} else {
			$(d).html(text);
		}

		$(d).slideDown('slow');

	} else {
		$('#marker_window_resize_msg').slideDown('fast');
		if(val) {
			$('#marker_window_resize_msg').html(text);			
		} else {
			$('#marker_window_resize_msg').html('<strong>Alert!</strong> <span style="padding: 5px;">Resizing the window does not automatically readjust your markers on the page.  You may need to reposition them.<br /><br />  All markers and moveable and boxes are moveable and resizable.</span>');
		}
	}
	if(!val) {
		time = 6000;	
	} else {
		time = 15000;
	}

	var pre_wid = localStorage.getItem('marker_window_width'),
		pre_hei = localStorage.getItem('marker_window_height');

	var cur_wid = $(window).width(),
		cur_heig = $(window).height();

	var w_diff = cur_wid - parseInt(pre_wid),
		h_diff = cur_heig - parseInt(pre_hei);

	console.log('Width difference: ' + w_diff);
	console.log('Heigh difference: ' + h_diff);

	localStorage.setItem('marker_window_width', $(window).width());
	localStorage.setItem('marker_window_height', $(window).height());	

	setTimeout(function() {
		$('#marker_window_resize_msg').slideUp('slow');
	}, time);	
	
}

function sendUpdate() {
	chrome.runtime.sendMessage({
		greeting: 'store',
		show_tips: localStorage.getItem('show_tips'),
		left: localStorage.getItem('left'),
		top: localStorage.getItem('top'),
		pin_size: localStorage.getItem('pin_size'),
		font_size: localStorage.getItem('font_size'),
		font_color: localStorage.getItem('font_color'),
		font_outline: localStorage.getItem('font_outline'),
		text_shadow_color: localStorage.getItem('text_shadow_color'),
		text_h_shadow: localStorage.getItem('h_shadow'),
		text_v_shadow: localStorage.getItem('v_shadow'),
		text_blur_radius: localStorage.getItem('text_blur_radius'),
		box_width: localStorage.getItem('box_width'),
		box_color: localStorage.getItem('box_color'),
		box_bg_color: localStorage.getItem('box_bg_color'),
		pageJson: localStorage.getItem('pageJson')
	});	
}


function stop_marker() {
	unplace_marker();
	$('*').removeClass('marker_body_wrap marker-flagged-issue');
	$('.marker-highlight-text').removeAttr('style');
	$('#marker-control-panel, .marker_context_menu, .marker_page_marker, .rectangle').remove();

	mCount = 0;
	chrome.runtime.sendMessage({
		greeting: 'stop'
	});	
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.greeting === 'start_stop') {
		if($('#marker-control-panel').length == 0) {
			for(var i in request) {
				localStorage.setItem(i, request[i]);
			}

			if(request.flag_color === 'undefined') {
				localStorage.setItem('flag-color', 'red');
			}

			if(request.preset === '[]') {
				get_select_options();
			} else {
				localStorage.setItem('preset', request.preset);
			}

			localStorage.setItem('marker_window_width', $(window).width());
			localStorage.setItem('marker_window_height', $(window).height());
			

			run_marker(request.welcome);

			if(request.first === 'true') {
				console.log('first time running Marker after installation')
			}
		} else {
			stop_marker();
		}		
	} else if (request.greeting === 'highlight') {
		highlightSelection();
	}
});
