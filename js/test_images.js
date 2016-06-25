function test_images() {
	$('img:visible').each(function(i,v) {
		var obj = {
			'Issue': 'No alt attribute found on image',
			'Standard': 'WCAG 2.0 AA 1.1',
			'Recommendation': 'All images should have an alt attribute. Images without an alt attribute can cause noise for screen reader users',
			'HTML': v.outerHTML
		}

		if(!$(v).is('[alt]')) {
			issues.push(obj);
			$(v).addClass('marker-flagged-issue');
			var x = $(v).offset().left,
				y = $(v).offset().top;
			place_ind_marker(x,y,'imageInfo');			
		}
	});
}