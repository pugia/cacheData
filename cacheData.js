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
			
			var conf = {
			  method: method,
			  url: url,
			  data: params,
			  headers: headers
			};
			
			$.ajax(conf)	
			.done(function(response) {
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