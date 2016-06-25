function test_anchors(html) {
	$('a:visible').each(function(i,v) {
		var obj = {
			'Issue': 'Anchor lacking href attribute',
			'Standard': 'WCAG 2.0 AA 1.1',
			'Recommendation': 'All anchors must have a valid href attribute and value.  Without this, the anchor is not accessibile via the keyboard.',
			'HTML': v.outerHTML
		}

		if(!$(v).attr('href')) {
			issues.push(obj);
			$(v).addClass('marker-flagged-issue');
			var x = $(v).offset().left,
				y = $(v).offset().top;
			place_ind_marker(x,y,'anchor');
		}
	});
}