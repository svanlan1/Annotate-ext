var user_submitted = 0;
function loadIndex() {
	var def_ic = $.parseJSON(localStorage.getItem('default_icons')),
		fun_ic = $.parseJSON(localStorage.getItem('fun_icons_1'));


    if(localStorage.getItem('userID') === "" || localStorage.getItem('userID') === 'undefined' || !localStorage.getItem('userID')) {
     $('#login_area').show();
      $('#login_button').click(function(e) {
       
		chrome.runtime.sendMessage({
			greeting: 'login', data: {userEmail: $('#username').val(), userPass: $('#password').val()}
		});	

      });
    } else {
    	//$('#login_area').html('<h2 class="pretty">Welcome ' + localStorage.getItem('user') + '</h2>');
    	//$('#login_button').hide();
    	$('#login_area').remove();
    	$('#ann-log-msg').text('Welcome ' + localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'));
    }


    /********************************************************************************************************************************
    *
    *	SET UP EVENT HANDLERS
    *
    ********************************************************************************************************************************/
	$('.change_width').click(function() {
		//var val = $('#marker_select_border_width').val();
		var val = $(this).parent().find('input').val();
		if($(this).hasClass('subtract')) {
			val = val - 1;
		} else {
			val = parseInt(val) + 1;
		}
		
		if($(this).parent().find('input').attr('id') === 'marker_select_border_width') {
			localStorage.setItem('box_width', val);
			$('.border_width_example').css({
				'border': localStorage.getItem('box_width') + 'px solid ' +localStorage.getItem('box_color')
			});			
		} else {
			$('#default_pin').css('width', val + 'px');
			localStorage.setItem('pin_size', val + 'px');
		}

		$(this).parent().find('input').val(val);
		showAlert();
		
	});	

	
	$('#' + localStorage.getItem('set')).prop('checked', 'true');
	$('#marker_text_size').val(localStorage.getItem('marker-font-size'));
	$('#marker_select_border_color').val(localStorage.getItem('box_color'));
	$('#marker_select_border_width').val(localStorage.getItem('box_width'));
	$('#marker_select_box_background').val(localStorage.getItem('box_bg_color'));
	$('#marker_username').val(localStorage.getItem('user'));
	
	$('#marker_select_pin_width').val(localStorage.getItem('pin_size').split('p')[0]);
	$('#marker_select_highlight_color').val(localStorage.getItem('highlight_color'));
	$('.border_width_example').css({
		'border': localStorage.getItem('box_width') + 'px solid ' +localStorage.getItem('box_color')
	});	

	$(def_ic).each(function(i,v) {
		$('<a />').attr({
			'id': v.toLowerCase() + '_button',
			'data-val': v.toLowerCase(),
			'href': 'javascript:void(0);'
		}).html('<img src="' + chrome.extension.getURL('images/pins/pin_24_'+v.toLowerCase()+'.png') + '" alt="'+v+' marker" />').appendTo('.default_markers');
	});

	$('#' + localStorage.getItem('flag-color') + '_button').addClass('marker-flag-selected');
	$('#default_pin').attr('src', 'images/pins/pin_24_' + localStorage.getItem('flag-color') + '.png').css('width', localStorage.getItem('pin_size'));


	

	$('#marker_username').change(function() {
		localStorage.setItem('user', $(this).val());
	});
}

function loadOptions() {

	if(!localStorage.getItem('set') || localStorage.getItem('set') === 'a11y') {
		if(!localStorage.getItem('a11y_preset')) {
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
		} else {
			options = $.parseJSON(localStorage.getItem('a11y_preset'));
		}
	
	} else if (localStorage.getItem('set') === 'html') {
		if(!localStorage.getItem('html_preset')) {
			$.ajax({
				url: 'js/html_types.json',
				dataType: 'text',
				'type': 'GET',
				async: false,
				crossDomain: false,
				success: function(data) {
					options = $.parseJSON(data);
				}
			});			
		} else {
			options = $.parseJSON(localStorage.getItem('html_preset'));
		}

	} else {
		options = [];
	}


	$(options).each(function(i,v) {
		var p = $('<p />').appendTo($('#marker_index_options'));
		var a = $('<a />').attr({
			'href': 'javascript:void(0);',
			'class': 'marker_options_label_anchor',
			'aria-expanded': 'false'
		}).click(function() {
			var id = $(this).find('span').attr('data-for');
			$('.marker_options_input, .marker_preset_save_btn').hide();
			if($(this).attr('aria-expanded') === 'false') {
				$('#' + id).show();
				$('#marker_index_options p').find('input, textarea, button, label').css('display', 'none');
				$(this).parent().find('input, textarea, button, a, label').css('display', 'block');
				$(this).attr('aria-expanded', 'true');
			} else {
				$('#' + id).hide();
				$(this).parent().find('input, textarea, label, button, .marker-remove-rec-link, label').css('display', 'none');
				$(this).attr('aria-expanded', 'false');
			}
			
		}).appendTo(p);	

		$('<span />').addClass('marker_options_label').attr('data-for', 'marker_options_' + i + '_' + i).text(v.QuickName).appendTo(a);
		for (var x in v) {
			
			var field_label = $('<label />').addClass('input-label').attr('for', 'marker_options_' + x + '_' + i).text(x).appendTo(p);
			if(x === 'Value') {
				$('<input />').attr({
					'id': 'marker_options_' + x + '_' + i,
					'aria-label': x.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
					'class': 'marker_options_input marker'
				}).val(v[x].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<br \/>/g, '\n')).appendTo(p);					
			} else {
				$('<textarea />').attr({
					'id': 'marker_options_' + x + '_' + i,
					'aria-label': x.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
					'class': 'marker_options_input marker',
					'data-type': x
				}).val(v[x].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<br \/>/g, '\n')).appendTo(p);	

							
			}
		}

		$('<button />').attr('id', 'marker_save_btn_' + i).addClass('marker_preset_save_btn').text('Save').click(function() {
			savePresets();
		}).appendTo(p);
		$('<button />').addClass('marker-remove-rec-link marker_preset_save_btn').attr('href', 'javascript:void(0);').css('display', 'none').text('*Remove this recommendation*').click(function() {
			var tempDiv = $('<div />').text('Are you sure you want to remove this recommendation?  It\'s permanent.' ).addClass('marker-save-msg').prependTo('body');
			var butDiv = $('<div />').css('margin-top', '15px').appendTo(tempDiv);
			$('<button />').css('margin-left', '15%').addClass('marker_fun_btn marker_save_note_btn').text('Yes').click(function() {
				$(p).remove();
				$(tempDiv).remove();
				$('#marker-print-modal').remove();
				savePresets();
			}).appendTo(butDiv);
			$('<button />').addClass('marker_fun_btn').text('No').click(function() {
				$(tempDiv).remove();
				$('#marker-print-modal').remove();
			}).appendTo(butDiv);

			$('<div />').attr('id', 'marker-print-modal').css('background-color', '#eee').appendTo('body');
		}).appendTo(p);
	});	

	
}

function savePresets() {
		var obj = [];
		var new_obj = {};
		$('#marker_index_options p').each(function(i,v) {
			var new_obj = {};

			if($(v).find('input').attr('data-val')) {
				new_obj.Value = $(v).find('input').attr('data-val').toLowerCase();
			} else {
				new_obj.Value = $(v).find('input').val();
			}
			
			
			var rec = $(v).find('textarea[data-type=Recommendation]').val();
			new_obj.QuickName = $(v).find('textarea[data-type=QuickName]').val();
			new_obj.Recommendation = rec.replace(/\n/g, '<br />');
			new_obj.Example = $(v).find('textarea[data-type=Example]').val();
			obj.push(new_obj);
			
		});
		var preset = JSON.stringify(obj);
		if(localStorage.getItem('set') === 'a11y') {
			localStorage.setItem('a11y_preset', preset);
			localStorage.setItem('preset', preset);
		} else if (localStorage.getItem('set') === 'html') {
			localStorage.setItem('html_preset', preset);
			localStorage.setItem('preset', preset);
		}

		

		/*var msg = $('<div />').attr({
			'class': 'marker marker-save-msg'
		}).text('Saved!').appendTo('body');*/
		//$('<div />').attr('id', 'marker-print-modal').css('background-color', '#eee').appendTo('body');
		localStorage.setItem('marker-font-size', $('#marker_text_size').val());
		localStorage.setItem('box_color', '#' + $('#marker_select_border_color').val());
		localStorage.setItem('box_width', $('#marker_select_border_width').val());
		showAlert();

		/*setTimeout(function() {
			$('.marker-save-msg, #marker-print-modal').fadeOut('fast');
		}, 2000);*/
}

function showAlert() {
		$('.alert').show();
		setTimeout(function() {
			$('.alert').fadeOut('slow');
		}, 15000);	
}

function resetPresets() {
	$.ajax({
		url: 'js/html_types.json',
		dataType: 'text',
		'type': 'GET',
		async: false,
		crossDomain: false,
		success: function(data) {
			localStorage.setItem('html_preset', data)
		}
	});	

	$.ajax({
		url: 'js/types.json',
		dataType: 'text',
		'type': 'GET',
		async: false,
		crossDomain: false,
		success: function(data) {
			localStorage.setItem('a11y_preset', data);
		}
	});	

	localStorage.setItem('set', 'a11y');
	localStorage.setItem('preset', localStorage.getItem('a11y_preset'));
	
}

function css(a) {
    var sheets = document.styleSheets, o = {};
    for (var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        for (var r in rules) {
            if (a.is(rules[r].selectorText)) {
                o = $.extend(o, css2json(rules[r].style), css2json(a.attr('style')));
            }
        }
    }
    return o;
}

function css2json(css) {
    var s = {};
    if (!css) return s;
    if (css instanceof CSSStyleDeclaration) {
        for (var i in css) {
            if ((css[i]).toLowerCase) {
                s[(css[i]).toLowerCase()] = (css[css[i]]);
            }
        }
    } else if (typeof css == "string") {
        css = css.split("; ");
        for (var i in css) {
            var l = css[i].split(": ");
            s[l[0].toLowerCase()] = (l[1]);
        }
    }
    return s;
}

$(document).ready(function() {
	loadIndex();
	loadOptions();
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.greeting === 'hide_login') {
			$('#login_area').remove();
	    	$('#ann-log-msg').text('Welcome ' + localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'));
		}
	});
