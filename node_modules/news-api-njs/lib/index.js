var request = require('request'),
	rp = require('request-promise-native');

var NewsApi = function(opts) {
	opts = opts || {};
	var apiKey, debug, self = this;
	if (opts.apiKey !== undefined && opts.apiKey !== '')
		this.apiKey = opts.apiKey;
	this.debug = opts.debug || false;

	self._getData = function(type, qs, fullRes = false) {
		var self = this;
		return new Promise(function(resolve, reject) {
			qs.apiKey = self.apiKey;
			var opt = {
				method: 'GET',
				uri: 'https://newsapi.org/v1/' + type,
				json: true,
				qs: qs,
				resolveWithFullResponse: fullRes
			};
			rp(opt).then(
				function(res) {
					if (res.status === 'error') {
						reject(res);
					} else {
						resolve(res);
					}
				}).catch(
				function(err) {
					reject(err.error);
					if (self.debug)
						console.log("Exception: ", err);
				}
			);
		});

	};
};

NewsApi.prototype.init = function(opts) {
	var apiKey, debug;
	if (opts.apiKey !== undefined && opts.apiKey !== '')
		this.apiKey = opts.apiKey;
	this.debug = opts.debug || false;
};

NewsApi.prototype.getArticles = function(opt) {
	// returns articles from a given source
	var qs = opt || {};
	if (qs.source === '' || qs.source === undefined) {
		var errMsg = {
			success: false,
			status: 'error',
			error: {
				'#': 'You must provide a source'
			}
		};
		if (opt.callback !== undefined) {
			opt.callback(errMsg);
		} else {
			return new Promise(function(res, rej) {
				rej(errMsg);
			})
		}
		return;
	}
	if (opt.callback !== undefined) {
		this._getData('articles', qs).then(function(res) {
			res.success = true;
			opt.callback(res);
		}).
		catch(function(err) {
			err.success = false;
			opt.callback(err);
		});
	} else {
		return this._getData('articles', qs);
	}
};

NewsApi.prototype.getSources = function(opt) {
	// returns possible sources
	var qs = opt || {};
	if (opt.callback !== undefined) {
		this._getData('sources', qs).then(function(res) {
			res.success = true;
			opt.callback(res);
		}).
		catch(function(err) {
			err.success = false;
			opt.callback(err);
		});
	} else {
		return this._getData('sources', qs);
	}
};

module.exports = NewsApi;