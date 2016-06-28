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
	if(localStorage.getItem('show_tips') === 'true') {
		draw_tips_panel('Thanks for using Marker!  We hope that this makes your web note taking easier.<br />To begin, click on one of the options in the Marker panel.<div class="clear-line"></div>');
	}
			
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
		localStorage.setItem('left', $(this).offset().left);
		sendUpdate();       
      }
    }).css({
		'left': left + 'px',
		'top': top + 'px',
		'position': 'fixed',
		'width': '210px'
	}).appendTo('body');

	$('<div />').attr({
		'class': 'marker marker-panel-heading'
	}).text('Marker!').appendTo(div);

	//Add the links/options to the tool panel
	//Add the Accessibility! button
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
	}



	//Add the Select! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_draws',
		'class': 'marker_option',
		'title': 'Highlight an area of page'
	}).html('<img src="' + chrome.extension.getURL('images/select_24.png') + '" alt="Click to select a section of the page" />').appendTo(div).click(function(e) {
		if(localStorage.getItem('draw') === 'false') {
			unplace_marker();
			draw_select_color_options();
			localStorage.setItem('marker_place_flag', 'false');
			$('#place_marker').find('img').attr('src', chrome.extension.getURL('images/pin_24_inactive.png'));
			$(this).find('img').attr('src', chrome.extension.getURL('images/select_24_active.jpg'));
			localStorage.setItem('draw', 'true');
			initDraw(document.getElementById('marker_body_wrap'));
			$('body').attr('style', 'cursor: crosshair');
			if(localStorage.getItem('show_tips') === 'true') {
				draw_tips_panel('To draw a box around an area on the page, click once and let the mouse draw the box.  The box is resizable and draggable.  So if you don\'t get the box in the perfect location, do not fret.  You can adjust it later.  <strong>Do not attempt to draw the box with the left mouse button pressed.  It will not work</strong>');
			}
		} else {
			$('#marker_body_wrap').css('cursor', 'default !important;');
			localStorage.setItem('draw', 'false');
			$(this).find('img').attr('src', chrome.extension.getURL('images/select_24.png'));
			stop_drawing_boxes(document.getElementById('marker_body_wrap'));
			$('body').removeAttr('style');
			$('#marker-pin-colors-drawer').remove();
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
			$(this).find('img').attr('src', chrome.extension.getURL('images/pin_24_'+localStorage.getItem('flag-color')+'.png'));
			localStorage.setItem('marker_place_flag', 'true');
			localStorage.setItem('draw', 'false');
			place_marker();	
			draw_new_marker_options();
			stop_drawing_boxes(document.getElementById('marker_body_wrap'));
			draw_tips_panel('To place a marker on the screen, simply select the pin you\'d like to place and click on the screen.  To edit the pin\'s note, "Right click" on the note.  <strong>Note:</strong> All pins are draggable.  You can reposition them anywhere on the page.<br />');
		} else {
			$(this).find('img').attr('src', chrome.extension.getURL('images/pin_24_inactive.png'));
			localStorage.setItem('marker_place_flag', 'false');	
			$('#marker-pin-colors-drawer').remove();		
			unplace_marker();
		}

	}).appendTo(div);

	//Add the Highlight! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_highlight',
		'class': 'marker_option',
		'title': 'Highlight - select text on screen and click Highlight button to highlight text.'
	}).html('<img src="' + chrome.extension.getURL('images/highlight_24_inactive.png') + '" alt="Highlight page" />').appendTo(div).click(function(e) {		
		draw_tips_panel('To highlight a section of text, highlight the text with your mouse, and press the "Highlight" button.  This will highlight the text, based on the color you choose on the Options page.<br />');
		highlightSelection();
	});	


	//Add Clear! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_clear',
		'class': 'marker_option',
		'title': 'Clear and start over'
	}).html('<img src="' + chrome.extension.getURL('images/clear.png') + '" alt="Start Over" />').appendTo(div).click(function(e) {
		$('.marker_page_marker, .marker_context_menu, .rectangle, .marker-print-res-cont, #marker_window_resize_msg').remove();
		$(mifBody).find('.marker_side_text_selection').remove();
		mCount = 1;

	});

	//Add the Save! button
	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_saves',
		'class': 'marker_option',
		'title': 'Save markings'
	}).html('<img src="' + chrome.extension.getURL('images/save_24.png') + '" alt="Save markings" />').appendTo(div).click(function(e) {
		saveToPdf();
		//alert('Save to PDF functionality coming');
	});



	$(div).fadeIn('fast');
	
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
		if(localStorage.getItem('leftclick') === 'true') {
			createContextMenu($(this), e, val);
			e.preventDefault();			
		}
		return false;
	}).appendTo('#marker_body_wrap').draggable({
  		stop: function() {
    		hideMenu('marker_context_menu' + $(this).attr('data-marker-count'));
  		}
    });

	var m = $('<img />').attr({
		'src': chrome.extension.getURL('images/pin_24_' + localStorage.getItem('flag-color') + '.png'),
		'class': 'marker_page_marker',
		'style': 'width: ' + localStorage.getItem('pin_size') + ';',
		'data-marker-count': mCount
	}).attr('alt', 'Marker ' + mCount).appendTo(flag_wrap);

	//$('.marker_page_marker').css('width', '24px');
	if(localStorage.getItem('pin_size') === '48px') {
		$('a.marker_page_marker').css('width', '85px');
	}

	mCount++;	
}

/***********************************************
*	Remove all pins placed on the screen
************************************************/
function unplace_marker() {
	$('#marker_body_wrap, #marker_body_wrap a, #marker_body_wrap button').unbind('click');
	$('#marker-pin-colors-drawer').remove();
	$('#marker_body_wrap').removeAttr('style');
}

function draw_new_marker_options() {
	$('#marker-pin-colors-drawer').remove();
	var div = $('<div />').attr('id', 'marker-pin-colors-drawer').appendTo('#marker-control-panel');
	var iframe = $('<iframe />').attr('id', 'marker-pin-colors-iframe').appendTo(div);
	var ifR = $("#marker-pin-colors-iframe")[0].contentWindow.document;
	var ifbody = $(ifR).find('body');
		//Add the CSS files to the results panel
		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': chrome.extension.getURL('css/marker.css')
		}).appendTo($(ifR).find('head'));

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': chrome.extension.getURL('css/railway.css')
		}).appendTo($(ifR).find('head'));

	$('<strong />').addClass('marker').text('Select new pin').appendTo(ifbody);

	//Icon row 1
	$('<a href="javascript:void(0);"/>').attr('data-val', 'red').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_red.png') + '" alt="Red marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'pink').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_pink.png') + '" alt="Pink marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'orange').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_orange.png') + '" alt="Orange marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'yellow').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_yellow.png') + '" alt="Yellow marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'plum').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_plum.png') + '" alt="Lime marker" />').appendTo(ifbody);

	//Icon row 2
	$('<a href="javascript:void(0);"/>').attr('data-val', 'blue').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_blue.png') + '" alt="Blue marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'aqua').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_aqua.png') + '" alt="Aqua marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'bluegreen').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_bluegreen.png') + '" alt="Blue/green marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'green').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_green.png') + '" alt="Green marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'lime').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_lime.png') + '" alt="Lime marker" />').appendTo(ifbody);

	//Icon row 3
	$('<a href="javascript:void(0);"/>').attr('data-val', 'poop').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_poop.png') + '" alt="Poop marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'black').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_black.png') + '" alt="Black marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'grey').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_grey.png') + '" alt="Grey marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'white').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_white.png') + '" alt="White marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'placeholder_red').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_placeholder_red.png') + '" alt="Placeholder red marker" />').appendTo(ifbody);

	//Icon row 4
	$('<a href="javascript:void(0);"/>').attr('data-val', 'placeholder_blue').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_placeholder_blue.png') + '" alt="Placeholder blue marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'dot_red').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_dot_red.png') + '" alt="Dot red marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'dot_blue').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_dot_blue.png') + '" alt="Dot blue marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'dot_green').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_dot_green.png') + '" alt="Dot green marker" />').appendTo(ifbody);
	$('<a href="javascript:void(0);"/>').attr('data-val', 'dot_black').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_dot_black.png') + '" alt="Dot black marker" />').appendTo(ifbody);
	
	
	
	if(localStorage.getItem('icon_pack_1') === 'true') {
		
		$('<a href="javascript:void(0);"/>').attr('data-val', 'html').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_html.png') + '" alt="HTML" />').appendTo(ifbody);
		$('<a href="javascript:void(0);"/>').attr('data-val', 'css').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_css.png') + '" alt="CSS" />').appendTo(ifbody);
		$('<a href="javascript:void(0);"/>').attr('data-val', 'scissors').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_scissors.png') + '" alt="Scissors" />').appendTo(ifbody);
		$('<a href="javascript:void(0);"/>').attr('data-val', 'notepad').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_notepad.png') + '" alt="Notepad" />').appendTo(ifbody);
		$('<a href="javascript:void(0);"/>').attr('data-val', 'brackets').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_brackets.png') + '" alt="Brackets" />').appendTo(ifbody);

		$('<a href="javascript:void(0);"/>').attr('data-val', 'happy').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_happy.png') + '" alt="Happy" />').appendTo(ifbody);
		$('<a href="javascript:void(0);"/>').attr('data-val', 'laughing').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_laughing.png') + '" alt="Laughing" />').appendTo(ifbody);
		$('<a href="javascript:void(0);"/>').attr('data-val', 'sad').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_sad.png') + '" alt="Sad" />').appendTo(ifbody);
		$('<a href="javascript:void(0);"/>').attr('data-val', 'sick').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_sick.png') + '" alt="Sick" />').appendTo(ifbody);

		

		$('<a href="javascript:void(0);"/>').attr('data-val', 'dung').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_dung.png') + '" alt="Dung marker" />').appendTo(ifbody);
		$('<a href="javascript:void(0);"/>').attr('data-val', 'goldstar').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_goldstar.png') + '" alt="Goldstar marker" />').appendTo(ifbody);	
		$('<a href="javascript:void(0);"/>').attr('data-val', 'wrong').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_wrong.png') + '" alt="Wrong marker" />').appendTo(ifbody);	
		$('<a href="javascript:void(0);"/>').attr('data-val', 'heart').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_heart.png') + '" alt="Heart" />').appendTo(ifbody);	

		$('<a href="javascript:void(0);"/>').attr('data-val', 'jason').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_jason.png') + '" alt="Jason" />').appendTo(ifbody);	
		$('<a href="javascript:void(0);"/>').attr('data-val', 'freddy').addClass('marker_option').html('<img src="' + chrome.extension.getURL('images/pin_24_freddy.png') + '" alt="Freddy" />').appendTo(ifbody);		


	} else {
		$('#marker-pin-colors-iframe').css('height', '190px');
	}



	$(ifbody).find('.marker_option img').css('width', '24px');

	$(ifbody).find('.marker_option img').each(function(i,v) {
		$(v).attr('title', $(v).attr('alt'));
	});

	$(ifbody).find('.marker_option').click(function() {
		localStorage.setItem('flag-color', $(this).attr('data-val'));
		$('#place_marker').find('img').css('width', '24px').attr('src', chrome.extension.getURL('images/pin_24_' + localStorage.getItem('flag-color') + '.png'));
	});

}

function highlightSelection() {
	var selection = window.getSelection();
	if(selection.rangeCount > 0) {
		$('#marker_highlight').find('img').attr('src', chrome.extension.getURL('images/highlight_24.png'));
		setTimeout(function() {
			$('#marker_highlight').find('img').attr('src', chrome.extension.getURL('images/highlight_24_inactive.png'));
		}, 2000);
		var range = selection.getRangeAt(0);
		var container = $(range.commonAncestorContainer).wrap('<span class="marker-highlight-text" style="display:block; background-color: '+localStorage.getItem('highlight_color')+';" />');
		console.log(range.commonAncestorContainer);				
	} else {
		console.log('Nothing to highlight');
	}
	

/*var range = window.getSelection().getRangeAt(0),
        span = document.createElement('span');

    span.className = 'highlight';
    $(span).css('background-color', localStorage.getItem('highlight_color')).css('display', 'block');
    span.appendChild(range.extractContents());
    range.insertNode(span);*/	
	//var newNode = document.createElement("span");
	//newNode.setAttribute("style", "background-color: pink;");
	//range.surroundContents(newNode);	
}

function draw_select_color_options() {
	$('#marker-pin-colors-drawer').remove();
	var div = $('<div />').attr('id', 'marker-pin-colors-drawer').appendTo('#marker-control-panel');

	$('<strong />').addClass('marker').text('Change box width').appendTo(div);
	var widDiv = $('<div />').css({
		'margin': '10px'
	}).appendTo(div)
	var sub = $('<a />').attr({
		'id': 'marker_sub_box_change',
		'href': 'javascript:void(0);'
	}).addClass('change_width').html('<img src="' + chrome.extension.getURL('images/minus.png') + '" alt="Reduce border width by 1px" />').appendTo(widDiv);
	var changeWid = $('<input />').attr({
		'type': 'text',
		'id': 'marker_box_width_select',
		'value': localStorage.getItem('box_width')
	}).appendTo(widDiv);
	var add = $('<a />').attr({
		'id': 'marker_add_box_change',
		'href': 'javascript:void(0);'
	}).addClass('change_width').html('<img src="' + chrome.extension.getURL('images/plus.png') + '" alt="Increase border width by 1px" />').appendTo(widDiv);

	$('<strong />').addClass('marker').text('Change box color').appendTo(div);
	var input = document.createElement('INPUT');
	$(input).attr('type', 'text');
	$(input).attr('id', 'marker_color_select').attr('style', 'z-index: 2147483635').addClass('jscolor').val(localStorage.getItem('box_color').substring(1, localStorage.getItem('box_color').length)).appendTo(div);
	var picker = new jscolor(input);
	
	$('.change_width').click(function() {
		var val = $('#marker_box_width_select').val();
		if($(this).attr('id') === 'marker_sub_box_change') {
			val = val - 1;
		} else {
			val = parseInt(val) + 1;
		}

		$('#marker_box_width_select').val(val);
		localStorage.setItem('box_width', val);
	});

	$('#marker_color_select').change(function() {
		localStorage.setItem('box_color', '#' + $('#marker_color_select').val());
	}).appendTo(div);
}

function draw_highlight_color_options() {
	$('#marker-pin-colors-drawer').remove();
	var div = $('<div />').attr('id', 'marker-pin-colors-drawer').appendTo('#marker-control-panel');

	$('<strong />').addClass('marker').text('Change box color').appendTo(div);
	var input = document.createElement('INPUT');
	$(input).attr('type', 'text');
	$(input).attr('id', 'marker_color_select').addClass('jscolor').val(localStorage.getItem('highlight_color').substring(1, localStorage.getItem('highlight_color').length)).appendTo(div);
	var picker = new jscolor(input);

	$('#marker_color_select').change(function() {
		localStorage.setItem('highlight_color', '#' + $('#marker_color_select').val());
	}).appendTo(div);
}

function createContextMenu(el, e, val) {
	var id = 'marker_context_menu' + $(el).attr('data-marker-count');
	if($('#' + id).length === 0) {
		var winWidth = $(window).width();
		if((e.pageX + 427) > winWidth) {
			var left = winWidth - 450 + 'px';
		} else {
			var left = e.pageX + 35 + 'px';
		}
		var top = $(el).css('top');

		var menu = $('<div />').addClass('marker_context_menu').css({
			'left': left,
			'top': top
		}).attr('role', 'dialog').attr('id', id).attr('data-marker-dialog-count', $(el).attr('data-marker-count')).draggable({
      		stop: function() {
        		//$('.marker_context_menu').css('height', 'auto');
      		}
	    }).css('position', 'absolute').appendTo('body');

		var close = $('<a />').attr({
			'class': 'marker_context_close',
			'href': 'javascript:void(0)'
		}).html('<span class="screen-reader-only">Close context menu for number' + $(el).attr('data-marker-count') + '</span><img src="'+chrome.extension.getURL('images/close.png')+'" alt="" />').appendTo(menu);



		$(close).click(function(e) {
			hideMenu('marker_context_menu' + $(el).attr('data-marker-count'));
		});
		$('<h2 />').addClass('marker marker_drag').attr('tabindex', '-1').text('Add notes').appendTo(menu);
		var iframediv = $('<div />').addClass('marker-context-menu-iframe-container').appendTo(menu);

		var iframe = $('<iframe />').css('display', 'none').addClass('marker-context-iframe').attr('id', 'marker-context-menu-' + $(el).attr('data-marker-count')).appendTo(iframediv);
		var iframeStuff = $('#marker-context-menu-' + $(el).attr('data-marker-count'))[0].contentWindow.document;
		var ifBody = $(iframeStuff).find('body');

		//Add the CSS files to the results panel
		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': chrome.extension.getURL('css/marker.css')
		}).appendTo($(iframeStuff).find('head'));

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': chrome.extension.getURL('css/railway.css')
		}).appendTo($(iframeStuff).find('head')).appendTo('head');

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href':  chrome.extension.getURL('css/railway.css')
		}).appendTo($(iframeStuff).find('head'));

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': 'https://fonts.googleapis.com/css?family=Ubuntu'
		}).appendTo($(iframeStuff).find('head'));			
		

		
		var infoDiv = $('<div />').addClass('marker marker_info').appendTo(ifBody);
		if(localStorage.getItem('set') === 'a11y' || localStorage.getItem('set') === 'html') {
			$('<label />').attr('for', 'marker_select_box_' + mCount).addClass('marker_required marker_label').text('Type of element?').appendTo(infoDiv);
			add_marker_select_options(infoDiv, el, val);
			$('<label />').attr('for', 'marker_textarea_' + mCount).addClass('marker_required marker_label').text('Notes').appendTo(infoDiv);
			$('<textarea />').addClass('marker_textarea_notes').attr('id', 'marker_textarea)' + mCount).appendTo(infoDiv);
			$('.marker-context-menu-iframe-container:visible').css('height', '390px');			
		} else {
			$('<label />').attr('for', 'marker_textarea_' + mCount).addClass('marker_required marker_label').text('Notes').appendTo(infoDiv);
			$('<textarea />').addClass('marker_textarea_notes').attr('id', 'marker_textarea)' + mCount).appendTo(infoDiv);
			var h = $(infoDiv).height();
			var he = h + 85;
			$('.marker-context-menu-iframe-container:visible').css('height', '305px');
			$('.marker_context_menu:visible').css('height', '335px');				
		}
				

		$('<button />').addClass('marker marker_fun_btn marker_save_note_btn').attr('value', 'Save Note').text('Save').click(function(e) {
			hideMenu('marker_context_menu' + $(el).attr('data-marker-count'));
		}).appendTo(ifBody);
		$('<button />').addClass('marker marker_fun_btn').attr('value', 'Delete').text('Delete this flag').click(function(e) {
			$(el).remove();
			$(mifBody).find('.marker_side_text_selection').eq($(mifBody).find('.marker_side_text_selection').length-1).remove();
			$(menu).remove();
			mCount--;
		}).appendTo(ifBody);
		$('#' + id).find('iframe').ready(function() {
			$('#' + id).find('iframe').fadeIn('fast');
		})
		
	} else {
		showMenu(id, val);

	}


}

function hideMenu(id) {
	$('#' + id).fadeOut('1000');
}

function showMenu(id,val) {
	$('#' + id).fadeIn('fast');
	if(val) {
		$('#' + id).find('select').val(val);
		//$('#' + id).find('iframe').fadeIn('slow');
	}
}

function add_marker_select_options(divItem, el, selVal) {
	var options = getOptions();


	var sel = $('<select />').attr('id', 'marker_select_box_' + mCount).attr('aria-required', 'true').appendTo(divItem);
	var d = $('<div />').addClass('marker marker_recommendation').attr('id', 'marker_select_text_div_' + mCount).appendTo(divItem);
	var a = $('<a />').addClass('marker-a11y-rec-a').attr('aria-expanded', 'true').attr('href', 'javascript:void(0);').click(function(e) {
		if($(this).attr('aria-expanded') === 'false') {
			$(this).parent().find('.marker_recommendation_div').show();
			$(this).attr('aria-expanded', 'true');
		} else {
			$(this).parent().find('.marker_recommendation_div').hide();
			$(this).find('.marker-a11y-rec-note').text('[ collapsed ]');
			$(this).attr('aria-expanded', 'false');
		}
		
	}).appendTo(d);
	var strong = $('<strong />').addClass('recommendations').text('Recommendation').css('display', 'none').appendTo(a);
	var span = $('<span />').addClass('marker-a11y-rec-note').appendTo(strong);
	$(options).each(function(i,v) {
		$('<option />').attr('value', v.Value).attr('data-marker-rec', v.Rec).text(v.QuickName).appendTo(sel);
	});

	$(sel).change(function() {
		var val = $(this).val();
		if(val === "") {
			$(strong).hide();
		} else {
			$(this).find('option').each(function(i,v) {
				if(val === $(v).attr('value')) {
					var recDiv = $('<div />').addClass('marker marker_recommendation_div').html($(v).attr('data-marker-rec'));
					$(strong).show();
					$(this).parent(0).parent().parent().find('.marker_ele_type').text($(v).text());
					$(this).parent().parent().find('.marker_recommendation_div').remove();
					$(this).parent().parent().find('.marker_recommendation').append(recDiv);
					return false;
				}
			});			
		}

		var h = $(divItem).height();
		var he = h + 95;
		$('.marker-context-menu-iframe-container:visible').css('height', he + 'px');
		$('.marker_context_menu:visible').css('height', he + 'px');		
	});
	var type = el.nodeName;
	var text = $(el).text();
	if(selVal) {
		$(sel).val(selVal);
		$(sel).change();
	}
	//console.log(type);
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


/****************************************
*	Function to save markings to PDF
*****************************************/
function saveToPdf() {
	$('#marker-results-ifr').remove();
	var modal = $('<div />').attr({
		'id': 'marker-print-modal',
		'class': 'marker'
	}).appendTo('body');

	var div = $('<div />').attr({
		'id': 'marker-print-dialog',
		'class': 'marker'
	}).html('Thanks for using Marker!  In this initial release, there\'s no true "Save" feature.<br />Please close this dialog and press  <kbd>Ctrl</kbd> + <kbd>S</kbd> to save this as a .html file<br /><br />').appendTo('body');

	
	
	var ifr = $('<iframe />').attr('id', 'marker-results-ifr').appendTo('body');
	var h = $('#marker-results-ifr')[0].contentWindow.document,
		bod = $(h).find('body');

	$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': chrome.extension.getURL('css/marker.css')
		}).appendTo($(h).find('head'));

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': chrome.extension.getURL('css/railway.css')
		}).appendTo($(h).find('head'));	

		$('<link />').attr({
			'rel': 'stylesheet',
			'type': 'text/css',
			'href': 'https://fonts.googleapis.com/css?family=Ubuntu'
		}).appendTo($(h).find('head'));			

	var res = $('<div />').addClass('marker-print-res-cont').appendTo(bod);

	var new_div = $('<ol />').addClass('marker-res').appendTo(res);

	$('.marker_context_menu').each(function(i,v) {
		var id = $(v).find('iframe').attr('id');
		var ifr = $('#' + id)[0].contentWindow.document,
			ifrBody = $(ifr).find('body');

		var seltext = $(ifrBody).find('select option:selected').text();
		var li = $('<li />').addClass('marker-a11y-res-list-type').appendTo(new_div);
		$('<div class="marker-res-type-issue" />').text(seltext).appendTo(li);
		var strongtext = $(ifrBody).find('.marker_recommendation_div').html();
		$('<strong class="recommendations" />').text('Recommendation').appendTo(li);
		$('<div />').html(strongtext).appendTo(li);
		//$(ifrBody).find('.marker_recommendation').clone().appendTo(li);
		var noteTa = $(ifrBody).find('textarea').val();
		if(noteTa !== "") {
			$('<div />').html('<strong class="recommendations">User notes</strong><span class="marker_user_note">' + noteTa + '</span></div>').appendTo(li);
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
	}).addClass('marker-btn').text('Ok!').appendTo(div);

	$(h).css('height', $(bod).height() + 'px');
}


/****************************************
*	Run accessibility tests
*****************************************/
function check_a11y() {
	test_anchors();
	test_images();
	test_html();
	if(issues.length > 0) {
		draw_results();
		$('#marker_a11y img').attr('src', chrome.extension.getURL('images/check_24_error.png'));
		$('#marker_a11y').attr('title', 'Accessibility Quick Check - '+issues.length+' issues detected!');

	} else {
		$('#marker_a11y img').attr('src', chrome.extension.getURL('images/check_24_pass.png'));
		$('#marker_a11y').attr('title', 'Accessibility Quick Check - No issues detected!');
	}
	
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
		$('#marker-control-panel').css('width', '210px');
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
	            $('#marker_draws').click();
	        } else {
	            console.log("begun.");
	            e.preventDefault();
	            mouse.startX = mouse.x;
	            mouse.startY = mouse.y;
	            element = document.createElement('div');
	            element.className = 'rectangle'
	            element.style.left = mouse.x + 'px';
	            element.style.top = mouse.y + 'px';
	            $(element).css('border-color', localStorage.getItem('box_color'));
	            $(element).css('border-width', localStorage.getItem('box_width') + 'px');
	            if(localStorage.getItem('box_bg_color') !== "") {
	            	$(element).css('background-color', localStorage.getItem('box_bg_color')).css('opacity', '.3');
	            }
	            canvas.appendChild(element)
	            //canvas.style.cursor = "crosshair";
	            $(element).draggable();
	        	$(element).resizable({
				  handles: "n, e, s, w, ne, nw, se, sw",
				  resize: function( event, ui ) {
				  	stop_drawing_boxes(document.getElementById('marker_body_wrap'));
					$('#place_marker').find('img').attr('src', chrome.extension.getURL('images/pin_24_inactive.png'));
					localStorage.setItem('marker_place_flag', 'false');	
					$('#marker-pin-colors-drawer').remove();		
					unplace_marker();				  	
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
	if($('#marker_window_resize_msg').length === 0) {
		var d = $('<div />').attr({
			'id': 'marker_window_resize_msg'
		}).appendTo('#marker_body_wrap');

		if(!val) {
			$(d).html('<strong>Alert!</strong> <span style="padding: 5px;">Resizing the window does not automatically readjust your markers on the page.  You may need to reposition them.<br /><br />  All markers and moveable and boxes are moveable and resizable.</span>');
		} else {
			$(d).html(text)
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
		var time = 6000;	
	} else {
		var time = 15000;
	}

	setTimeout(function() {
		$('#marker_window_resize_msg').slideUp('slow');
	}, time);	
	
}

function sendUpdate() {
	chrome.runtime.sendMessage({
		greeting: 'store',
		show_tips: localStorage.getItem('show_tips'),
		left: localStorage.getItem('left'),
		top: localStorage.getItem('top')
	});	
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

function stop_marker() {
	console.log('stop marker!');
	$('*').removeClass('marker_body_wrap marker-flagged-issue marker-highlight-text')
	$('#marker-control-panel, .marker_context_menu, .marker_page_marker, .rectangle').remove();
	mCount = 0;
	chrome.runtime.sendMessage({
		greeting: 'stop'
	});	
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if($('#marker-control-panel').length == 0) {
		localStorage.setItem('left', request.left);
		localStorage.setItem('top', request.top);
		localStorage.setItem('set', request.set);
		localStorage.setItem('box_color', request.box_color);
		localStorage.setItem('marker-font-size', request.marker_font_size);
		localStorage.setItem('flag-color', request.flag_color);
		localStorage.setItem('box_width', request.box_width);
		localStorage.setItem('first_time', request.first);
		localStorage.setItem('icon_pack_1', request.icon_pack_1);
		localStorage.setItem('highlight_color', request.highlight_color);
		localStorage.setItem('box_bg_color', request.box_bg_color);
		localStorage.setItem('pin_size', request.pin_size);
		localStorage.setItem('show_tips', request.show_tips);

		if(request.preset === '[]') {
			get_select_options();
		} else {
			localStorage.setItem('preset', request.preset);
		}
		

		run_marker(request.welcome);

		if(request.first === 'true') {
			console.log('first time running Marker after installation')
		}
	} else {
		stop_marker();
	}
});
