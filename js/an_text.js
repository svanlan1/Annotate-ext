function add_note() {
	$('#marker_body_wrap, #marker_body_wrap a, #marker_body_wrap button').bind('click', function(e) {
		var x = e.pageX,
			y = e.pageY,
			wid;
		var max = $(window).width() - 25;
		if(localStorage.getItem('font_size').split('p')[0] * 16 > max) {
			wid = "500px";
		} else {
			wid = localStorage.getItem('font_size').split('p')[0] * 16;
		}

		if(e.pageX + wid > max) {
			left = '100px'
		} else {
			left = e.pageX;
		}


		var div = $('<div />').resizable({
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
		}).css({
			'left': e.pageX,
			'top': e.pageY,
			'position': 'absolute',
			'height': localStorage.getItem('font_size').split('p')[0] * 2.8,
			'width': wid,
			'border': 'solid 1px ' + localStorage.getItem('font_outline')
		}).click(function() {
			$(this).addClass('marker_text_note_marker_selected');
		}).appendTo('body');

		var bg = localStorage.getItem('text_background'),
			opacity = parseInt(localStorage.getItem('text_bg_opacity')) * .01;
		$('<div />').css({
			'opacity': opacity,
			'background-color': bg,
			'display': 'block',
			'width': '100%',
			'height': '100%',
			'border': 'solid 1px #' + localStorage.getItem('font_outline')
		}).addClass('marker_bg_opaque').appendTo(div);		

		var t = $('<textarea />').attr({
			'id': 'marker_text_note_textarea_' + nCount,
			'tabindex': '-1',
			'class': 'marker_text_note_marker_textarea'
		}).css({
			'color': '#' + localStorage.getItem('font_color'),
			'font-size': localStorage.getItem('font_size'),
			'text-shadow': localStorage.getItem('text_shadow_color') + ' 1px 1px 2px',
			'min-height': '0 !important',
			'width': $(div).width() - 10 + 'px'
		}).appendTo('#marker_text_note_' + nCount).focus();

		$(t).attr('style', 'min-height: 0 !important;');

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
		stop_writing_text();

	});
}

function draw_text_options() {
		if($('#marker-box-text-drawer').length > 0) {
			$('#marker-box-text-drawer').slideDown('slow');
		} else {
			var div = $('<div />').attr('id', 'marker-box-text-drawer').appendTo('#marker-control-panel');
			
			var input_outline_option = document.createElement('INPUT');
			$(input_outline_option).attr('type', 'text');
			$(input_outline_option).attr('id', 'marker_text_outline_select').attr('style', 'z-index: 2147483635').addClass('jscolor').val(localStorage.getItem('font_outline'));
			var new_border_color = new jscolor(input_outline_option);

			var shadow_color_input = document.createElement('INPUT');
			$(shadow_color_input).attr('type', 'text');
			$(shadow_color_input).attr('id', 'marker_text_shadow_color').attr('style', 'z-index: 2147483635').addClass('jscolor').val(localStorage.getItem('text_shadow_color'));
			var new_shadow_color = new jscolor(shadow_color_input);	

			var input_color_input = document.createElement('INPUT');
			$(input_color_input).attr('type', 'text');
			$(input_color_input).attr('id', 'marker_text_color').attr('style', 'z-index: 2147483635').addClass('jscolor').val(localStorage.getItem('font_color'));
			var new_input_color = new jscolor(input_color_input);	

			var box_bg_color_input = document.createElement('INPUT');
			$(box_bg_color_input).attr('type', 'text');
			$(box_bg_color_input).attr('id', 'marker_text_box_bg_color').attr('style', 'z-index: 2147483635').addClass('jscolor').val(localStorage.getItem('text_background'));
			var new_box_bg = new jscolor(box_bg_color_input);						



			$('<strong />').addClass('marker').text('Change font size').css('width', '97%').appendTo(div);
			var text_div = $('<div />').css({
				'margin': '10px'
			}).appendTo(div);
			var sub = $('<a />').attr({
				'id': 'marker_sub_text_change'
			}).addClass('change_width change_font_size marker_anchor').html('<img src="' + chrome.extension.getURL('images/minus.png') + '" alt="Reduce font size by 1px" />').appendTo(text_div);
			var changeWid = $('<input />').attr({
				'type': 'text',
				'id': 'marker_text_font_size_input',
				'class': 'marker_box_width_select',
				'value': localStorage.getItem('font_size').split('p')[0]
			}).bind('mousewheel', function(e){
		        e.preventDefault();
		        if(e.originalEvent.wheelDelta /120 > 0) {
					localStorage.setItem('font_size', parseInt($(this).val()) + 1 + 'px');
					$(this).val(parseInt($(this).val()) + 1);				
		        }
		        else{
					localStorage.setItem('font_size', $(this).val() - 1 + 'px');
					$(this).val($(this).val() - 1);
		        }
		        sendUpdate();
		    }).appendTo(text_div);
			var add = $('<a />').attr({
				'id': 'marker_add_text_change'
			}).addClass('change_width change_font_size marker_anchor').html('<img src="' + chrome.extension.getURL('images/plus.png') + '" alt="Increase font-size by 1px" />').appendTo(text_div);
			
			var tcLabel = $('<label />').css({
				'font-weight': 'bold',
				'border-bottom': 'solid 1px #aaa',
				'margin-bottom': '5px',
				'padding-left': '5px',
				'display': 'block'
			}).attr('for', 'marker_text_color_select').addClass('marker').text('Text Color').css('width', '97%');

			var ocLabel = $('<label />').addClass('marker').css({
				'font-weight': 'bold',
				'border-bottom': 'solid 1px #aaa',
				'margin-bottom': '5px',
				'padding-left': '5px',
				'display': 'block'
			}).attr('for', 'marker_text_outline_select').html('Outline color').css('width', '97%');

			/*var ocChk = $('<input />').attr({
				'type': 'checkbox',
				'aria-label': 'Show outline color by default'
			}).prependTo(ocLabel);*/

			var scLabel = $('<label />').css({
				'font-weight': 'bold',
				'border-bottom': 'solid 1px #aaa',
				'margin-bottom': '5px',
				'padding-left': '5px'
			}).attr('for', 'marker_text_shadow_color').addClass('marker').text('Text-shadow Color').css('width', '97%');

			var bsLabel = $('<label />').css({
				'font-weight': 'bold',
				'border-bottom': 'solid 1px #aaa',
				'margin-bottom': '5px',
				'padding-left': '5px'
			}).attr('for', 'marker_text_box_bg_color').addClass('marker').text('Background color').css('width', '97%');			

			$(new_border_color).ready(function() {
				var font_cont_div = $('<div />');
				$(input_color_input).appendTo(font_cont_div);
				$(tcLabel).prependTo(font_cont_div);
				$(font_cont_div).appendTo(div);
			});

			$(new_shadow_color).ready(function() {
				var outline_div = $('<div />');
				$(shadow_color_input).appendTo(outline_div);
				$(scLabel).prependTo(outline_div);
				$(outline_div).appendTo(div);
			});				

			$(new_border_color).ready(function() {
				var outline_div = $('<div />');
				$(input_outline_option).appendTo(outline_div);
				$(ocLabel).prependTo(outline_div);
				$(outline_div).appendTo(div);
			});


			//Create Opacity change area on Annotate Panel
			$('<strong />').addClass('marker').text('Change background opacity').css('width', '97%').appendTo(div);
			var text_op_div = $('<div />').css({
				'margin': '10px'
			}).appendTo(div);
			var sub_op = $('<a />').attr({
				'id': 'marker_sub_op_change'
			}).addClass('change_width change_op marker_anchor').html('<img src="' + chrome.extension.getURL('images/minus.png') + '" alt="Reduce background opacity by .1%" />').appendTo(text_op_div);
			var change_op_input = $('<input />').attr({
				'type': 'text',
				'id': 'marker_text_change_opacity',
				'class': 'marker_box_width_select',
				'value': localStorage.getItem('text_bg_opacity').substring(0,3)
			}).bind('mousewheel', function(e){
		        e.preventDefault();
		        var val = parseFloat($(this).val());
		        if(e.originalEvent.wheelDelta /120 > 0) {
					if(val < 100) {
						val = val + 10;
						localStorage.setItem('text_bg_opacity', val);
					}				
		        }
		        else{
					if(val > 0) {
						val = val - 10;
						localStorage.setItem('text_bg_opacity', val);
					}
		        }
		        $(this).val(localStorage.getItem('text_bg_opacity'));
		        sendUpdate();
		    }).appendTo(text_op_div);
			var add_op = $('<a />').attr({
				'id': 'marker_add_op_change'
			}).addClass('change_width change_op marker_anchor').html('<img src="' + chrome.extension.getURL('images/plus.png') + '" alt="Increase background opacity by .1%" />').appendTo(text_op_div);			

			$(new_box_bg).ready(function() {
				var bg_div = $('<div />');
				$(box_bg_color_input).appendTo(bg_div);
				$(bsLabel).prependTo(bg_div);
				$(bg_div).appendTo(div);				
			});

			$('.change_font_size').click(function() {
				var val = $('#marker_text_font_size_input').val();
				if($(this).attr('id') === 'marker_sub_text_change') {
					val = val - 1;
				} else {
					val = parseInt(val) + 1;
				}
				$('#marker_text_font_size_input').val(val);
				localStorage.setItem('font_size', val + 'px');
				sendUpdate();
			});

			$('.change_op').click(function() {
				var val = parseFloat($(change_op_input).val());
				if($(this).attr('id') === 'marker_sub_op_change') {
					if(val > 0) {
						val = val - 10;
					}
					
				} else {
					if(val < 100) {
						val = val + 10;
					}
					
				}
				$(change_op_input).val(val);
				localStorage.setItem('text_bg_opacity', val);
				sendUpdate();

			})

			$(shadow_color_input).change(function(e) {
				localStorage.setItem('text_shadow_color', '#' + $(shadow_color_input).val());
				sendUpdate();
			});

			$(input_outline_option).change(function(e) {
				localStorage.setItem('font_outline', '#' + $(input_outline_option).val());
				sendUpdate();
			});

			$(input_color_input).change(function() {
				localStorage.setItem('font_color', '#' + $(input_color_input).val());
				sendUpdate();
			});

			$(box_bg_color_input).change(function() {
				localStorage.setItem('text_background', '#' + $(box_bg_color_input).val());
				sendUpdate();
			});
			$('.marker_anchor').attr('href', 'javascript:(0);');
			$(div).slideDown('slow');		
		}
}

function draw_textbox_options(el, counter) {
	var x = $(el).offset().left,
		y = $(el).offset().top;


	if($('#marker_note_hover_change_' + counter).length > 0) {
		var t = $('#marker_text_note_textarea_' + counter).offset().top,
			l = $('#marker_text_note_textarea_' + counter).offset().left;

		$('#marker_note_hover_change_' + counter).fadeIn('fast');
	} else {
		var container = $('<div />').attr({
			'id': 'marker_note_hover_change_' + counter,
			'class': 'marker_note_hover_change_div'
		}).appendTo('#marker_text_note_' + counter);

		$(container).fadeIn('slow');	

		//Change the color of the text in the text area
		var change_text_color = document.createElement('INPUT');
		$(change_text_color).attr('type', 'text');
		$(change_text_color).attr('style', 'z-index: 2147483635').attr('title', 'Change text color').addClass('jscolor marker_text_hover_color').val(localStorage.getItem('font_color'));
		$(change_text_color).change(function(e) {
			$(this).css('color', '#' + $(this).val());
			$(this).parent().parent().find('textarea').css('color', '#' + $(this).val());
		}).appendTo(container);
		var change_text_color_js = new jscolor(change_text_color);

		//Change the text size


		//Change the shadow color
		var change_shadow_color = document.createElement('INPUT');
		$(change_shadow_color).attr('type', 'text');
		$(change_shadow_color).attr('style', 'z-index: 2147483635').attr('title', 'Change shadow color').addClass('jscolor marker_text_hover_color').val(localStorage.getItem('text_shadow_color'));
		$(change_shadow_color).change(function(e) {
			$(this).css('color', '#' + $(this).val());
			$(this).parent().parent().find('textarea').css({
				'text-shadow': '#' + $(this).val() + ' 1px 1px 2px'
			});
		}).appendTo(container);
		var change_shadow_color_js = new jscolor(change_shadow_color);

		//Change the box background color
		var change_bg_color = document.createElement('INPUT');
		$(change_bg_color).attr('type', 'text');
		$(change_bg_color).attr('style', 'z-index: 2147483635').attr('title', 'Change background color').addClass('jscolor marker_text_hover_color').val(localStorage.getItem('text_background'));
		$(change_bg_color).change(function(e) {
			$(this).css('color', '#' + $(this).val());
			$(this).parent().parent().find('.marker_bg_opaque').css({
				'background-color': '#' + $(this).val()
			});
		}).appendTo(container);
		var change_bg_color_js = new jscolor(change_bg_color);		

		var shad_bord_boxes = $('<div />').addClass('marker_text_options_checkboxes').appendTo(container);
		var border_check = $('<input />').attr({
			'type': 'checkbox',
			'id': 'marker_text_options_show_border' + counter,
			'class': 'marker-text-checkbox',
			'checked': 'true'
		}).click(function() {
			var val = $(this).prop('checked');
			if(!val) {
				$(this).parent().parent().parent().css({
					'border': '0'
				})
			} else {
				$(this).parent().parent().parent().css({
					'border': 'solid 1px ' + localStorage.getItem('font_outline')
				});
			}
		}).appendTo(shad_bord_boxes);

		var border_lab = $('<label />').attr({
			'for': 'marker_text_options_show_border' + counter
		}).text('Show box border').appendTo(shad_bord_boxes);

		$('<br />').appendTo(shad_bord_boxes);

		var bg_check = $('<input />').attr({
			'type': 'checkbox',
			'id': 'marker_text_options_show_bg' + counter,
			'class': 'marker-text-checkbox',
			'checked': 'true'
		}).click(function() {
			var val = $(this).prop('checked');
			if(!val) {
				$(this).parent().parent().parent().find('.marker_bg_opaque').css({
					'background': 'none'
				})
			} else {
				$(this).parent().parent().parent().find('.marker_bg_opaque').css({
					'background-color': localStorage.getItem('text_background')
				});
			}
		}).appendTo(shad_bord_boxes);

		var bg_lab = $('<label />').attr({
			'for': 'marker_text_options_show_bg' + counter
		}).text('Show box background').appendTo(shad_bord_boxes);

		var font_select = $('<select />').addClass('ann-sel-text-option').appendTo(container);
		var op0 = $('<option />').attr({
			'value': 'Rock Salt, cursive'
		}).text('Rock Salt').appendTo(font_select);

		var op1 = $('<option />').attr({
			'value': 'Arial, sans-serif',
			'text': 'Arial'
		}).text('Arial').appendTo(font_select);

		var op2 = $('<option />').attr({
			'value': '"Calibri Light", sans-serif',
			'text': 'Calibri Light',
		}).text('Calibri Light').appendTo(font_select);

		var op3 = $('<option />').attr({
			'value': 'Segoe UI, sans-serif',
			'text': 'Segoe UI'
		}).text('Segoe UI').appendTo(font_select);

		var op4 = $('<option />').attr({
			'value': '"Architects Daughter" ,cursive',
		}).text('Architects Daughter').appendTo(font_select);

		$(font_select).change(function(e) {
			var style = $(this).parent().parent().find('textarea').attr('style');
			style += ' font-family:' + $(this).val() + ' !important;';
			$(this).parent().parent().find('textarea').attr('style', style);
		});

		//Change the box bg color
	}

}

function remove_textbox_options(el, counter) {
	$('#marker_note_hover_change_' + counter).fadeOut('slow');
}


function stop_writing_text() {
	$('#marker_body_wrap, #marker_body_wrap a, #marker_body_wrap button').unbind('click');
	$('#marker_body_wrap').css('cursor', '');
	//$('#marker_body_wrap').removeAttr('style');
	$('#marker_add_text img').attr('src', chrome.extension.getURL('images/add_text_24_inactive.png'));
	localStorage.setItem('addText', 'false');
	$('#marker-box-text-drawer').slideUp('fast');
}