function loadIndex() {
	$.ajax({
		url: 'js/types.json',
		dataType: 'text',
		'type': 'GET',
		async: false,
		crossDomain: false,
		success: function(data) {
			options = $.parseJSON(data);
		}
	});

	$(options).each(function(i,v) {
		if(v.Value !== "") {
			var p = $('<p />').appendTo($('#marker_index_options'));
			$('<label />').addClass('marker_options_label').attr('for', v.Value).text(v.QuickName).appendTo(p);
			$('<textarea />').attr({
				'type': 'text',
				'id': $(v).Value,
				'class': 'marker_options_input'
			}).val(v.Rec).appendTo(p);			
		}

	});
}

$(document).ready(function() {
	loadIndex();
})
