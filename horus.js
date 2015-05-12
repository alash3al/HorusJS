/**
 * Globalize our factory
 *
 * @return	{Object}
 */
module.exports = function(req, res)
{
	return new Horus(req, res)
}

// ------------

/**
 * Horus - A micro-framework for node.js
 *
 * @param 	{ReadableStream}	req
 * @param 	{WritableStream}	res
 */
function Router(req, res)
{
	// the current request path prefix 'for grouping multiple routes'
	var _prefix			=	'/'

	/**
	 * vhost - a virtual host router
	 *
	 * @param 	{String}	host
	 * @param 	{Function}	listener
	 */
	this.vhost	=	function(host, listener)
	{
		match = req.hostname.match(new RegExp('^' + host + '$'))

		if ( match )
		{
			match.shift();

			delete match['index']
			delete match['input']

			listener.apply(this, match)
		}

		return this;
	}

	/**
	 * is - check whether the specified path matches the current path
	 *
	 * @param 	{String}	path
	 * @param 	{Bool}		strict
	 */
	var _is 	=	function(path, strict)
	{
		path 	=	('/' + _prefix + '/' + path + '/').replace(/\/+/g, '/')
		escaped	=	path.replace(/\//g, '\\/')
		match	=	req.path.match(new RegExp('^' + escaped + (strict ? '$' : '')))

		if ( match )
		{
			match.shift()

			delete match['index']
			delete match['input']
		}

		return {match: match, path: path, escaped: escaped}
	}

	/**
	 * On - handle the specified path using the given listener
	 *
	 * @param 	{String}	string
	 * @param 	{Function}	listener
	 */
	this.on		=	function(path, listener)
	{
		if ( path.indexOf(' ') >= 0 )
		{
			path 	= 	path.split(' ', 2)
			method 	= 	path[0].toUpperCase().trim()
			method  =	(method == "") ? req.method : method
			path 	= 	path[1]
		}
		else
		{
			method = req.method
		}

		is		=	_is(path, true)

		if ( (method.indexOf(req.method) >= 0) && is.match )
		{
			listener.apply(this, [req, res].concat(is.match))
		}

		return this
	}

	/**
	 * Group - group multiple routes undet the specified path
	 *
	 * @param 	{String}	path
	 * @param 	{Function}	listener
	 */
	this.group	=	function(path, listener)
	{
		is = _is(path, false)

		if ( is.match )
		{
			old 		= 	_prefix
			_prefix 	= 	is.path

			listener.apply(this, [req, res].concat(is.match))

			_prefix 	= 	old
		}

		return this
	}
}

// ------------

/**
 * Layer - a simple middleware
 *
 * @param 	{ReadableStream}	req
 * @param 	{WritableStream}	res
 */
function Layers(req, res)
{
	this.layers = []

	this.bind 	=	function(callback)
	{
		this.layers.push(callback)
		return this
	}

	this.trigger	=	function()
	{
		for ( var i in this.layers ) {
			this.layers[i](req, res)
		}
	}
}

// ------------

/**
 * Horus - a simple lightweight framework for nodejs
 *
 * @param 	{ReadableStream}	req
 * @param 	{WritableStream}	res
 */
function Horus(req, res)
{
	// the current request method
	req.method		=	req.method.toUpperCase()

	// the current request hostname
	req.hostname	=	req.headers.host.split(':', 2)[0]

	// the current request path
	req.path 		= 	('/' + req.url.split('?')[0] + '/').replace(/\/+/g, '/')

	// the router object
	this.router 	=	new Router(req, res)

	// the layers object
	this.layers 	= 	new Layers(req, res)

	this.run		=	function(app)
	{
		this.layers.trigger()
		req.on('data', function(){})
		req.on('end', function(){
			app.apply()
		})
	}

	return this
}

// ------------
