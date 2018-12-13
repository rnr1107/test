var express = require('express'),
    parser = require('body-parser'),
    //nunjucks = require('nunjucks'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    assert = require('assert'),
    passport = require('passport'),
    crypto = require('crypto'),
    db,
    ItemDAO = require('./items').ItemDAO;
    CartDAO = require('./cart').CartDAO;
    UserDAO = require('./user').UserDAO;
    const LocalStrategy = require('passport-local').Strategy;

    // Set up express
    app = express();
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.use('/static', express.static(__dirname + '/static'));
    app.use(passport.initialize());
    app.use(passport.session());

    //app.use(bodyParser.urlencoded({ extended: true }));
    app.use(parser.json());
    var urlencodedParser = parser.urlencoded({ extended: true })
    var USERID = "558098a65133816958968d88";
    var mongoConnection = new MongoClient(new Server('localhost',27017),{'native_parser':true});

    mongoConnection.connect(function(err,mongoConnection){
      db = mongoConnection.db('mongomart');
      assert.equal(null, err);
      console.log("Successfully connected to MongoDB - mongomart.");

      var users = new UserDAO(db.collection('users'));
      var items = new ItemDAO(db.collection('item'));
      var cart = new CartDAO(db.collection('cart'));
      assert.equal(null, err);



      passport.use(new LocalStrategy(
        function(username, password, done) {
          console.log('in LocalStrategy method');
          console.log(username);
            users.findUser(username,function(registeredUser){
            console.log('in callback of finduser');
            console.log(registeredUser);

            if(registeredUser === 0){//no user exists
              console.log("user not exists");
            //  registeredUser={'error_message':'User Not Found'};
              return done(null, false);
            }
            if(registeredUser == null){//error
              return done(new Error("database error"));
            }
            decryptedPwd =  users.decrypt(registeredUser.password,registeredUser.fname+registeredUser.lname);
            if (decryptedPwd != password) {
              console.log("wrong password");
              return done(null, false);
            }
              return done(null, registeredUser);
          });
        }
      ));


  app.route('/').get((req,res)=>{
    res.render('home',{"title":"Welcome to Mongo Mart",'error_message':'','message':''});
  });

  passport.serializeUser(function(user, cb) {
    cb(null, user._id);
  });

  passport.deserializeUser(function(username, cb) {
    users.findUser(username, function(err, user) {
      cb(err, user);
    });
  });

  app.route('/register').get((req,res)=>{
    res.render('register',{"title":"Welcome to Mongo Mart",'error_message':'','message':''});
  });

  app.route('/login').post(urlencodedParser,
      passport.authenticate('local'),function(req,res){
        console.log('in success method');
          console.log(req.user);
          res.redirect('/usershop?username='+req.user.username);
    }
  );

  app.route('/register').post(urlencodedParser,(req,res)=>{
    console.log("in register page");
    var userDetails={};
    userDetails.fname =req.body.fname;
    userDetails.lname =req.body.lname;
    userDetails.username =req.body.username;
    userDetails.password =req.body.password;
    userDetails.email =req.body.email;
    console.log(userDetails);
    users.createUser(userDetails,function(userInserted){
      console.log(userInserted);
      if(userInserted.message === 0)
        res.render('home',{"title":"Welcome to Mongo Mart",'user':userInserted._id,'message':'Registration successful. Please signin','error_message':''});
      else {
        if(userInserted.message === 1){
          res.render('register',{"title":"Welcome to Mongo Mart",'error_message':'User found with matching details','message':''});
        }else if(userInserted.message === 2){
          res.render('register',{"title":"Welcome to Mongo Mart",'error_message':'User found with matching name and username','message':''});
        }else if(userInserted.message === 3){
          res.render('register',{"title":"Welcome to Mongo Mart",'error-message':'Username already taken. Please choose another one','message':''});
        }else if(userInserted.message === -1){
          res.redirect('/error?Technical_Error');
        }

      }
    })

  });

  app.route('/error').get((req, res) => res.render('error',{'message':req.query.error_message}));

  app.route('/logout').get((req, res) => {
    //var username = req.user._id;
    req.logout();
    res.render('home',{"title":"Welcome to Mongo Mart",'message':'You have logged out successfully','error_message':''})
  });

  app.route('/usershop').get((req,res)=>{
    var page = req.query.page ? parseInt(req.query.page) : 0;
    var category = req.query.category ? req.query.category : "All";
    var username = req.query.username ? req.query.username : 'anonymous';
    console.log(page);
    console.log(category);
    console.log(username);

    items.getCategories(function(categories) {
      //console.log(categories);
        items.getItems(category, page, 5, function(pageItems) {
        //  console.log(pageItems);
           items.getNumItems(category, function(itemCount){
            // console.log(itemCount);
             var numPages = 0;
             if (itemCount > 5) {
                 numPages = Math.ceil(itemCount / 5);
             }
             var pageOrderArr = [];
             if(numPages == 0){
                pageOrderArr.push(numPages);
             }else{
               for(var i=0;i<numPages;i++){
                 pageOrderArr.push(i);
               }
            }
            console.log(itemCount);
            res.render('usershop', { category_param: category,
                             categories: categories,
                             useRangeBasedPagination: false,
                             itemCount: itemCount,
                             pages: pageOrderArr,
                             page: page,
                             items: pageItems,
                             username: username });
        });//end of getNumItems
      });//end of getitems
   });//end of getcategories
  }); //end of get

  app.route('/search').get((req,res)=>{
    var page = req.query.page ? parseInt(req.query.page) : 0;
    var query = req.query.query ? req.query.query : "";
    var pageOrderArr=[];
    items.searchItems(query, page, 5, function(searchItems) {
        //console.log(searchItems);
        items.getNumSearchItems(query, function(itemCount) {
            var numPages = 0;
          //  console.log(itemCount);
            if (itemCount > 5) {
                numPages = Math.ceil(itemCount / 5);
            }
            var pageOrderArr = [];
            if(numPages == 0){
               pageOrderArr.push(numPages);
            }else{
              for(var i=0;i<numPages;i++){
                pageOrderArr.push(i);
              }
           }

            res.render('search', { queryString: query,
                                   itemCount: itemCount,
                                   pages: pageOrderArr,
                                   page: page,
                                   items: searchItems });

        });//end of searchNumItems
    });//end of searchitems
  });

  app.route("/item/:itemId").get((req, res)=> {
      var itemId = parseInt(req.params.itemId);
    //  console.log(itemId);
      items.getItem(itemId, function(item) {
    //      console.log(item);

          if (item == null) {
              res.status(404).send("Item not found.");
              return;
          }

          var stars = 0;
          var numReviews = 0;
          var reviews = [];

          if ("reviews" in item) {
              numReviews = item.reviews.length;
            //  console.log(numReviews);
              for (var i=0; i<numReviews; i++) {
                  var review = item.reviews[i];
                  item.reviews[i].date = new Date(review.date);
                  stars += review.stars;
              }
              //console.log(stars);
              if (numReviews > 0) {
                  stars = stars / numReviews;
                  reviews = item.reviews;
                  //console.log(reviews);
              }
              //console.log(stars);
          }

          items.getRelatedItems(function(relatedItems) {

              //console.log(relatedItems);
              res.render("item",
                         {
                             userId: USERID,
                             item: item,
                             stars: stars,
                             reviews: reviews,
                             numReviews: numReviews,
                             relatedItems: relatedItems
                         });
          });
      });
  });

  app.route("/item/:itemId/reviews").post(urlencodedParser, (req, res) =>{
      "use strict";

      var itemId = parseInt(req.params.itemId);
      var review = req.body.review;
      var name = req.body.name;
      var stars = parseInt(req.body.stars);
      //console.log(itemId);
    //  console.log(review);
      //console.log(name);
    //  console.log(stars);

      items.addReview(itemId, review, name, stars, function(itemDoc) {
          res.redirect("/item/" + itemId);
      });
  });

  app.route("/cart").get((req, res) =>{

      res.redirect("/user/" +req.query.profile+ "/cart");
  });

  app.route("/user/:userId/cart").get((req, res)=> {
      "use strict";

      var userId = req.params.userId;
      cart.getCart(userId, function(userCart) {
        var total =0;
        console.log(userCart);
        if(userCart.items.length != 0)
          total = cartTotal(userCart);
        //  console.log(total);
          res.render("cart",
                     {
                         userId: userId,
                         updated: false,
                         cart: userCart,
                         total: total
                     });
      });
  });

  function cartTotal(userCart) {
      "use strict";

      var total = 0;
      for (var i=0; i<userCart.items.length; i++) {
          var item = userCart.items[i];
          total += item.price * item.quantity;
      }

      return total;
  }

  app.route("/user/:userId/cart/items/:itemId").post(urlencodedParser,(req, res) =>{
      "use strict";

      var userId = req.params.userId;
      var itemId = parseInt(req.params.itemId);
      console.log(userId);
      console.log(itemId);
      var renderCart = function(userCart) {
          var total = cartTotal(userCart);
          res.render("cart",
                     {
                         userId: userId,
                         updated: true,
                         cart: userCart,
                         total: total
                     });
      };

      cart.itemInCart(userId, itemId, function(item) {
          if (item == null) {
              console.log('adding new item');
              items.getItem(itemId, function(item) {
                  item.quantity = 1;
                  cart.addItem(userId, item, function(userCart) {
                      renderCart(userCart);
                  });

              });
          } else {
            console.log('updating existing item');
            console.log(itemId);
            console.log(item);
              cart.updateQuantity(userId, itemId, item.quantity+1, function(userCart) {
                  renderCart(userCart);
              });
          }
      });
  });

  app.route("/user/:userId/cart/items/:itemId/quantity").post(urlencodedParser,(req, res) =>{
      "use strict";

      var userId = req.params.userId;
      var itemId = parseInt(req.params.itemId);
      var quantity = parseInt(req.body.quantity);

      cart.updateQuantity(userId, itemId, quantity, function(userCart) {
          var total = cartTotal(userCart);
          res.render("cart",
                     {
                         userId: userId,
                         updated: true,
                         cart: userCart,
                         total: total
                     });
      });
  });


  // Start the server listening
  var server = app.listen(3000, function() {
      var port = server.address().port;
      console.log('Mongomart server listening on port %s.', port);
  });
});
