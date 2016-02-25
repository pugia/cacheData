(function ($) {

	var PACache = {};
	
	function checksum(s) {
		var hash = 0,strlen = s.length,i,c;
		if ( strlen === 0 ) { return hash; }
		for ( i = 0; i < strlen; i++ ) {
			c = s.charCodeAt( i );
			hash = ((hash << 5) - hash) + c;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}
	
	$.cacheData = function(url, params, method, headers) {
		
		var dfrd = $.Deferred();
		
		if (typeof url === 'undefined') { return dfrd.reject(); }
		if (typeof method !== 'string') { method = 'get'; }
		if (typeof params !== 'object') { params = {}; }	
		if (typeof headers !== 'object') { headers = {}; }	
		
		var key = checksum(JSON.stringify([url,method,params,headers]));
		
		if (PACache[key]) { return PACache[key]; } 
		else {
			
			// init key element to prevent multiple calls on same url
			PACache[key] = 1;
			
			url = url instanceof Array ? url : [url];
			var ajaxs = [];
			$.each(url, function(i,u) {

				var conf = {
				  type: method.toUpperCase(),
				  url: u,
				  data: params,
				  headers: headers
				};

				ajaxs.push($.ajax(conf))
				
			})
			
			$.when.apply($, ajaxs)
			.done(function() {
				if (ajaxs.length > 1) {
					var response = [];
					$.each(arguments, function(i,a) {
						response.push(a[0]);
					})
				} else {
					var response = arguments[0];
				}
				
				dfrd.resolve(response);
				
			})
			.fail(function() {
				PACache[key] = false;
				dfrd.reject();
			});
					
			PACache[key] = dfrd.promise();
			return PACache[key];
			
		}
			
	};	

}(jQuery));