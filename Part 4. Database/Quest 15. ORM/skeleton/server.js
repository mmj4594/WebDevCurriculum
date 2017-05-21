var express = require('express'),
	path = require('path'),
	app = express(),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	Sequelize = require('sequelize'),
	sequelize = new Sequelize('notepad', 'notepad', 'notepadpassword', {
		host: 'localhost',
		dialect: 'mysql'
	}),
	crypto = require('crypto');
	
var encrypt = function(password) {
	return crypto.createHash('sha256').update(password).digest('base64');
};


sequelize.authenticate().then(function() {
	console.log('login success');
}).catch(function(err) {
	console.log(err);
});

var User = sequelize.define('user', {
	user_id: Sequelize.STRING,
	password: Sequelize.STRING
});

var Note = sequelize.define('note', {
	note_num: Sequelize.INTEGER,
	content: Sequelize.STRING
});

User.hasMany(Note);

User.sync(). then(function(){
	Note.sync();
});


app.use('/static', express.static('client'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: 'keyboard cat', cookie: {maxAge: 1000 * 60 * 60}}));





app.get('/', function (req, res) {
	var user_id = req.session.user_id;
	if(!user_id)
		res.redirect('/login');
	else
		res.sendFile(path.join(__dirname, 'client/index.html'));
});
app.get('/login', function(req, res) {
	var user_id = req.session.user_id;
	if(!user_id)
		res.sendFile(path.join(__dirname, 'client/login.html'));
	else
		res.redirect('/');
	res.sendFile(path.join(__dirname, 'client/login.html'));
});

app.post('/login', function(req, res){
	var user_id=req.body['user_id'];
	var password=req.body['password'];

	console.log(user_id + " " + password);

	User.findAll().then(function(users){
		for(var i=0; i < users.length; i++){
			var id = users[i]['user_id'];
			var pw = users[i]['password'];

			if(user_id == id && encrypt(password) == pw)
				break;
		}

		if(i == users.length) res.redirect('/login');
		else {
			req.session.user_id = user_id;
			res.redirect("/");
		}	
	});	
});

app.post('/logout', function(req, res) {
	var user_id = req.session.user_id;
	
	req.session.destroy(function(err) {
		console.log(user_id + " logged out");
	});
	res.redirect('/login');	
});

app.get('/note', function(req, res) {
	var user_id = req.session.user_id;
	if(!user_id) 
		res.send("");
	else {
		var id = req.query.id;

		User.findOne({
			where: { user_id: user_id }
		}).then(function(user) {
			return user.getNotes({ where: { note_num: id }});
		}).then(function(notes) {
						
			if(notes.length == 0) d = '';
			else d = notes[notes.length - 1]['content'];

			res.send(d);
		});

		/*fs.readFile(user_id + "_" + id + '.txt', function(err, data) {
			var d;
			if(err)
				d = "";
			else
				d = data;
			res.send(d);
		});*/
	}
});

app.post('/note', function (req, res) {
	var user_id = req.session.user_id;
	if(!user_id)
		res.send("");
	else {
		var id = req.query.id;

		var newNote = Note.build({
			note_num: id,
			content: req.body['data']
		});	
	
		newNote.save().then(function(){
			return User.findOne({ where: { user_id: user_id } });
		}).then(function(user){
			user.addNote(newNote);
			res.send('');
		}).catch(function(err) {
			console.log(err);
			res.send(err);
		});

		/*console.log(req.body['data']);
		fs.writeFile(user_id + '_'  + id + '.txt', req.body['data'], "utf8", function(err) {
			if(err) throw err;
			console.log(user_id + '_' + id + '.txt is saved');	
	
		res.send();
		});*/
	}
});

app.get('/test', function(req, res) {
	var sess = req.session;
	if(sess.views) {
		sess.views++;
		res.setHeader('Content-Type', 'text/html');
		res.write('<p>views' + sess.views + '</p>');
		res.write('<p>expires in;' + (sess.cookie.maxAge / 1000) + 's</p>');
		res.end();
	}
	else {
		sess.views = 1;
		res.end('welcone to the seession demo. refresh!');
	}
});

/* TODO: 여기에 처리해야 할 요청의 주소별로 동작을 채워넣어 보세요..! */

var server = app.listen(4594, function () {
	console.log('Server started!');
});
