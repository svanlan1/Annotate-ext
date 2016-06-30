/*************************************************************************************************
*	Filename: 	marker_box.js
*	Author: 	Shea VanLaningham
*	Website: 	https://github.com/svanlan1/Marker
*	Purpose: 	This file controls the creation, placement, and removal of all boxes on the page
*
**************************************************************************************************/

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
	            //canvas.style.cursor = "crosshair";
	        }
	    };

	    canvas.onclick = function (e) {
	        if (element !== null) {
	            element = null;
	            $('#marker_draws').click();
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
	            	//$(element).css('background-color', localStorage.getItem('box_bg_color')).css('opacity', '.3');
	            	$('<div />').css({
	            		'width': '100%',
	            		'height': '100%',
	            		'display': 'block',
	            		'background-color': localStorage.getItem('box_bg_color'),
	            		'opacity': '.2'
	            	}).appendTo(element);

	            }
	            canvas.appendChild(element);
	            //canvas.style.cursor = "crosshair";
	            $(element).draggable();
	        	$(element).resizable({
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
    $('#marker-box-colors-drawer').slideUp('slow');
}

function draw_select_color_options() {
		if($('#marker-box-colors-drawer').length > 0) {
			$('#marker-box-colors-drawer').slideDown('slow');
		} else {
			var div = $('<div />').attr('id', 'marker-box-colors-drawer').appendTo('#marker-control-panel');

			$('<strong />').addClass('marker').text('Change box width').appendTo(div);
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
			}).appendTo(widDiv);
			var add = $('<a />').attr({
				'id': 'marker_add_box_change'
			}).addClass('change_width marker_anchor').html('<img src="' + chrome.extension.getURL('images/plus.png') + '" alt="Increase border width by 1px" />').appendTo(widDiv);

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
			$('.marker_anchor').attr('href', 'javascript:(0);');
			$(div).slideDown('slow');		
		}

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