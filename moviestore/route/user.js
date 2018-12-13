

var userModel = require('../model/user');

/*
POST /signup request
*/
async function registerUser(req,res,userCollection,userDetail){
  console.log('hello in registerUser'+JSON.stringify(userDetail));
  let  data;
  await userModel.findByName(userCollection,userDetail)
  .then(data => {
    const validuserdetails = data;
    console.log(" found by name in registerUser??" +validuserdetails);
    if(typeof validuserdetails === 'undefined'){
       throw new Error("Undefined...Error encounterd");
    }
    if(typeof validuserdetails !== 'undefined' && validuserdetails.length <= 0){
      console.log(" user not present... need to create ??");
      return {"error":{"message":"Create","code":0}};
    }
    if(typeof validuserdetails !== 'undefined' && validuserdetails[0].password === userDetail.password){
      console.log(" user exists...");
      return {"error":{"message":"User alreaady registered. Login with the credentails","code":1}};
    }
  })
  .then((data) =>{
    const returnmessage = data;
    if(returnmessage.error.message === "Create"){
      console.log("matched Create");
      return userModel.create(userCollection,userDetail);
    }
    if(returnmessage.error.code === 1){
      console.log("matched existing");
      throw new Error(returnmessage.error.message);
    }
  })
  .then(data =>{
    const resultSet = data;
    if(resultSet.result.ok === 1 && resultSet.insertedCount === 1){
     console.log("record creation success");
     return res.render('userSpace',{"title":"Profile","uname":resultSet.ops[0].uname,"email":resultSet.ops[0].email,'mList':[],'message':'Please register for movies. Use search link'});
   }else{
     console.log("record creation failed");
     throw new Error("Error !!! Unable to insert the record ");
   }
  })
  .catch(error =>{
    console.log("catch of registerUser "+error);
    return res.render('error',{"title":"Error","message":error.message});
  });

}



/*
POST /login request
*/
async function validateUser(req,res,userCollection,userDetail){
console.log('in validateuser'+JSON.stringify(userDetail));

  await userModel.findByName(userCollection,userDetail)
  .then(data =>{
    let result = data;
    console.log(" found by name in validateUser ??" +result);
    if(typeof result === 'undefined'){
       throw new Error("Undefined...Error encounterd");
    }
    if(typeof result !== 'undefined' && result.length <= 0){
      console.log(" user not present... need to signup first");
      throw new Error("User doesn't exist. Please register");
      //return {"error":{"message":"User doesn't exist. Please register","code":1}};
    }
    if(typeof result !== 'undefined' && result[0].password === userDetail.password){
      console.log(" user credentails match...");
      return userModel.getMoviesRegisteredByUser(userCollection,userDetail.uname);
    //  res.render('userSpace',{"title":"Profile","email":result[0].email,"uname":result[0].uname,mList:[]});
    }
  })
  .then(data =>{
      console.log(data);
      moviesresult = data;
      if(typeof moviesresult === 'undefined'){
         throw new Error("Undefined...Error encounterd while retrieving movies for user");
      }
      if(typeof moviesresult !== 'undefined' && moviesresult[0].moviesregistered.length <= 0){
        console.log(" No movies added by the user ");
        return res.render('userSpace',{"title":"Profile","email":moviesresult[0].email,"uname":moviesresult[0].uname,mList:moviesresult[0].moviesregistered,"message":"No movies registered. Please register by clicking on the link Search"});
      }
      if(typeof moviesresult !== 'undefined' && moviesresult[0].moviesregistered.length >= 0){
        console.log(" user has  added movies..");
        return res.render('userSpace',{"title":"Profile","email":moviesresult[0].email,"uname":moviesresult[0].uname,"message":"",mList:moviesresult[0].moviesregistered});
      }
  })
  .catch(error =>{
    console.log("catch of validateuser "+error);
    return res.render('error',{"title":"Error","message":error.message});
  });
}

async function displayMoviesToUser(req,res,userCollection,inputDetails){
  //insert movie ids in userdetails table
  console.log('displayMoviesToUser :: '+JSON.stringify(inputDetails));
  for(var k=0;k<inputDetails.moviedetails.moviesregistered.length;k++){
      var toUpdate={};
      toUpdate['userid'] = inputDetails.userid;
      toUpdate['moviesregistered'] = inputDetails.moviesregistered[k];
      userModel.update(userCollection,toUpdate)
      .then( data =>{
        console.log(" in then of displayMoviesToUser "+JSON.stringify(data));
        if(data["nModified"] > 0 && k <inputDetails.moviesregistered.length-1){
          console.log("data updated ");
        }
        else if(data["nModified"] > 0 && k === inputDetails.moviesregistered.length-1){
          console.log(" in then of displayMoviesToUser ");
          return res.render('userSpace',{"title":"Profile","email":'',"uname":inputDetails.userid,"message":"",mList:inputDetails.moviesregistered});
        }
      }).catch(error=>{
        console.log("catch of displayMoviesToUser for  "+toUpdate['moviesregistered']+" with error "+error);

      });
  }
/*  userModel.update(userCollection,inputDetails)
  .then( data =>{
    console.log(" in then of displayMoviesToUser "+JSON.stringify(data));
    if(typeof data === 'undefined'){
       throw new Error("Undefined...Error encounterd while retrieving movies for user");
    }

    if(typeof data !== 'undefined' && data[0].moviesregistered.length >= 0){
      console.log(" in then of displayMoviesToUser ");
      return res.render('userSpace',{"title":"Profile","email":data[0].email,"uname":data[0].uname,"message":"",mList:data[0].moviesregistered});
    }
      //display all the movies registered by user
      return userModel.getMoviesRegisteredByUser(userCollection,userDetail.uname);
  })
  .catch(error=>{
    console.log("catch of displayMoviesToUser "+error);
    return {'error':{"message":"No movies Registered","code":1}};
  });
*/
}
module.exports.displayMoviesToUser = displayMoviesToUser;
module.exports.validateUser = validateUser;
module.exports.registerUser = registerUser;
