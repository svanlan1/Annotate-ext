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

	//Wrap the original body element in a <DIV> and set the width appropriately
	var width = $(window).width() - 270 + 'px';
	$('body').wrapInner('<div id="marker_body_wrap" style="width:'+width+'; float:right;" />');
	//$('body').prepend('<div id="shim"></div>');

	//var marker_div_container = $('<div />').attr('id', 'marker_div_container').appendTo('html');
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

	$('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href': 'https://fonts.googleapis.com/css?family=Ubuntu'
	}).appendTo($(mif).find('head'));	

	$('<link />').attr({
		'rel': 'stylesheet',
		'type': 'text/css',
		'href': 'https://fonts.googleapis.com/css?family=Ubuntu'
	}).appendTo('head');		

	$('<h1 />').attr('class', 'marker').html('Marker <img src="' + chrome.extension.getURL('images/marker_32.png') + '" alt="" />').appendTo(mifBody);
	
	if(welcome === 'show') {
		var slideDiv = $('<div />').attr('id', 'marker_welcome_text').addClass('welcome').appendTo(mifBody);
		$('<a />').attr({
			'href': 'javascript:void(0);',
			'class': 'expand_collapse'
		}).html('<span class="collapse">Collapse tips</span>').click(function(e) {
			if($(this).find('.collapse').text() === "Collapse tips") {
				$(this).find('.collapse').text('Expand tips');
				$(slideDiv).find('.welcome').slideUp();
			} else {
				$(this).find('.collapse').text('Collapse tips');
				$(slideDiv).find('.welcome').slideDown();
			}
			
		}).appendTo(slideDiv);
		
		$('<input />').attr('type', 'checkbox').attr('id', 'dont_show_welcome').click(function() {
			chrome.runtime.sendMessage({
				greeting: 'welcome'
			});
			$(mifBody).find('.welcome').remove();
		}).appendTo(slideDiv);
		$('<label />').attr('for', 'dont_show_welcome').text('Never show this again').appendTo(slideDiv);
		
		$('<div />').attr({
			'class': 'marker welcome'
		}).text('a tool for making accessibility recommendations').appendTo(slideDiv);
		$('<div />').attr({
			'class': 'marker welcome'
		}).text('To begin, select an option below to either place a flag or select an area that you\'d like to confine your annotations to.').appendTo(slideDiv);	
		$('<div />').attr({
			'class': 'marker welcome'
		}).text('Once you place a flag, you will be able to choose what type of element you think it should be').appendTo(slideDiv);

		$('<div />').attr({
			'class': 'marker welcome'
		}).text('To add notes to or remove a flag, simply right click on it and choose your desired action').appendTo(slideDiv);	
	}


	//getStarted() will draw the rest of the contents in the <iframe>.  Separating them to keep functions small and light.
	getStarted();
	window.addEventListener("resize", resize_window);
	/*$(window).on('resize', function(e) {
		
	});	*/

}

function resize_window() {
	var winWidth = $(window).width() - 278;
		$('#marker_body_wrap').css('width', winWidth + 'px');
		if($('#marker_window_resize_msg').length === 0) {
			$('<div />').attr({
				'id': 'marker_window_resize_msg'
			}).html('<strong>Alert!</strong> <span style="padding: 5px;">Resizing the window does not automatically readjust your markers on the page.  You may need to reposition them (but don\'t worry, they\'re all totally draggable)</span>').appendTo('#marker_body_wrap').fadeIn('slow');

		} else {
			$('#marker_window_resize_msg').show();
		}
		setTimeout(function() {
			$('#marker_window_resize_msg').fadeOut('slow');
		}, 4000)	
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
		'class': 'marker_option',
		'title': 'Place markers on page'
	}).html('<img src="' + chrome.extension.getURL('images/pin_24_inactive.png') + '" alt="Click to place marker on page" />').click(function() {
		if(localStorage.getItem('marker_place_flag') == 'false') {
			$(mifBody).find('#marker_draws').find('img').attr('src', chrome.extension.getURL('images/select_24.png'));
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

	}).appendTo(marker_options_div);

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_draws',
		'class': 'marker_option',
		'title': 'Highlight an area of page'
	}).html('<img src="' + chrome.extension.getURL('images/select_24.png') + '" alt="Click to select a section of the page" />').appendTo(marker_options_div).click(function(e) {
		//alert('Select area of page functionality coming soon');
		//initDraw(document.getElementById('marker_body_wrap'));
		if(localStorage.getItem('draw') === 'false') {
			unplace_marker();
			localStorage.setItem('marker_place_flag', 'false');
			$(mifBody).find('#place_marker').find('img').attr('src', chrome.extension.getURL('images/pin_24_inactive.png'));
			
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

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_clear',
		'class': 'marker_option',
		'title': 'Clear and start over'
	}).html('<img src="' + chrome.extension.getURL('images/clear.png') + '" alt="Start Over" />').appendTo(marker_options_div).click(function(e) {
		$('.marker_page_marker, .marker_context_menu, .rectangle').remove();
		$(mifBody).find('.marker_side_text_selection').remove();
		mCount = 1;

	});

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_saves',
		'class': 'marker_option',
		'title': 'Save to PDF'
	}).html('<img src="' + chrome.extension.getURL('images/save_24.png') + '" alt="Save markings" />').appendTo(marker_options_div).click(function(e) {
		saveToPdf();
		//alert('Save to PDF functionality coming');
	});	

	$('<a />').attr({
		'href': 'javascript:void(0);',
		'id': 'marker_expand',
		'class': 'marker_option',
		'title': 'Collapse All'
	}).html('<img src="' + chrome.extension.getURL('images/collapse_24.png') + '" alt="Expand/Collapse All" />').appendTo(marker_options_div).click(function(e) {
		if(localStorage.getItem('e_c') === 'expanded') {
			$(mifBody).find('.marker_side_text_container').find('.marker_info').slideUp();
			$(mifBody).find('.marker_side_text_container').find('.collapse').text('Expand');
			$(this).attr('title', 'Expand All');
			$(this).find('img').attr('src', chrome.extension.getURL('images/expand_24.png'));
			localStorage.setItem('e_c', 'collapsed');			
		} else {
			$(mifBody).find('.marker_side_text_container').find('.marker_info').slideDown();
			$(mifBody).find('.marker_side_text_container').find('.collapse').text('Collapse');
			$(this).attr('title', 'Collapse All');
			$(this).find('img').attr('src', chrome.extension.getURL('images/collapse_24.png'));
			localStorage.setItem('e_c', 'expanded');		
		}

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
	$('#marker_body_wrap').css('cursor', 'pointer');
	$('#marker_body_wrap, a, button').bind('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var x = e.pageX - 50,
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

		//$('<div />').addClass('arrow-right').appendTo(flag_wrap);

		var m = $('<img />').attr({
			'src': chrome.extension.getURL('images/pin_24.png'),
			'class': 'marker_page_marker',
			'data-marker-count': mCount
		}).attr('alt', 'Marker ' + mCount).appendTo(flag_wrap);

		add_marker_text();

		mCount++;
		return false;
	});
}

function unplace_marker() {
	$('#marker_body_wrap, #marker_body_wrap a, #marker_body_wrap button').unbind('click');
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
		$('<button />').addClass('marker marker_fun_btn marker_save_note_btn').attr('value', 'Save Note').text('Save').click(function(e) {
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
	var h3 = $('<h3 />').text(mCount + ':').appendTo(divItem);
	$('<span />').addClass('marker_ele_type').appendTo(h3);	
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
	var d = $('<div />').addClass('marker marker_recommendation').attr('id', 'marker_select_text_div_' + mCount).html('<strong class="recommendations">Recommendations</strong>').appendTo(divItem);
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

function saveToPdf() {
	/*$('<iframe />').attr('id', 'results_iframe').appendTo('html');
	var x = $('#results_iframe')[0].contentWindow.document,
		xHead = $(x).find('head'),
		xBody = $(x).find('body');
	var pdfDiv = $('<div />').attr('id', 'marker_save_to_pdf');
	$(xHead).append($('head').html());
	$(pdfDiv).html($('body').html()).appendTo(xBody);
	$(pdfDiv).append($(mifBody).find('.marker_side_text_container'));*/
	var div = $('<div />').attr('id', 'marker_results_frame').appendTo('#marker_body_wrap');
	$(div).css('width', $(window).width() - 286 + 'px');

	var close = $('<a />').attr({
		'id': 'marker_results_close',
		'class': 'marker',
		'href': 'javascript:void(0)'
	}).html('<img src="' + chrome.extension.getURL('images/close.png') + '" alt="Close Results" />').css({
		'position': 'absolute',
		'top': '20px',
		'right': '10px',
		'display': 'block'
	}).click(function() {
		$(div).remove();
	}).appendTo(div);
	//$(div).html($('body').clone());
	$('#marker_body_wrap').find('img').each(function(i,v) {
		var url = getBase64Image(v);
		$(v).attr('src', url);
	})
	wrapUpResults(div);
	setTimeout(function() {

	}, 100);
	//$('#marker_body_wrap').append('<div id="body_shim"></div>');
}

function wrapUpResults(div) {
	var notes = $(mifBody).find('.marker_side_text_selection');
	$(notes).each(function(i,v) {
		var title = $(v).find('h3').text(),
			rec = $(v).find('.marker_recommendation').html(),
			notes = $(v).find('marker_user_note_side').html();

		$('<h2 />').addClass('marker').text(title).appendTo(div);
		$('<p />').addClass('marker instruction').html(rec).appendTo(div);
		$('<p />').addClass('marker instruction').html(notes).appendTo(div);
	});
}

function stop_marker() {
	console.log('stop marker!');
	$('*').removeClass('marker_body_wrap')
	$('#marker_iframe, .marker_context_menu, .marker_page_marker').remove();
	chrome.runtime.sendMessage({
		greeting: 'stop'
	});	
}


function initDraw(canvas) {
    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX - 270;
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

// Code taken from MatthewCrumley (http://stackoverflow.com/a/934925/298479)
function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to guess the
    // original format, but be aware the using "image/jpg" will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if($('#marker_iframe').length == 0) {
		run_marker(request.welcome);
	} else {
		stop_marker();
	}
});