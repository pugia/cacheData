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
	
	$.cacheDataAjax = function() {
		
		var conf = false;
		
		if (arguments.length == 2) {
			conf = $.extend(true, arguments[1], {
				url: arguments[0]
			});
		}
		if (arguments.length == 1) {
			conf = $.extend(true, arguments[0], null);
		}
		
		if (!conf) { return false; }
		
		var dfrd = $.Deferred();
		
		var key = checksum(JSON.stringify(conf));
		if (PACache[key]) { return PACache[key]; } 
		else {
		
			// init key element to prevent multiple calls on same url
			PACache[key] = 1;

			$.ajax(conf)
			.done(function(response) {
				var r = (typeof response === 'string') ? JSON.parse(response) || $.parseJSON(response) : response;
				dfrd.resolve(r);
			})
			.fail(function() {
				PACache[key] = false;
				dfrd.reject(arguments);
			});
		
			PACache[key] = dfrd.promise();
			return PACache[key];
		}
		
	};
	
	$.cacheData = function(url, params, method, headers, contentType) {
				
		var dfrd = $.Deferred();
		
		if (url instanceof Array) {
			return checkMultiple(url, params, method, headers, contentType);
		}
		
		if (url instanceof Object) {						
			if (typeof url.method === 'string') { method = url.method; }
			if (typeof url.params !== 'undefined') { params = url.params; }
			if (typeof url.headers !== 'undefined') { headers = url.headers; }
			if (typeof url.contentType === 'string') { contentType = url.contentType; }
			// prevent rewrite on other values
			if (typeof url.url === 'string') { url = url.url; }
		}		
		
		
		if (typeof url === 'undefined') { dfrd.reject(); return dfrd.promise(); }
		if (typeof method !== 'string') { method = 'get'; }
		if (typeof params === 'undefined') { params = {}; }	
		if (typeof headers === 'undefined') { headers = {}; }	
		if (typeof contentType !== 'string') { contentType = 'application/x-www-form-urlencoded; charset=UTF-8'; }	
								
		var key = checksum(JSON.stringify([url,method,params,headers]));
		
		if (PACache[key]) { return PACache[key]; } 
		else {
			
			// init key element to prevent multiple calls on same url
			PACache[key] = 1;
			var conf = {
			  type: method.toUpperCase(),
			  url: url,
			  data: params,
			  headers: headers,
			  async: false,
			  contentType: contentType
			};
			
			$.cacheDataAjax(conf)
			.done(function(response) {
				var r = (typeof response === 'string') ? JSON.parse(response) || $.parseJSON(response) : response;
				dfrd.resolve(r);
			})
			.fail(function() {
				PACache[key] = false;
				dfrd.reject();
			});
					
			PACache[key] = dfrd.promise();
			return PACache[key];
			
		}
			
	};	
	
	function checkMultiple(urls, params, method, headers, contentType) {
		
		var dfrd = $.Deferred();
		
		urls = urls instanceof Array ? urls : [urls];
		var ajaxs = [];
		$.each(urls, function(i,u) {
			
			ajaxs.push($.cacheData(u, params, method, headers, contentType));
			
		});
		
		$.when.apply($, ajaxs)
		.done(function() {
						
			if (ajaxs.length > 1) {
				dfrd.resolve(arguments);
			} else {
				dfrd.resolve(arguments[0]);
			}
			
		})
		.fail(function() {
			dfrd.reject();
		});
				
		return dfrd.promise();
		
	}

}(jQuery));