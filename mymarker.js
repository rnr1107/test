var express = require('express'),
    parser = require('body-parser'),
    //nunjucks = require('nunjucks'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    assert = require('assert'),
  //  passport = require('passport'),
    crypto = require('crypto'),
    db,
    //ItemDAO = require('./items').ItemDAO;
  //  CartDAO = require('./cart').CartDAO;
    employeeDAO = require('./DAO/employee').employeeDAO;
    //const LocalStrategy = require('passport-local').Strategy;

    // Set up express
    app = express();
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views/jade');
    app.use('/static', express.static(__dirname + '/static'));
  //  app.use(passport.initialize());
  //  app.use(passport.session());

    //app.use(bodyParser.urlencoded({ extended: true }));
    app.use(parser.json());
    var urlencodedParser = parser.urlencoded({ extended: true })

    var mongoConnection = new MongoClient(new Server('localhost',27017),{'native_parser':true});

    mongoConnection.connect(function(err,mongoConnection){
      db = mongoConnection.db('attnmarker');
      assert.equal(null, err);
      console.log("Successfully connected to MongoDB - ALM.");

      var employeedao = new employeeDAO(db.collection('trackerUsers'));
    //  var items = new ItemDAO(db.collection('item'));
    //  var cart = new CartDAO(db.collection('cart'));
      assert.equal(null, err);


/*
      passport.use(new LocalStrategy(
        function(username, password, done) {
          console.log('in LocalStrategy method');
          console.log(username);
            employeedao.getEmployee(username,function(employee){
            console.log('in callback of getEmployee');
            console.log(employee);

            if(employee === 0){//no user exists
              console.log("employee not exists");
              return done(null, false);
            }
            if(employee == null){//error
              return done(new Error("database error"));
            }
            decryptedPwd =  employeedao.decrypt(employee.password,employee.fname+employee.lname);
            if (decryptedPwd != password) {
              console.log("wrong password");
              return done(null, false);
            }
              return done(null, employee);
          });
        }
      ));

*/
  app.route('/').get((req,res)=>{
    res.render('trackerhome',{"title":"Welcome to ALM",'err_message':'','message':''});
  });
/*
  passport.serializeUser(function(employee, cb) {
    cb(null, employee._id);
  });

  passport.deserializeUser(function(username, cb) {
    employeedao.getEmployee(username, function(err, employee) {
      cb(err, employee);
    });
  });

  app.route('/login').post(urlencodedParser,
      passport.authenticate('local'),function(req,res){
        console.log('in login success method');
          console.log(req.user);
          res.redirect('/myhome?username='+req.user.username+'&user_role='+req.user.userrole);
    }
  );
*/
app.route('/register').get((req,res)=>{
  res.render('register',{"title":"Welcome to ALM",'error_message':'','message':''});
});

app.route('/register').post(urlencodedParser,(req,res)=>{
  console.log("in registration page");
  var userDetails={};
  userDetails._id='';
  userDetails.fname =req.body.fname;
  userDetails.lname =req.body.lname;
  userDetails.userid =req.body.userid;
  userDetails.password =req.body.password;
  userDetails.email =req.body.email;
  console.log(userDetails);
  employeedao.create(userDetails,function(userInserted){
    console.log(userInserted);
    if(userInserted.message === 0)
      res.render('userhome',{"title":"Welcome to ALM",'user':userInserted.user,'message':'Registration successful. Please signin','error_message':''});
    else {
      if(userInserted.message === 1 ||
      userInserted.message === 2 || userInserted.message === 3   ){
        res.render('register',{"title":"Welcome to ALM",'error_message':'Already registered. Please login','message':''});
      }else if(userInserted.message === -1){
        res.redirect('/error?Technical_Error');
      }

    }
  })

});

app.route('/login').post(urlencodedParser,(req,res)=>{
     const userid = req.body.userid;
     const password = req.body.password;
     employeedao.getByID(userid,false,function(employee){
     console.log('in callback of getByID');
     console.log(employee);

     if(employee === 0){//no user exists
       console.log("employee not exists");
       res.status(409);
      return res.render('trackerhome',{'err_message':'Authentication failed','message':''});
     }
     if(employee == null){//error
       res.status(409);
      return res.render('trackerhome',{'err_message':'Authentication failed','message':''});
     }
     decryptedPwd =  employeedao.decipher(employee.password,employee.fname+employee.lname);
     if (decryptedPwd != password) {
       console.log("wrong password");
       res.status(409);
       returnres.render('trackerhome',{'err_message':'Authentication failed','message':''});
     }
     res.status(200);
    return res.redirect('userhome/'+employee._id);
   });

});
  app.route('/error').get((req, res) => res.render('error',{'message':req.query.error_message}));

  app.route('/logout').get((req, res) => {
    //var username = req.user._id;
    req.logout();
    res.render('trackerhome',{"title":"Welcome to Tracker",'message':'You have logged out successfully','error_message':''})
  });

  app.route('/userhome/:id').get((req,res)=>{
        var id = req.params.id ? req.params.id : 'anonymous';
        var employee_details = {'basic':{'name':'','email':'','age':'','doj':''},'roles':[],'types':[],'userid':''};

        console.log(id);
        employeedao.getByID(id,true,(employeeDetails)=>{
          if(employeeDetails != undefined){
            employee_details.roles = employeeDetails.roles;
            employee_details.userid = employeeDetails.userid;
            employeedao.getAllLeaves(id,db.collection('userLeaves'),(result)=>{
              console.log(result);
              if(result !== undefined) {
                employee_details.types = result[0].types;
                employee_details.basic['name'] = employeeDetails.fname+' '+employeeDetails.lname;
                employee_details.basic['age'] = employeeDetails.age;
                employee_details.basic['email'] = employeeDetails.email;
                employee_details.basic['doj'] = employeeDetails.doj
              }

                res.render('userhome', { user_roles: employee_details.roles,
                                         userid: employeeDetails.userid,
                                         myLeaves:employee_details.types,
                                         leaveTypes:['CL','EL','SL'],
                                         myBasicDetails:employee_details.basic});
          });//end of getleaves
        }//end of if
    });//end of getByID

  });//end of get userhome

app.route('/apply').post(urlencodedParser,(req,res)=>{
    const userid = req.body.userid;
    const reason = req.body.reason;
    const type = req.body.ltype;
});//end of post apply


/*
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
*/

  // Start the server listening
  var server = app.listen(2000, function() {
      var port = server.address().port;
      console.log('ALM server listening on port %s.', port);
  });
});//end of connect
