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
		var x = e.pageX,
			y = e.pageY;
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
		'src': chrome.extension.getURL('images/pin_24_' + localStorage.getItem('flag-color') + '.png'),
		'class': 'marker_page_marker',
		'style': 'width: ' + localStorage.getItem('pin_size') + ';',
		'data-marker-count': mCount
	}).attr('alt', 'Marker ' + mCount).appendTo(flag_wrap);

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

/***********************************************
*	Create additional icon panels
*	Determine whether or not to show all icons,
*	or only the default workstation icons
************************************************/
function draw_new_marker_options() {
	$('#marker-pin-colors-drawer').remove();
	
	//Create additional icon panel
	var div = $('<div />').attr('id', 'marker-pin-colors-drawer').appendTo('#marker-control-panel');
	var iframe = create_iframe('marker-pin-colors-iframe', div);
	var ifbody = get_iframe_bod('marker-pin-colors-iframe');
	var ifhead = get_iframe_head('marker-pin-colors-iframe');

	//Add the CSS files to the results panel
	append_scripts_to_head('', ifhead);

	$('<strong />').addClass('marker').text('Select new pin').appendTo(ifbody);

	var default_icons = ['Red', 'Pink', 'Orange', 'Yellow', 'Plum', 'Blue', 'Aqua', 'Bluegreen', 'Green', 'Lime', 'Poop', 'Black', 'Grey', 'White', 'Placeholder_red', 'Placeholder_blue', 'Dot_red', 'Dot_blue', 'Dot_green', 'Dot_black'];
	$(default_icons).each(function(i,v) {
		$('<a />').attr('data-val', v.toLowerCase()).addClass('marker_option marker_anchor').html('<img src="' + chrome.extension.getURL('images/pin_24_'+v.toLowerCase()+'.png') + '" alt="'+v+' marker" />').appendTo(ifbody);
	});

	if(localStorage.getItem('icon_pack_1') === 'true') {
		var fun_icons = ['HTML', 'CSS', 'Scissors', 'Notepad', 'Brackets', 'Dung', 'Goldstar', 'Wrong', 'Happy', 'Laughing', 'Sad', 'Sick', 'Heart', 'Mag', 'Jason', 'Freddy'];
		$(fun_icons).each(function(i,v) {
			$('<a />').attr('data-val', v.toLowerCase()).addClass('marker_option marker_anchor').html('<img src="' + chrome.extension.getURL('images/pin_24_'+v.toLowerCase()+'.png') + '" alt="'+v+' marker" />').appendTo(ifbody);
		});
	} else {
		$('#marker-pin-colors-iframe').css('height', '235px');
	}


	$(ifbody).find('.marker_option img').css('width', '24px');

	$(ifbody).find('.marker_option img').each(function(i,v) {
		$(v).attr('title', $(v).attr('alt'));
	});

	$(ifbody).find('.marker_option').click(function() {
		localStorage.setItem('flag-color', $(this).attr('data-val'));
		$('#place_marker').find('img').css('width', '24px').attr('src', chrome.extension.getURL('images/pin_24_' + localStorage.getItem('flag-color') + '.png'));
	});

	$(ifbody).find('a.marker_anchor').attr('href', 'javascript:void(0);');

}