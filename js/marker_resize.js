function show_window_resize_panel(div) {
	var panel = $('<div />').css({
		'position': 'absolute',
		'right': '5px',
		'top': '30px',
		'width': '80%',
		'height': '325px',
		'background-color': '#fff',
		'border': 'solid 2px #222',
		'box-shadow': '#666 2px 2px 4px',
		'display': 'none'
	}).attr('id', 'marker_window_resize_panel').appendTo(div);

	var sizeObj = $.parseJSON(localStorage.getItem('window_sizes'));
	for (var i in sizeObj) {
		var h = sizeObj[i].split('|')[1],
			w = sizeObj[i].split('|')[0],
			anchorText = i;

		var anchor = $('<a />').attr({
			'href': 'javascript:void(0)',
			'data-width': w,
			'data-height': h,
			'class': 'marker_window_resize_panel_anchor'
		}).text(anchorText).appendTo(panel);

		$(anchor).click(function() {
			var cur_h = $(window).height();
			var cur_w = $(window).width();
			var new_h = parseInt($(this).attr('data-height'));
			var new_w = parseInt($(this).attr('data-width'));

			var height = new_h - cur_h;
			var width = new_w - cur_w;

			//window.resizeBy(width, height);
			window.resizeTo(width, height);

			console.log('New height: ' + height);
			console.log('New width: ' + width);
		});
	}
	$(panel).slideDown('slow');
}

function hide_window_resize_panel() {
	$('#marker_window_resize_panel').slideUp('slow')
	setTimeout(function() {
		$('#marker_window_resize_panel').remove();
	}, 2000);
}