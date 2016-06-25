function test_html() {
	if(!$('html').attr('lang')) {
		var obj = {
			'Issue': 'No "lang" attribute found on HTML element',
			'Standard': 'WCAG 2.0 AA 1.1',
			'Recommendation': 'Set the document language to assist screen reader users.',
			'HTML': '<html>'
		}	
		issues.push(obj);	
	}
}