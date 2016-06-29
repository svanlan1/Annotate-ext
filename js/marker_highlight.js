/*************************************************************************************************
*	Filename: 	marker_a11y.js
*	Author: 	Shea VanLaningham
*	Website: 	https://github.com/svanlan1/Marker
*	Purpose: 	This file controls the highlighting of text while Marker is running
*
**************************************************************************************************/

function highlightSelection() {
	var selection = window.getSelection();
	if(selection.rangeCount > 0) {
		$('#marker_highlight').find('img').attr('src', chrome.extension.getURL('images/highlight_24.png'));
		setTimeout(function() {
			$('#marker_highlight').find('img').attr('src', chrome.extension.getURL('images/highlight_24_inactive.png'));
		}, 2000);
		var range = selection.getRangeAt(0);
		$(range.commonAncestorContainer).wrap('<span class="marker-highlight-text" style="display:block; background-color: '+localStorage.getItem('highlight_color')+';" />');
	} else {
		console.log('Marker [Nothing to highlight]');
	}	
}