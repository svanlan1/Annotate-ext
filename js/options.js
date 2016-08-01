var user_submitted = 0;
function loadIndex() {
	
	
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

	$('input[data-val=' + localStorage.getItem('pin_size') + ']').prop('checked', true);

	var style = css($(".marker-res-type-issue"));
	if(!localStorage.getItem('head-style')) {

	}
	//$("#heading_style_current").css(style);
	for(var i in style) {
		var li = $('<li />').html('<span class="css-prop">' + i + '</span>: <span class="css-val">' + style[i] + '</span>').appendTo('#heading_style_current ul');
	}

	var def_ic = $.parseJSON(localStorage.getItem('default_icons')),
		fun_ic = $.parseJSON(localStorage.getItem('fun_icons_1'));

	$(def_ic).each(function(i,v) {
		$('<a />').attr({
			'id': v.toLowerCase() + '_button',
			'data-val': v.toLowerCase(),
			'href': 'javascript:void(0);'
		}).html('<img src="' + chrome.extension.getURL('images/pins/pin_24_'+v.toLowerCase()+'.png') + '" alt="'+v+' marker" />').appendTo('.default_markers');
	});

	$('#' + localStorage.getItem('flag-color') + '_button').addClass('marker-flag-selected');
	$('#default_pin').attr('src', 'images/pins/pin_24_' + localStorage.getItem('flag-color') + '.png').css('width', localStorage.getItem('pin_size'));


	if(localStorage.getItem('use_bg') === 'true') {
		$('#box_bg_color_chk').prop('checked', true);
		$('.bg_color_show_hide').show();
		$('.border_width_example div').css({
			'background-color': localStorage.getItem('box_bg_color'),
			'opacity': '.3'
		});
	} else {
		$('#box_bg_color_chk').prop('checked', false);
		$('.border_width_example').css({
			'background-color': 'none',
			'opacity': '1.0'
		});
	}

	if(localStorage.getItem('show_tips') === 'true') {
		$('#show_tips-chk').prop('checked', true);
	}

	$('#show_tips-chk').change(function() {
		if($(this).prop('checked') === true) {
			localStorage.setItem('show_tips', 'true')
		} else {
			localStorage.setItem('show_tips', 'false');
		}
	})

	$('#box_bg_color_chk').click(function() {
		if($('.bg_color_show_hide').css('display') === 'none') {
			$('.bg_color_show_hide').show();
			localStorage.setItem('use_bg', 'true');
		} else {
			$('.bg_color_show_hide').hide();
			localStorage.setItem('use_bg', 'false');
			localStorage.setItem('box_bg_color', '');
		}
	});

	$('.default_options_a').click(function() {
		$('.default_group_toggle').slideUp('fast').attr('aria-expanded', 'false');
		$('*').removeClass('options_a_selected');
		if($(this).attr('aria-expanded') === 'false') {
			$('.default_options_a[aria-expanded=true]').attr('aria-expanded', 'false');
			$(this).parent().next().slideDown('fast');
			$(this).attr('aria-expanded', 'true');
			$(this).addClass('options_a_selected');
		} else {
			$(this).parent().next().slideUp('slow');
			$(this).attr('aria-expanded', 'false');
		}
		
	});

	$('#change_rec_style').click(function() {
		if($(this).attr('aria-expanded') === 'false') {
			$('.default_options_a[aria-expanded=true]').attr('aria-expanded', 'false');
			$('#change_rec_style_div').slideDown('fast');
			$(this).attr('aria-expanded', 'true');
		} else {
			$('#change_rec_style_div').slideUp('slow');
			$(this).attr('aria-expanded', 'false');
		}
		
	});	

	$('#login_button').click(function() {
		get_login_info();		
	});

	

	$('input[name=pin_size]').click(function() {
		localStorage.setItem('pin_size', $(this).attr('data-val'));
	});

	if(localStorage.getItem('icon_pack_1') === 'true') {
		var icon_val = true;
	} else {
		var icon_val = false;
	}

	$('#icon_pack_1').prop('checked', icon_val).click(function() {
		if($(this).prop('checked') === true) {
			localStorage.setItem('icon_pack_1', 'true');
		} else {
			localStorage.setItem('icon_pack_1', 'false');
		}
	});


	$('#def_ops, #change_recs, #show_faq, #os_ops').click(function() {
		$('.split').hide();
		//if($(this).attr('aria-expanded') === 'false') {
			$('.tabs a').attr('aria-expanded', 'false');
			$('*').removeClass('tab-selected');
			$('#' + $(this).attr('aria-controls')).show();
			$(this).attr('aria-expanded', 'true');
			$(this).addClass('tab-selected');
		//} else {
			//$('#' + $(this).attr('aria-controls')).hide();
			//$(this).attr('aria-expanded', 'false');
		//}
	});

	$('.default_markers a').click(function(e) {
		$('*').removeClass('marker-flag-selected');
		$(this).addClass('marker-flag-selected');
		localStorage.setItem('flag-color', $(this).attr('data-val'));
		$('#default_pin').attr('src', 'images/pins/pin_24_' + localStorage.getItem('flag-color') + '.png').css('width', localStorage.getItem('pin_size'));
		savePresets();
	});

	$('#a11y').click(function() {
		localStorage.setItem('set', 'a11y');
		$('#marker_index_options').html('');
		loadOptions();
		savePresets();
	});

	$('#html').click(function(e) {
		localStorage.setItem('set', 'html');
		$('#marker_index_options').html('');
		loadOptions();
		savePresets();
	});

	$('#blank').click(function() {
		localStorage.setItem('set', 'blank');
		savePresets();
	});

	$('.marker_preset_reset_btn').click(function() {
		resetPresets();
		location.reload();
	});

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

	$('#marker_select_pin_width').change(function() {
		localStorage.setItem('pin_size', $(this).val() + 'px');
		$('#default_pin').css('width', localStorage.getItem('pin_size'));
	}).keydown(function(e) {
		if(e.which === 38) {
			if($(this).val() < 96) {
				localStorage.setItem('pin_size', parseInt($(this).val()) + 1 + 'px');
				$(this).val(parseInt($(this).val()) + 1);				
			} 
		} else if(e.which === 40) {
			if($(this).val() > 0) {
				localStorage.setItem('pin_size', $(this).val() - 1 + 'px');
				$(this).val($(this).val() - 1);					
			}
		}
		$('#default_pin').css('width', localStorage.getItem('pin_size'));
	}).bind('mousewheel', function(e){
        e.preventDefault();
        if(e.originalEvent.wheelDelta /120 > 0) {
			if($(this).val() < 96) {
				localStorage.setItem('pin_size', parseInt($(this).val()) + 1 + 'px');
				$(this).val(parseInt($(this).val()) + 1);				
			}
        }
        else{
			if($(this).val() > 0) {
				localStorage.setItem('pin_size', $(this).val() - 1 + 'px');
				$(this).val($(this).val() - 1);					
			}
        }
    });

	$('#marker_select_border_color').change(function() {
		localStorage.setItem('box_color', '#' + $(this).val());
		$('.border_width_example').css({
			'border': localStorage.getItem('box_width') + 'px solid ' +localStorage.getItem('box_color')
		});	
		showAlert();	
	});

	$('#marker_select_highlight_color').change(function() {
		localStorage.setItem('highlight_color', '#' + $(this).val());
		showAlert();
	});

	$("#marker_select_box_background").change(function() {
		localStorage.setItem('box_bg_color', '#' + $(this).val());
		$('.border_width_example div').css({
			'background-color': localStorage.getItem('box_bg_color'),
			'opacity': '.3'
		});		
	})

	$('#add-new-req ').click(function() {
		user_submitted++;
		var new_req = $('#marker_index_options p').eq(1).clone();
		if(new_req.length > 0) {
			$(new_req).find('a').text('User submitted rule').click(function() {
				if($(this).attr('aria-expanded') === 'false') {
					$(this).parent().find('input, textarea, button').show();
				} else {
					$(this).parent().find('input, textarea, button').hide();
				}
				
			});
			//$(new_req).find('input').attr('data-val').;
			$(new_req).find('input, textarea').attr('id', 'marker_options_textarea_usersubmitted_' + user_submitted).val('').css('display', 'block');
			$(new_req).find('label').attr('for', 'marker_options_textarea_usersubmitted_' + user_submitted).css('display', 'block');
			$(new_req).find('button').css('display', 'block');
			$(new_req).prependTo('#marker_index_options');
			$(new_req).find('button').click(function() {
				savePresets();
			});
		} else {
			//<a href="javascript:void(0);" class="marker_options_label_anchor" aria-expanded="true" style="display: block;">User submitted rule</a>
			var a = $('<a />').attr('href', 'javascript:void(0);').addClass('marker_options_label_anchor').attr('aria-expanded', 'true').css('display', 'block').text('User submitted rule ' + user_submitted).appendTo('#marker_index_options');
			var lname = $('<label />').attr('for', 'marker_options_input_add' + user_submitted).addClass('input-label').text('Value').appendTo('#marker_index_options').css('display', 'block');
			var name = $('<input />').addClass('marker_options_input marker').attr('id', 'marker_options_input_add' + user_submitted).attr('type', 'text').appendTo('#marker_index_options').css('display', 'block');

			var qNameL = $('<label />').addClass('input-label').css('display', 'block').attr('for', 'marker_options_textarea_usersubmitted_' + user_submitted).text('QuickName').appendTo('#marker_index_options');
			var qNameT = $('<textarea />').addClass('marker_options_input marker').attr({
				'aria-label': 'Quickname',
				'data-type': 'QuickName',
				'style': 'display: block;',
				'id': 'marker_options_textarea_usersubmitted_' + user_submitted
			}).appendTo('#marker_index_options');

			var recL = $('<label />').addClass('input-label').css('display', 'block').attr('for', 'marker_options_textarea_rec_usersubmitted_' + user_submitted).text('Recommendation').appendTo('#marker_index_options');
			var recT = $('<textarea />').addClass('marker_options_input marker').attr({
				'aria-label': 'Recommendation',
				'data-type': 'Recommendation',
				'style': 'display: block;',
				'id': 'marker_options_textarea_rec_usersubmitted_' + user_submitted
			}).appendTo('#marker_index_options');

			var exL = $('<label />').addClass('input-label').css('display', 'block').attr('for', 'marker_options_ex_textarea_usersubmitted_' + user_submitted).text('Example').appendTo('#marker_index_options');
			var exR = $('<textarea />').addClass('marker_options_input marker').attr({
				'aria-label': 'Example',
				'data-type': 'Example',
				'style': 'display: block;',
				'id': 'marker_options_ex_textarea_usersubmitted_' + user_submitted
			}).appendTo('#marker_index_options');

			//<button id="marker_save_btn_1" class="marker_preset_save_btn" style="display: block;">Save</button>
			var but = $('<button />').attr({
				'id': 'user_submitted_rule_save_btn_' + user_submitted,
				'class': 'marker_preset_save_btn',
				'style': 'display: block;'
			}).text('Save').click(function(e) {
				savePresets();
			}).appendTo('#marker_index_options');

			var butCan = $('<button />').attr({
				'id': 'user_submitted_rule_cancel_btn_' + user_submitted,
				'class': 'marker-remove-rec-link marker_preset_save_btn',
				'style': 'display: block;'
			}).text('Cancel').appendTo('#marker_index_options');					

		}
		
	});

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

function get_login_info() {
	if(!localStorage.getItem('userID')) {
		localStorage.setItem('userID', '');
	} else {
 $.ajax({
        url: chrome.extension.getURL('http://annotate.tech/register/login.php'),
        type: 'POST',
        dataType: "json",
        data: {
            userEmail: $('#marker_username').val(),
            userPass: $('#password').val()
        }
    }).done(function(data){
            console.log(JSON.stringify(data));
    });	
	}

}
