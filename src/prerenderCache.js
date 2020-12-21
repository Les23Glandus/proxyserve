var cacheManager = require('cache-manager');
var fsStore = require('cache-manager-fs-binary');
require('dotenv').config();

module.exports = {
	init: function() {
		this.cache = cacheManager.caching({
            //store: 'memory', max: process.env.CACHE_MAXSIZE || 100, ttl: process.env.CACHE_TTL || 60/*seconds*/
            store: fsStore,
			//refreshThreshold:10,
            options: {
                reviveBuffers: true,
				binaryAsStream: true,
                ttl: process.env.PRERENDER_TTL || 60 * 60 /* seconds */,
                maxsize: ( process.env.PRERENDER_MAXSIZE || 1000) * 1024 * 1024 /* max size in bytes on disk */,
                path: process.env.PRERENDER_CACHE_DIR,
                preventfill: true
            }
		});
	},

	requestReceived: function(req, res, next) {
		this.cache.get(req.prerender.url, function (err, result) {
			if (!err && result) {
				req.prerender.cacheHit = true;
				res.send(200, result);
			} else {
				next();
			}
		});
	},

	beforeSend: function(req, res, next) {
		if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
			this.cache.set(req.prerender.url, req.prerender.content);
		}
		next();
	}
};