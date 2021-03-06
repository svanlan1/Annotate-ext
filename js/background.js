function setInitial() {
	
	var obj = 	{
		"greeting": "start_stop",
		"welcome": "show",
		"left": "auto",
		"top": "auto",
		"set": "blank",
		"box_color": "#c00",
		"box_width": "2",
		"marker-font-size": "16px",
		"flag-color": "bright_red",
		"pack_1": "true",
		"highlight_color": "#e6f16a",
		"font_color": "#000",
		"box_bg_color": "#e6f16a",
		"pin_size": "24px",
		"font_size": "24px",
		"show_tips": "true",
		"font_outline": "#333",
		"font_bg": "",
		"default_icons": ["Bright_Red","Red","Pink","Orange","Plum","Blue","Cobalt","Aqua","Bluegreen","Green","Lime","Yellow","Poop","Black","Grey","White","Placeholder_red","Placeholder_blue","Placeholder_green","Placeholder_gold","Dot_red","Dot_blue","Dot_green","Dot_black"],
		"fun_icons": ["HTML", "CSS", "Scissors", "Notepad", "Brackets", "Dung", "Goldstar", "Wrong", "Happy", "Laughing", "Sad", "Sick", "Heart", "Mag", "Jason", "Freddy"],
		"pin_array_icons": ["Bright_Red","Red","Pink","Orange","Plum","Blue","Cobalt","Aqua","Bluegreen","Green","Lime","Yellow","Poop","Black","Grey","White"],
		"rotate_marker": "false",
		"addText": "false",
		"text_shadow_color": "#aaaaaa",
		"text_h_shadow": "2px",
		"text_v_shadow": "3px",
		"text_background": "#444",
		"text_blur_radius": "2px",
		"text_bg_opacity": "10",
		"userID": "",
		"email_address": "",
		"first_name": "",
		"last_name": "",
		"custom_preset": "[]",
		"user": ""
	}

	for (var i in obj) {
		if(!localStorage.getItem(i)) {
			if(i.indexOf('icon') > -1){
				localStorage.setItem(i, JSON.stringify(obj[i]));
			} else {
				localStorage.setItem(i, obj[i]);
			}
		}
		if(i === 'addText') {
			localStorage.setItem(i, obj[i]);
		}

		if(i === 'greeting') {
			localStorage.setItem(i, 'start_stop');
		}		
	}
}


function setVars(req) {
	for(var i in req) {
		localStorage.setItem(i, req[i]);
	}
}

function highlight() {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendRequest(tab.id, {greeting: "highlight"}, function(response) {});
	});
}

function login(data) {
	if(localStorage.length === 0) {
		setInitial();
	}
	$.ajax({
	  url: "http://annotate.tech/register/login.php",
	  type: "POST",
	  data: data,
	  success: function (response) {
	    var r = JSON.parse(response);
	    localStorage.setItem('userID', r.userID);
	    localStorage.setItem('userEmail', r.email_address);
	    localStorage.setItem('firstName', r.first_name);
	    localStorage.setItem('lastName', r.last_name);
		
		chrome.runtime.sendMessage({
			greeting: 'hide_login',
			data: response
		});		    
	  },
	  error: function (error) {
	    console.log(error);
	  }
	});	
}

function getCount(data, tabid) {
	data.url = data.url.split('&annotate')[0];
	$.ajax({
	  url: "http://annotate.tech/get_annotations_new.php",
	  type: "POST",
	  data: data,
	  success: function (response) {
	    
	    var estring = response.replace(/\\/g, '');
	    var res = $.parseJSON(estring);
	    var len = JSON.stringify(res.length);
	    if(res.length > 0) {
			chrome.browserAction.setBadgeText({text : len});
			chrome.browserAction.setBadgeBackgroundColor({color : '#c00'});	    	
	    } else {
			chrome.browserAction.setBadgeText({text : ''});
			chrome.browserAction.setBadgeBackgroundColor({color : '#fff'});	  	    	
	    }
	  },
	  error: function (error) {
	    console.log(error);
	  }
	});	
}

function getPreviousAnnotations(data, tabid) {
	data.url = data.url.split('&annotate')[0];
	$.ajax({
	  url: "http://annotate.tech/get_annotations_new.php",
	  type: "POST",
	  data: data,
	  success: function (response) {
	    var estring = response.replace(/\\/g, '');
	    var res = $.parseJSON(estring);
	    var len = JSON.stringify(res.length);
	    if(res.length > 0) {
			chrome.browserAction.setBadgeText({text : len});
			chrome.browserAction.setBadgeBackgroundColor({color : '#c00'});	    	
	    } else {
			chrome.browserAction.setBadgeText({text : ''});
			chrome.browserAction.setBadgeBackgroundColor({color : '#fff'});	  	    	
	    }	    
		chrome.windows.getCurrent(function(win)
		{
		    chrome.tabs.getAllInWindow(win.id, function(tabs)
		    {
		        var activeTab;
		        $(tabs).each(function(i,v) {
		        	if(v.active === true) {
		        		activeTab = tabs[i]['id'];
		        	}
		        });
		        chrome.tabs.sendRequest(activeTab, {greeting: "here_are_annotations", data: estring}, function(response) {});
		    });
		});
	  },
	  error: function (error) {
	    console.log(error);
	  }
	});	
}

function postNewAnnotation(data) {
	var warningId = 'notification.warning';
	var url = data.url;
	if(localStorage.getItem('userEmail') !== "") {
		$.ajax({
			url: 'http://annotate.tech/add_service_new.php',
			type: "POST",
			data: data,
			success: function ( response ) {
				if(response.toLowerCase().indexOf('error') === -1) {
				chrome.windows.getCurrent(function(win)
				{
				    chrome.tabs.getAllInWindow(win.id, function(tabs)
				    {
				        var activeTab;
				        $(tabs).each(function(i,v) {
				        	if(v.active === true) {
				        		activeTab = tabs[i]['id'];
				        	}
				        });
				        chrome.tabs.sendRequest(activeTab, {greeting: "annotation_saved"}, function(response) {});
					    chrome.notifications.create(warningId, {
					      iconUrl: chrome.runtime.getURL('images/annotate_128.png'),
					      title: 'Annotation saved!',
					      type: 'basic',
					      message: url + ' \nYour annotation has been saved to your account.',
					      isClickable: true,
					      priority: 1,
					    }, function() {});			        
				    });
				});					
			} else {
			    chrome.notifications.create(warningId, {
			      iconUrl: chrome.runtime.getURL('images/annotate_128.png'),
			      title: 'Ruh roh!',
			      type: 'basic',
			      message: url + ' \nHmm, something went wrong.  An email has been sent to the support team.',
			      isClickable: true,
			      priority: 1,
			    }, function() {});				
			}
	

			},
			error: function ( error ) {
				console.log(error);
			}
		});
	}
}

function getRecommendations() {
	$.ajax({
		url: 'http://annotate.tech/get_recs_service.php',
		type: 'POST',
		data: {userID: localStorage.getItem('userID')},
		success: function ( response ) {
			localStorage.setItem('custom_preset', response);
		},
		error: function ( error ) {
			console.log(error);
		}
	})
}


chrome.browserAction.onClicked.addListener(function(tab) {
	if(localStorage.length === 0) {
		setInitial();
	}
	
	if(localStorage.getItem("set") === "a11y") {
		if(localStorage.getItem("a11y_preset")) {
			var preset = localStorage.getItem("a11y_preset");
		} else {
			var preset = "[]";
		}
		
	} else if (localStorage.getItem("set") === "html") {
		if(localStorage.getItem("html_preset")) {
			var preset = localStorage.getItem("html_preset");
		} else {
			var preset = "[]";
		}
		
	} else if (localStorage.getItem('set') === "custom") {
		var preset = localStorage.getItem('custom_preset');
	}else {
		var preset = '[]';
	}
	if(localStorage.getItem("version") !== chrome.runtime.getManifest().version) {
		var install_flag = "true"
	} else {
		var install_flag = "false";
	}
	localStorage.setItem('greeting', 'start_stop');
	chrome.tabs.sendRequest(tab.id, localStorage, function(response) {});
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.greeting === "start") {
			getRecommendations();
			chrome.browserAction.setIcon({tabId: sender.tab.id, path: "../images/annotate_16_active.png"});			
		}

		if(request.greeting === "start_param") {
			chrome.windows.getCurrent(function(win)
			{
			    chrome.tabs.getAllInWindow(win.id, function(tabs)
			    {
			        // Should output an array of tab objects to your dev console.
			        localStorage.setItem('greeting', 'start_stop');
			        chrome.tabs.sendRequest(sender.tab.id, localStorage, function(response) {});
			        //console.debug(tabs);
			    });
			});					
		}

		if(request.greeting === "welcome") {
			localStorage.setItem("welcome", "hide");
		}

		if(request.greeting === "stop") {
			chrome.browserAction.setIcon({tabId: sender.tab.id, path: "../images/annotate_16_inactive.png"});
		}

		if(request.greeting === "store") {
			setVars(request);
		}

		if(request.greeting === "login"){
			login(request.data);
		}

		if(request.greeting === "get_annotations") {
			getPreviousAnnotations(request.data);			
		}

		if(request.greeting === "save_annotations") {
			postNewAnnotation(request.data);
		}

		if(request.greeting === "get_count") {
			getCount(request.data);
		}
	});

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
		chrome.tabs.getSelected(null, function(tab) {
				chrome.browserAction.setBadgeText({text : 'NEW'});
				chrome.browserAction.setBadgeBackgroundColor({color : '#dd8127'});
				chrome.windows.create({'url': 'index.html', 'type': 'popup'}, function(window) {
   					});
		});
		localStorage.setItem('version', chrome.runtime.getManifest().version);  
    } else if(details.reason == "update"){
       if(localStorage.getItem('version') !== details.previousVersion) {
			chrome.tabs.getSelected(null, function(tab) {
					chrome.browserAction.setBadgeText({text : 'NEW'});
					chrome.browserAction.setBadgeBackgroundColor({color : '#055803'});
					chrome.windows.create({'url': 'http://annotate.tech/changes.html', 'type': 'popup'}, function(window) {
   					});
			});
			localStorage.setItem('version', chrome.runtime.getManifest().version);
       }
    }
});

if(localStorage.length === 0) {
	setInitial();
}
