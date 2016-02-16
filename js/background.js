on = 'false';

function set_run() {
	if(localStorage.getItem('on')) {
		on = localStorage.getItem('on');
	} else {
		on = 'false';
	}
}

function run() {
	console.log('marker');
}

function start(tab) {
	if(on == 'false') {
		chrome.tabs.sendRequest(tab.id, {greeting: 'start', clicked: "icon"}, function(response) {});
		chrome.browserAction.setIcon({tabId: tab.id, path: '../images/marker_16_active.png'});
		localStorage.setItem('on', 'true');		
	} else {
		chrome.tabs.sendRequest(tab.id, {greeting: "stop", clicked: "icon"}, function(response) {});
		chrome.browserAction.setIcon({tabId: tab.id, path: '../images/marker_16_inactive.png'});
		localStorage.setItem('on', 'false');
	}

}

chrome.browserAction.onClicked.addListener(function(tab) {
	start(tab);
	set_run()
});

