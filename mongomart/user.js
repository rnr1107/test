var crypto = require('crypto'),
    assert = require('assert');



function UserDAO(database) {

  this.findUser = function(username,callback){
    console.log('in findUser method');
    console.log(username);
    var queryVal = this.encrypt(username,username);
    var result = database.find({'_id':queryVal}).toArray();
    result.then(data=>{
      console.log(data);
      callback((data[0] === undefined )?0:data[0]);
    })
    .catch(error =>{
      console.log('CartDAO error');
      console.log(error);
      callback(null);
    });
  }

  this.createUser = function(userDetails,callback){
    var userExists = this.findUser(userDetails.username,function(data){
      if(data === 0){
         console.log('new user');
         userDetails._id = this.encrypt(userDetails.username,userDetails.username);
         //console.log(userDetails);
         userDetails.password = this.encrypt(userDetails.password,userDetails.fname+userDetails.lname);
         console.log(userDetails);

         var result = database.insert(userDetails);
         result.then(data=>{
           console.log(data);
           if(data.result.ok == 1 && data.result.n == 1)
            callback({message:0,user:userDetails.username});
           else {
               callback({message:-1,user:userDetails.username});
           }
         })
         .catch(error=>{
           console.log('error while creating new user');
           callback({message:-1,user:userDetails.username});
         })
      }else if (data != null){//user exists
        var decryptedusername =   this.decrypt(data._id,userDetails.username);
        var decryptedPwd =   this.decrypt(data.password,data.fname+data.lname);
        if(data.username === decryptedusername && data.fname === userDetails.fname
        && data.lname === userDetails.lname && data.email === userDetails.email
        && userDetails.password === decryptedPwd ){
          console.log("User exists");
          callback({message:1,user:userDetails.username});
        }else if(data.username === decryptedusername && data.fname === userDetails.fname
        && data.lname === userDetails.lname && userDetails.password === decryptedPwd){
          console.log("User details present with different email id");
          callback({message:2,user:userDetails.username});
        }else{
          console.log("User details present with same username");
          callback({message:3,user:userDetails.username});
        }
      }else{//error
        console.log("error ");
        callback({message:-1,user:userDetails.username});
      }

    });
  }

  this.encrypt = function(stringToEncrypt,stringToUseAsKey){
    console.log('in encrypt');
    var key = crypto.createCipher('aes256', stringToUseAsKey);
    var encryptedVal = key.update(stringToEncrypt,'utf8','hex') +key.final('hex');
  //  console.log(encryptedVal);
    return encryptedVal;
  }

  this.decrypt = function(stringToDecrypt,stringToUseAsKey){
    console.log('in decrypt');
    var key = crypto.createDecipher('aes256', stringToUseAsKey);
    var decryptedValue = key.update(stringToDecrypt,'hex','utf8') + key.final('utf8');
    return decryptedValue;
  }
}
module.exports.UserDAO = UserDAO;
