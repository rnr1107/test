var express = require('express');
var app = express();
var parser = require('body-parser');
var MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
userRoute = require('./route/user'),
movieRoute = require('./route/movies');

var mongoClient = new MongoClient(new Server('localhost',27017),{'native_parser':true});
var dbTest,dbMovies;
app.set('view engine', 'jade');
app.set('views', __dirname + "/view");
app.use(parser.json());
var urlencodedParser = parser.urlencoded({ extended: false })

mongoClient.connect(function(err, mongoClient) {

    if(err) throw err;
    dbTest = mongoClient.db('test');
    dbMovies =mongoClient.db('video');
    console.log("Successfully connected to MongoDB - test database.");

    app.route('/').get((req,res)=>{res.render('home',{"title":"Welcome to Movie Store"})});
    app.route('/login').get((req,res)=>{res.render('login',{"title":"Login to Movie Store"})});
    app.route('/login').post(urlencodedParser,(req,res)=>{
      let formDetail = {};
      formDetail.uname = req.body.username;
      formDetail.password = req.body.pwd;
      formDetail.email = req.body.emailid;
      formDetail.age = req.body.age;
      console.log('in login post ...'+JSON.stringify(formDetail));

      userRoute.validateUser(req,res,dbTest.collection('movieappusers'),formDetail);
    });

    app.route('/signup').get((req,res)=>{res.render('signup',{"title":"Signup to Movie Store"})});
    app.route('/signup').post(urlencodedParser,(req,res)=>{
      let formDetail = {};
      formDetail.uname = req.body.username;
      formDetail.password = req.body.pwd;
      formDetail.email = req.body.emailid;
      formDetail.age = req.body.age;
      formDetail.moviesregistered = [];
      console.log('in signup post ...'+JSON.stringify(formDetail));

      userRoute.registerUser(req,res,dbTest.collection('movieappusers'),formDetail);
    });
    app.route('/search').get((req,res) =>{
      console.log('in search get ...');
      movieRoute.searchMovies(req,res,dbMovies.collection('movieDetails'),'');
    });
    app.route('/search').post(urlencodedParser,(req,res)=>{
      let moviedetails = req.body.elemvar;
      let moviedetailsarr=[];
      let moviedetailsjson={};
      var moviedetailsvar = moviedetails.split('~,');
      for(var i=0;i<moviedetailsvar.length;i++){
      //  console.log(moviedetailsvar[i]);
        var innerstr = moviedetailsvar[i].split("_");
        if(innerstr.length === 6){
          let moviedetailsarrelem = {};
          moviedetailsarrelem["title"] = innerstr[0];
          moviedetailsarrelem["year"] = innerstr[1];
          moviedetailsarrelem["rated"] = innerstr[2];
          moviedetailsarrelem["runtime"] = innerstr[3];
          moviedetailsarrelem["director"] = innerstr[4];
          moviedetailsarrelem["info"] = innerstr[5].substring(0,innerstr[5].indexOf("~"));
          moviedetailsarr.push(moviedetailsarrelem);
        }
      }
      moviedetailsjson["moviesregistered"]=moviedetailsarr;
      //console.log(JSON.stringify(moviedetailsjson));

      let formDetail = {};
      formDetail.moviedetails=moviedetailsjson;
      formDetail.userid=req.body.userid;
      console.log(formDetail.moviedetails);
      console.log(formDetail.userid);

    //  movieRoute.searchMovies(req,res,dbMovies.collection('movieDetails'),formDetail.movieimdbids);
      userRoute.displayMoviesToUser(req,res,dbTest.collection('movieappusers'),formDetail);



    });

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log("Express server listening on port %s.", port);
    });
});
