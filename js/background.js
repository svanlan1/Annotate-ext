if(!localStorage.getItem('welcome')) {
	localStorage.setItem('welcome', 'show');
}
if(!localStorage.getItem('left')) {
	localStorage.setItem('left', '50');
}
if(!localStorage.getItem('top')) {
	localStorage.setItem('top', '50');
}

if(!localStorage.getItem('set')) {
	localStorage.setItem('set', 'blank');
}

if(!localStorage.getItem('box_color')) {
	localStorage.setItem('box_color', '#c00');
}

if(!localStorage.getItem('box_width')) {
	localStorage.setItem('box_width', '2');
}

if(!localStorage.getItem('marker-font-size')) {
	localStorage.setItem('marker-font-size', '16px');
}

if(!localStorage.getItem('flag-color')) {
	localStorage.setItem('flag-color', 'red');
}

if(!localStorage.getItem('icon_pack_1')) {
	localStorage.setItem('icon_pack_1', 'true');
}

if(!localStorage.getItem('highlight_color')) {
	localStorage.setItem('highlight_color', '#e6f16a');
}

if(!localStorage.getItem('box_bg_color')) {
	localStorage.setItem('box_bg_color', '');
}

if(!localStorage.getItem('pin_size')) {
	localStorage.setItem('pin_size', '24px');
}

if(!localStorage.getItem('show_tips')) {
	localStorage.setItem('show_tips', 'true');
}




function setVars(req) {
	localStorage.setItem('left', req.left);
	localStorage.setItem('top', req.top);
	localStorage.setItem('show_tips', req.show_tips);
}

function highlight() {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendRequest(tab.id, {greeting: 'highlight'}, function(response) {});
	})
	
}


chrome.browserAction.onClicked.addListener(function(tab) {
	if(!localStorage.getItem('version')) {
		localStorage.setItem('version', '0');
	}
	if(localStorage.getItem('set') === 'a11y') {
		if(localStorage.getItem('a11y_preset')) {
			var preset = localStorage.getItem('a11y_preset');
		} else {
			var preset = '[]';
		}
		
	} else if (localStorage.getItem('set') === 'html') {
		if(localStorage.getItem('html_preset')) {
			var preset = localStorage.getItem('html_preset');
		} else {
			var preset = '[]';
		}
		
	} else {
		var preset = '[]';
	}
	if(localStorage.getItem('version') !== chrome.runtime.getManifest().version) {
		var install_flag = 'true'
	} else {
		var install_flag = 'false';
	}
	chrome.tabs.sendRequest(tab.id, {greeting: 'start_stop', 'welcome': localStorage.getItem('welcome'), show_tips: localStorage.getItem('show_tips'), pin_size: localStorage.getItem('pin_size'), box_bg_color: localStorage.getItem('box_bg_color'), install: install_flag, box_color: localStorage.getItem('box_color'), icon_pack_1: localStorage.getItem('icon_pack_1'), marker_font_size: localStorage.getItem('marker-font-size'), preset: preset, set: localStorage.getItem('set'), flag_color: localStorage.getItem('flag-color'), left: localStorage.getItem('left'), top: localStorage.getItem('top'), box_width: localStorage.getItem('box_width'), highlight_color: localStorage.getItem('highlight_color'), clicked: "icon"}, function(response) {});
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.greeting === 'start') {
			chrome.browserAction.setIcon({tabId: sender.tab.id, path: '../images/marker_16_active.png'});			
		}

		if(request.greeting === 'welcome') {
			localStorage.setItem('welcome', 'hide');
		}

		if(request.greeting === 'stop') {
			chrome.browserAction.setIcon({tabId: sender.tab.id, path: '../images/marker_16_inactive.png'});
		}

		if(request.greeting === 'store') {
			setVars(request);
		}
	});

chrome.contextMenus.create({
	title: 'Highlight with Marker',
	contexts:["selection"],
	onclick: highlight
});


chrome.runtime.onInstalled.addListener(
	function(details) {
			if(details.reason === 'install') {
				localStorage.setItem('version', chrome.runtime.getManifest().version);
			}
		}
	)



