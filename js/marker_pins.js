/*************************************************************************************************
*	Filename: 	marker_pins.js
*	Author: 	Shea VanLaningham
*	Website: 	https://github.com/svanlan1/Marker
*	Purpose: 	This file controls the creation, placement, and removal of all pins on the page
*
**************************************************************************************************/

/***********************************************
*	Get the document ready to place a flag
************************************************/
function place_marker() {

	$('#marker_body_wrap').css('cursor', 'pointer');
	$('#marker_body_wrap, #marker_body_wrap a, #marker_body_wrap button').bind('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var x = e.pageX - 23,
			y = e.pageY - 22;
		place_ind_marker(x,y);

		return false;
	});
}

/***********************************************
*	Place the actual marker on the page
************************************************/
function place_ind_marker(x,y,val) {
	var flag_wrap = $('<a />').addClass('marker_page_marker marker_anchor').attr('data-marker-count', mCount).css({
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

	$('<img />').attr({
		'src': chrome.extension.getURL('images/pins/pin_24_' + localStorage.getItem('flag-color') + '.png'),
		'class': 'marker_page_marker',
		'style': 'width: ' + localStorage.getItem('pin_size') + ';',
		'data-marker-count': mCount
	}).attr('alt', 'Marker ' + mCount).appendTo(flag_wrap);

	if(localStorage.getItem('pin_size') === '48px') {
		$('a.marker_page_marker').css('width', '85px');
	}

	if(localStorage.getItem('rotate_marker') === 'true') {
		$(flag_wrap).find('img').addClass('marker_page_marker_rotate');
	}

	mCount++;	
}

/***********************************************
*	Remove all pins placed on the screen
************************************************/
function unplace_marker() {
	localStorage.setItem('marker_place_flag', 'false');	
	localStorage.setItem('rotate_marker', 'false');
	$('#marker_body_wrap, #marker_body_wrap a, #marker_body_wrap button').unbind('click');
	$('#marker-pin-colors-drawer').slideUp('slow');
	$('#marker_body_wrap').removeAttr('style');

}

/***********************************************
*	Create additional icon panels
*	Determine whether or not to show all icons,
*	or only the default workstation icons
************************************************/
function draw_new_marker_options() {
	//$('#marker-pin-colors-drawer').remove();
	
	//Create additional icon panel
	if($('#marker-pin-colors-drawer').length > 0) {
		$('#marker-pin-colors-drawer').slideDown('slow');
	} else {
		var div = $('<div />').attr('id', 'marker-pin-colors-drawer').appendTo('#marker-control-panel');
		var iframe = create_iframe('marker-pin-colors-iframe', div);
		var ifbody = get_iframe_bod('marker-pin-colors-iframe');
		var ifhead = get_iframe_head('marker-pin-colors-iframe');

		//Add the CSS files to the results panel
		append_scripts_to_head('', ifhead);

		$('<strong />').addClass('marker').text('Select new pin').appendTo(ifbody);

		var default_icons = JSON.parse(localStorage.getItem('default_icons'));// ['Red', 'Pink', 'Orange', 'Plum', 'Blue', 'Aqua', 'Bluegreen', 'Green', 'Lime', 'Yellow', 'Poop', 'Black', 'Grey', 'White', 'Placeholder_red', 'Placeholder_blue', 'Dot_red', 'Dot_blue', 'Dot_green', 'Dot_black'];
		$(default_icons).each(function(i,v) {
			$('<a />').attr('data-val', v.toLowerCase()).addClass('marker_option marker_anchor').html('<img src="' + chrome.extension.getURL('images/pins/pin_24_'+v.toLowerCase()+'.png') + '" alt="'+v+' marker" />').appendTo(ifbody);
		});

		if(localStorage.getItem('icon_pack_1') === 'true') {
			var fun_icons = JSON.parse(localStorage.getItem('fun_icons_1'));//['HTML', 'CSS', 'Scissors', 'Notepad', 'Brackets', 'Dung', 'Goldstar', 'Wrong', 'Happy', 'Laughing', 'Sad', 'Sick', 'Heart', 'Mag', 'Jason', 'Freddy'];
			$(fun_icons).each(function(i,v) {
				$('<a />').attr('data-val', v.toLowerCase()).addClass('marker_option marker_anchor').html('<img src="' + chrome.extension.getURL('images/pins/pin_24_'+v.toLowerCase()+'.png') + '" alt="'+v+' marker" />').appendTo(ifbody);
			});
		} else {
			$('#marker-pin-colors-iframe').css('height', '320px');
		}

		draw_pin_options(ifbody);

		$(ifbody).find('.marker_option img').css('width', '24px');

		$(ifbody).find('.marker_option img').each(function(i,v) {
			$(v).attr('title', $(v).attr('alt'));
		});

		$(ifbody).find('.marker_option').click(function() {
			localStorage.setItem('flag-color', $(this).attr('data-val'));
			$('#place_marker').find('img').css('width', '24px').attr('src', chrome.extension.getURL('images/pins/pin_24_' + localStorage.getItem('flag-color') + '.png'));
		});

		$(ifbody).find('a').attr('href', 'javascript:void(0);');
		$(div).slideDown('slow');
	}
}

function draw_pin_options(ifbody) {
	var in_val = localStorage.getItem('pin_size').split('p')[0];
	var s = $('<strong />').addClass('marker').css({
			'border-top': 'solid 1px #ccc',
			'padding-top': '5px',
			'padding-bottom': '5px'
		}).appendTo(ifbody);

	var opt_div = $('<div />').css('display', 'none').appendTo(ifbody);

	var lab_size = $('<label />').attr({
		'for': 'marker_size_option',
		'class': 'ubuntu marker_options_edit',
		'style': 'margin-left: 10px;'
	}).text('Pin size (pixels)').appendTo(opt_div);	



	var sub = $('<a />').attr({
		'id': 'marker_sub_pin_change'
	}).css('margin-left', '10px').addClass('change_width_pin marker_anchor').html('<img src="' + chrome.extension.getURL('images/minus.png') + '" alt="Reduce border width by 1px" />').appendTo(opt_div);

	var inp_size = $('<input />').attr({
		'id': 'marker_size_option',
		'type': 'text',
		'class': 'marker_box_width_select'
	}).css('width', '55px').change(function() {
		localStorage.setItem('pin_size', $(this).val() + 'px');
		sendUpdate();
	}).val(in_val).appendTo(opt_div);

	var add = $('<a />').attr({
		'id': 'marker_add_pin_change'
	}).addClass('change_width_pin marker_anchor').html('<img src="' + chrome.extension.getURL('images/plus.png') + '" alt="Increase border width by 1px" />').appendTo(opt_div);



	$('<div class="clear-line" />').appendTo(opt_div);	

	var inp = $('<input />').attr({
		'id': 'marker_flip_option',
		'type': 'checkbox',
		'class': 'marker_box_width_select'
	}).css({
		'height': '20px',
	    'line-height': '10px',
	    'box-shadow': '#ccc 0 1px 6px inset',
	    'width': '20px',
	    'margin-left': '10px'
	}).change(function() {
		if($(this).prop('checked') === true) {
			localStorage.setItem('rotate_marker', 'true');
			$('.marker_page_marker_' + mCount - 1).find('img').addClass('marker_page_marker_rotate');
			$(ifbody).find('img').addClass('marker_page_marker_rotate');
		} else {
			localStorage.setItem('rotate_marker', 'false');
			$(ifbody).find('img').removeClass('marker_page_marker_rotate');
		}
	}).appendTo(opt_div);

	var lab = $('<label />').attr({
		'for': 'marker_flip_option',
		'class': 'ubuntu marker_options_edit',
		'style': 'display: inline; margin-left: 5px;'
	}).text('Flip horizontally').appendTo(opt_div);

	$('<a />').text('Options').css({
		'color': '#000',
		'text-decoration': 'none'
	}).click(function() {
		if($(opt_div).css('display') === 'none') {
			if(localStorage.getItem('icon_pack_1') === 'true') {
				$('#marker-pin-colors-iframe').css('height', '580px');
			} else {
				$('#marker-pin-colors-iframe').css('height', '420px');
			}
			
			$(opt_div).fadeIn('fast');
			$('<span />').addClass('marker_collapse_1').text(' - click to collapse').appendTo($(this));
			
		} else {
			$(opt_div).css('display', 'none');
			$(this).find('.marker_collapse_1').remove();
			
			if(localStorage.getItem('icon_pack_1') === 'true') {
				$('#marker-pin-colors-iframe').css('height', '465px');
			} else {
				$('#marker-pin-colors-iframe').css('height', '320px');
			}				
			
		}
	}).appendTo(s);	

	$(opt_div).find('.change_width_pin').click(function() {
		var val = $(inp_size).val();
		if($(this).attr('id') === 'marker_sub_pin_change') {
			val = val - 1;
		} else {
			val = parseInt(val) + 1;
		}
		$(inp_size).val(val);
		localStorage.setItem('pin_size', val + 'px');	
		sendUpdate();	
	})	
}