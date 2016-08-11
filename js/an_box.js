/*************************************************************************************************
*	Filename: 	marker_box.js
*	Author: 	Shea VanLaningham
*	Website: 	https://github.com/svanlan1/annotate
*	Purpose: 	This file controls the creation, placement, and removal of all boxes on the page
*	
*	function initDraw(canvas) credit to Spencer Lockhart
*	http://stackoverflow.com/questions/17408010/drawing-a-rectangle-using-click-mouse-move-and-click
**************************************************************************************************/

function initDraw(canvas) {
    function setMousePosition(e) {
        var ev = e || window.event;
        if (ev.pageX) {
            mouse.x = ev.pageX;
            mouse.y = ev.pageY;
        } else if (ev.clientX) {
            mouse.x = ev.clientX + document.body.scrollLeft;
            mouse.y = ev.clientY + document.body.scrollTop;
        }
    }

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
	        }
	    };

	    canvas.onclick = function (e) {
	        if (element !== null) {
	            //update_marker_page_obj('box',$(element).offset().left, $(element).offset().top, $(element).width(), $(element).height());
	            element = null;
	            $('#marker_draws').click();
		    	$('.rectangle').bind('contextmenu',function(e) {
		    		e.preventDefault();
		    		$(this).remove();
		    	});	            
	        } else {
	            e.preventDefault();
	            mouse.startX = mouse.x;
	            mouse.startY = mouse.y;
	            element = document.createElement('div');
	            element.className = 'rectangle';
	            element.style.left = mouse.x + 'px';
	            element.style.top = mouse.y + 'px';
	            $(element).css('border-color', localStorage.getItem('box_color'));
	            $(element).css('border-width', localStorage.getItem('box_width') + 'px');
	            if(localStorage.getItem('box_bg_color') !== "") {
	            	$('<div />').css({
	            		'width': '100%',
	            		'height': '100%',
	            		'display': 'block',
	            		'background-color': localStorage.getItem('box_bg_color'),
	            		'opacity': '.2'
	            	}).appendTo(element);
	            }
	            canvas.appendChild(element);
	            $(element).draggable();
	        	$(element).resizable({
				  containment: "parent",
				  handles: "n, e, s, w, ne, nw, se, sw",
				  resize: function( event, ui ) {
				  	stop_drawing_boxes(document.getElementById('ann_body_wrap'));
					$('#place_marker').find('img').attr('src', chrome.extension.getURL('images/pins/pin_24_inactive.png'));
					localStorage.setItem('marker_place_flag', 'false');	
					$('#annotate-pin-colors-drawer').remove();		
					unplace_marker();				  	
				  },
				  stop: function (event, ui ) {
				  	initDraw(document.getElementById('ann_body_wrap'));
				  }
				}); 
				return false;          
	        }
	    };    	
    }

}

function stop_drawing_boxes(canvas) {
    canvas.onmousemove = function (e) {
       
    };

    canvas.onclick = function (e) {

    };
    $('#annotate-box-colors-drawer').slideUp('fast');
    $('#ann_body_wrap').css('cursor', '');
}

function draw_select_color_options() {
	if($('#annotate-box-colors-drawer').length > 0) {
		$('#annotate-box-colors-drawer').slideDown('slow');
	} else {
		var div = $('<div />').attr('id', 'annotate-box-colors-drawer').appendTo('#annotate-control-panel');

		$('<strong />').addClass('annotate').text('Change box width').appendTo(div);
		var widDiv = $('<div />').css({
			'margin': '10px'
		}).appendTo(div);
		var sub = $('<a />').attr({
			'id': 'marker_sub_box_change'
		}).addClass('change_width marker_anchor').html('<img src="' + chrome.extension.getURL('images/minus.png') + '" alt="Reduce border width by 1px" />').appendTo(widDiv);
		var changeWid = $('<input />').attr({
			'type': 'text',
			'class': 'marker_box_width_select',
			'value': localStorage.getItem('box_width')
		}).bind('mousewheel', function(e){
	        e.preventDefault();
	        if(e.originalEvent.wheelDelta /120 > 0) {
				localStorage.setItem('box_width', parseInt($(this).val()) + 1);
				$(this).val(parseInt($(this).val()) + 1);				
	        }
	        else{
				localStorage.setItem('box_width', $(this).val() - 1);
				$(this).val($(this).val() - 1);
	        }
	    }).appendTo(widDiv);
		var add = $('<a />').attr({
			'id': 'marker_add_box_change'
		}).addClass('change_width marker_anchor').html('<img src="' + chrome.extension.getURL('images/plus.png') + '" alt="Increase border width by 1px" />').appendTo(widDiv);

		var input = document.createElement('INPUT');
		$(input).attr('type', 'text');
		$(input).attr('id', 'marker_color_select').attr('style', 'z-index: 2147483635').addClass('jscolor').val(localStorage.getItem('box_color').substring(1, localStorage.getItem('box_color').length));
		var picker = new jscolor(input);

		var box_bg_color_input = document.createElement('INPUT');
		$(box_bg_color_input).attr('type', 'text');
		$(box_bg_color_input).attr('id', 'marker_bg_color_select').attr('style', 'z-index: 2147483635').addClass('jscolor').val(localStorage.getItem('box_bg_color').substring(1, localStorage.getItem('box_bg_color').length));
		var box_bg_picker = new jscolor(box_bg_color_input);

		
		
		$('.change_width').click(function() {
			var val = $('.marker_box_width_select').val();
			if($(this).attr('id') === 'marker_sub_box_change') {
				val = val - 1;
			} else {
				val = parseInt(val) + 1;
			}
			$('.marker_box_width_select').val(val);
			localStorage.setItem('box_width', val);
			sendUpdate();
		});

		var boxLabel = $('<label />').css({
			'font-weight': 'bold',
			'border-bottom': 'solid 1px #aaa',
			'margin-bottom': '5px',
			'padding-left': '5px',
			'display': 'block'
		}).attr('for', 'marker_color_select').addClass('annotate').text('Box color').css('width', '97%');	

		var boxBgLabel = $('<label />').css({
			'font-weight': 'bold',
			'border-bottom': 'solid 1px #aaa',
			'margin-bottom': '5px',
			'padding-left': '5px',
			'display': 'block'
		}).attr('for', 'marker_bg_color_select').addClass('annotate').text('Box background color').css('width', '97%');						

		$(box_bg_picker).ready(function() {
			var box_bg_div = $('<div />');
			$(box_bg_color_input).appendTo(box_bg_div);
			$(boxBgLabel).prependTo(box_bg_div);
			$(box_bg_div).appendTo(div);
		});			

		$(picker).ready(function() {
			var box_div = $('<div />');
			$(input).appendTo(box_div);
			$(boxLabel).prependTo(box_div);
			$(box_div).appendTo(div);
		});	

		$('#marker_color_select').change(function() {
			localStorage.setItem('box_color', '#' + $('#marker_color_select').val());
			sendUpdate();
		}).appendTo(div);

		$(box_bg_color_input).change(function() {
			localStorage.setItem('box_bg_color', '#' + $(box_bg_color_input).val());
			sendUpdate();
		});


		$('.marker_anchor').attr('href', 'javascript:(0);');
		$(div).slideDown('slow');		
	}

}

function draw_highlight_color_options() {
	$('#annotate-pin-colors-drawer').remove();
	var div = $('<div />').attr('id', 'annotate-pin-colors-drawer').appendTo('#annotate-control-panel');

	$('<strong />').addClass('annotate').text('Change box color').appendTo(div);
	var input = document.createElement('INPUT');
	$(input).attr('type', 'text');
	$(input).attr('id', 'marker_color_select').addClass('jscolor').val(localStorage.getItem('highlight_color').substring(1, localStorage.getItem('highlight_color').length)).appendTo(div);
	var picker = new jscolor(input);

	$('#marker_color_select').change(function() {
		localStorage.setItem('highlight_color', '#' + $('#marker_color_select').val());
	}).appendTo(div);
}