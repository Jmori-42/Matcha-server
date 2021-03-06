/*
 * Matcha Server in NodeJS
 * Author : MAURY Baptiste
 * Version : 0.0.1
*/

var messages	=	require('./controller/messages_gestion.js');
var blockReport	=	require('./controller/block_report.js');
var sugest		=	require('./controller/sugest.js');
var tagGestion	=	require('./controller/tag_gestion.js');
var liked		=	require('./controller/liked.js');
var like		=	require('./controller/like.js');
var userGest	=	require('./controller/Auth.js');
var likeConsult	=	require('./controller/liked_consulted.js');
var consult		=	require('./controller/consult.js');
var session		=	require('express-session');
var bodyParser	= 	require('body-parser');
var express 	=	require('express');  
var app 		=	express();


var MongoClient = require('mongodb').MongoClient,
assert = require('assert');

// Connection URL
var url = 'mongodb://192.168.99.100:27017/matcha';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db.close();
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(allowCrossDomain);

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var sess;

app.post('/login',function(req,res){
	var test;
	sess = req.session;
	userGest.checkUser(req.body, MongoClient, url, res, sess);
});

app.post('/signup',function(req,res){
	sess = req.session;
	if (req.body.pass == req.body.pass2)
		userGest.addUser(req.body, MongoClient, url, res, sess);
	else
		res.status(401).json({ error: 'Differents Passwords' });
});

app.post('/update',function(req,res){
	///A Remplir
});

app.get('/consulted',function(req,res){
	likeConsult.consulted(req, MongoClient, url, function(consultlist) {
		res.json({
			consultlist
		});
    });
});

app.get('/consult',function(req,res){
	console.log(sess.data.username);
	consult.consult(sess.data.username, req.headers['username'], MongoClient, url, function(userinfos) {
		res.json({
			userinfos
		});
    });
});

app.post('/like',function(req,res){
	console.log(req.body.username);
	like.like(sess.data.username, req.body.username, MongoClient, url, function() {
		res.json({
			status : "done"
		});
    });
});

app.get('/liked',function(req,res){
	liked.liked(sess.data.username, MongoClient, url, function(userLikedList) {
		res.json({
			userLikedList
		});
	});
});

app.post('/dislike',function(req,res){
	like.dislike(sess.data.username, req.body.username, MongoClient, url, function() {
		res.json({
			status : "done"
		});
	});
});

app.get('/addtag',function(req,res){
	tagGestion.addtag(sess.data.username, req.headers['tag'], MongoClient, url, function(userLikedList) {
		res.json({
			status : "done"
		});
	});
});

app.get('/sugest',function(req,res){
	console.log(sess.data.username);
	sugest.sugest(sess.data.username, MongoClient, url, function(userList) {
		res.json({
			userList
		});
	});
});

app.get('/block',function(req,res){
	blockReport.block(sess.data.username, req.headers['username'], MongoClient, url, function() {
		res.json({
			status : "done"
		});
	});
});

app.get('/getmessages',function(req,res){
	console.log("Test1");
	messages.getMessages(sess.data.username, req.headers['username'], MongoClient, url, function(messagesList) {
		res.json({
			messagesList
		});
	});
});


app.post('/pushmessage',function(req,res){
	messages.pushMessage(sess.data.username, req.body.username, req.body.message, MongoClient, url, function(messagesList) {
		res.json({
			status : "done"
		});
	});
});

//Test non nécessaire dans le sujet//

app.get('/taglist',function(req,res){
	tagGestion.listTag(sess.data.username, MongoClient, url, function(consultlist) {
		res.json({
			consultlist
		});
    });
});

/////////////////////////////////////

app.get('/logout',function(req,res){
	
	req.session.destroy(function(err){
		
	});
});

  
var server = require('http').createServer(app);  

// TEMPS REEL POUR NOTIFS ET CHAT Socket.IO //

var io = require('socket.io')(server);

io.on('connection', (client) => {
	console.log('Un client est connecté !');
	client.on('subscribeToTimer', (interval) => {
	  console.log('client is subscribing to timer with interval ', interval);
	  setInterval(() => {
		client.emit('timer', new Date());
	  }, interval);
	});
});

/////////////////////////////////////////////

server.listen(4242,function(){
	console.log(new Date());
	console.log("App Started on PORT 4242");
});
