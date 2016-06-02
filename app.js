var express      = require('express');
var session      = require('express-session');
var csrf         = require('./middleware/csrf');
var context      = require('./middleware/context');

var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var routes       = require('./routes/index');
var users        = require('./routes/users');

var fs           = require('fs');
var _			 = require('lodash');

//var rest 		 = require('./routes/rest');
var rest		 = require('./middleware/rib/rest');
var google		 = require('./middleware/google');
var verifyUser 	 = require('./middleware/verifyUser');

/*  ****** Begin ****** */
var app = express();

app.use(session(
	{
		secret:"holyshakemakereliefreflect",
		resave:true,
		saveUninitialized:true,
	}
));


// view engine setup
var exphbs = require("express-handlebars");
var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance. 
    handlebars:require("handlebars"), //latest version >=3.0.0
    layoutsDir:"./views",
    partialsDir:"./views",
    extname:".hbs",
    defaultLayout:"layout",
    helpers: {
        inc: function (i) { return parseInt(i)+1; },
        bar: function () { return 'BAR!'; }
    }
});
 
app.engine('.hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Custom to me!

//Skip auth during development to allow for prototyping without internet connection.
/*
app.use('/login/:oauth2?',function(req,res,next){
	console.log(req.params);
	if(req.params.oauth2)
		google.oauth2Client.getToken(req.query.code,function(err,tokens){
			if(!err)
			{
				google.oauth2Client.setCredentials(tokens);
				req.session.auth=google.oauth2Client;
			
				google.plus.people.get({userId:'me',auth:req.session.auth},function(err,response){
					delete response.id;
					req.session.user=response;
					req.session.user.email=req.session.user.emails[0].value;
					res.redirect('/');
				});			
			}
		});
	else
		res.render('login',{url:google.url});
});
*/
app.use(context);
app.use(function(req,res,next){
	req.session.user = {};
	req.session.user.displayName="Admin";
	req.session.user.email="chris.personrennell@sacredsf.org";
	req.session.user.id=1;
	req.session.context.user = req.session.user;
	
	next();
});
/*
app.use(csrf);
app.use(verifyUser);
*/
app.use("/rest",rest);

app.use(function(req,res,next){
	//Load the templates once per session.
	if(req.session.context.templates)
		return next();
		
	var t = Date.now();
	var template_directory="./public/templates";
	
	fs.readdir("./public/templates",function(err,files){
		var out=""
		for(var i = 0; i < files.length ; i++){
			if (!/\.hbs$/.test(files[i])) continue;
			var name=files[i].split(".")[0];
			out+="<script id='template_for_"+name+"' type='text/x-handlebars-template'>\n"
			var content=fs.readFileSync(template_directory+"/"+files[i],"utf8");
			out+=content;
			out+="\n</script>";
		}
		
		req.session.context.templates=out;
		
		var ms=Date.now()-t;
		
		console.log("Loaded templates in "+ms+"ms");
		next();
	});
	//fs.readFile("./public/templates/index.hbs","utf8",function(err,fd){
	//	console.log(err,fd);
	//	next();
	//});
	//Let the async do its thing?
//	next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	console.log("IN ERROR")
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
