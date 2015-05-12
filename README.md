### Intro
HorusJS is an advanced lightweight microframework for nodejs, it has a very light router
that doesn't use any loop to dispatch the matched listener but it just let nodejs it self
to manage it, the first route you write is the first route will be checked .
It has no complex code, you will use the default `req` and `res` objects in your routes

### Learn by examples
**Example #1**  `basic`
```javascript

http  = require('http')
horus = require('horus')

http.createServer(function(req, res){
	app = horus(req, res)
	app.run(function(){
		app.router.on('/', function(req, res){
			res.end('we are in the index')
		})
		app.router.on('GET /hello', function(req, res){
			res.end('Hello World')
		})
		// chaining ?
		// if you don't specify method it will run for any request method
		.on('GET /hi/([a-z]+)', function(req, res, name){
			res.end('Hi ' + name + ' !')
		})
		.on('GET|POST /hi/([a-z]+)/([0-9]+)', function(req, res, name, number){
			res.end('Hi ' + name + ', age: ' + number + ' ?!')
		})
		// group of routes for the same prefix ?
		.group('/parent', function(req, res){
			// instead of app.router, just use 'this'
			this.on('/child1', function(){
				res.end('/parent/child1')
			})
			this.on('/child2', function(){
				res.end('/parent/child2')
			})
		})
		// if nodejs reached here, send 404 error for any path
		// because it didn't find any matched route
		.on('(.+)', function(req, res, path){
			res.end('<h1> 404 not found</h1><p>We cannot find any matched object for "'+ req.hostname + '/' + path +'" </p>')
		})
	})
})
http.listen(8080)

```

**Example #2**  `vhosts`
```javascript

http  = require('http')
horus = require('horus')

http.createServer(function(req, res){
	app = horus(req, res)
	app.run(function(){
		// vhost routing
		// i'm using localtest.me for testing
		// it is a free service alternative to 'localhost'
		// that will redirect any request to your local machine
		// on port '80'
		app.router.vhost('user-([0-9]+).localtest.me', function(id)
		{
			// this: referers to app.router
			this.on('/', function(req, res){
				res.end("sub-domain, uid: " + id)
			})
		})

		app.router.vhost('localtest.me', function()
		{
			this.on('/', function(req, res){
				res.end('Hello World !')
			})
		})

		// if nodejs reached here, send 404 error
		// because it didn't find any matched route
		.on('(.+)', function(req, res, path){
			res.end('<h1> 404 not found</h1><p>We cannot find any matched object for "'+ req.hostname + '/' + path +'" </p>')
		})
	})
})
http.listen(80)

```

**Example #3**  `middlewares/layers`
> layers are just callbacks that will be executed before processing the request  

```javascript

http  = require('http')
horus = require('horus')

http.createServer(function(req, res){
	app = horus(req, res)
	app.layers.bind(function(req, res){
		console.log('layer #1')
	}).bind(function(req, res){
		console.log('layer #2')
	}).bind(function(){
		res.end('this will end the response and ignore any other event')
	})
	app.run(function(){
		app.router.on('/', function(){
			res.end('Hello World')
		})
	})
})
http.listen(80)

```

### other properties
```javascript
// horus adds new properties to request object
// req.path: the current path '/path/?query' > "/path/"
// req.hostname: the current hostname 'hostname:port' > "hostname"
```
