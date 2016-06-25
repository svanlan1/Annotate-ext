if(!localStorage.getItem('welcome')) {
	localStorage.setItem('welcome', 'show');
}
if(!localStorage.getItem('left')) {
	localStorage.setItem('left', '50');
}
if(!localStorage.getItem('top')) {
	localStorage.setItem('top', '50');
}

function setVars(req) {
	localStorage.setItem('left', req.left);
	localStorage.setItem('top', req.top);
}


chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendRequest(tab.id, {greeting: 'start_stop', 'welcome': localStorage.getItem('welcome'), left: localStorage.getItem('left'), top: localStorage.getItem('top'), clicked: "icon"}, function(response) {});
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



