const bcrypt  = require('bcrypt');
var assert = require('assert');
var bcrypt2 = require('bcrypt');

// Ajout Utilisateur DB

var insertDocument = function(body, db, callback) {
  var userdata;
db.collection('membres').insertOne( {
      "username" : body.username,
      "pass" : body.pass,
      "mail" : body.mail,
      "nom" : body.nom,
      "prenom" : body.prenom,
      "sexe" : body.sexe,
      "orient" : body.orient,
      "tags" : body.tags,
      "pics" : body.pics
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Utilisateur ajouté à la DB avec succès");
  });
  userdata  = {
      "username" : body.username,
      "mail" : body.mail,
      "nom" : body.nom,
      "prenom" : body.prenom,
      "sexe" : body.sexe,
      "orient" : body.orient,
      "tags" : body.tags,
      "pics" : body.pics
  };
  callback(userdata);
};

var findUsername2 = async function(username, db, callback) {
  var index = 0;
  var cursor =db.collection('membres').find( { "username": username } );
  while(await cursor.hasNext()) {
    const doc = await cursor.next();
    index = index + 1;
  }
  callback(index);
};

var addUser = function(body, MongoClient, url, callback) {
  bcrypt.hash(body.pass, 10, function(err, hash) {
    body.pass = hash;
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      findUsername2(body.username, db, function(index) {
        if (index > 0)
        {
          callback();
        }
        else
        {
          insertDocument(body, db, function(userdata) {
            db.close();
            console.log("Userdata : " + userdata);
            callback(userdata);
          });
        }
      });
    });
  });
};

//Login Utilisateur

var findUsername = async function(body, db, callback) {
  var userdata;
  var cursor = db.collection('membres').findOne( { "username": body.username } , function (err, result) {
    console.log ("Result : " + result)
    if (result != null)
    {
      bcrypt.compare(body.password, result.pass).then(function(res) {
        console.log("RES : " + res);
        userdata = result;
        if (res == true)
        {
          callback(userdata);
        }
        else
        {
          callback(null);
        }
      });
    }
    else
    {
      callback(null);
    }
    db.close();
  });
};


function checkUser (body, MongoClient, url, callback) {
  MongoClient.connect(url, function(err, db)
  {
    assert.equal(null, err);
    findUsername(body, db, function(userdata) {
       // db.close();
        callback(userdata);
    });
  });
};

module.exports.addUser = addUser; 
module.exports.checkUser = checkUser;   
