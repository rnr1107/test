var crypto = require('crypto'),
    assert = require('assert');



function employeeDAO(database) {

  function encrypt(stringToEncrypt,stringToUseAsKey){
    console.log('in encrypt');
    var key = crypto.createCipher('aes256', stringToUseAsKey);
    var encryptedVal = key.update(stringToEncrypt,'utf8','hex') +key.final('hex');
    console.log(encryptedVal);
    return encryptedVal;
  }

  function decrypt(stringToDecrypt,stringToUseAsKey){
    console.log('in decrypt');
    var key = crypto.createDecipher('aes256', stringToUseAsKey);
    var decryptedValue = key.update(stringToDecrypt,'hex','utf8') + key.final('utf8');
    return decryptedValue;
  }

  this.decipher = function (stringToDecrypt,stringToUseAsKey){
    return decrypt(stringToDecrypt,stringToUseAsKey)
  }
  this.getByID = function(userid,isencrypted,callback){
    console.log('in getByID method');
    console.log(userid);
    var queryVal = userid;
    if(!isencrypted){
      queryVal = encrypt(userid,userid);
    }
    var result = database.find({'_id':queryVal}).toArray();
    result.then(data=>{
      console.log(data);
      callback((data.length < 1 )?0:data[0]);
    })
    .catch(error =>{
      console.log('getByID error');
      console.log(error);
      callback(null);
    });
  }

  this.create = function(userDetails,callback){
    var userExists = this.getByID(userDetails.userid,function(data){
      if(data === 0){
         console.log('new user');
         console.log(userDetails);
          console.log(userDetails.userid);
         userDetails._id = encrypt(userDetails.userid,userDetails.userid);
         //console.log(userDetails);
         userDetails.password = encrypt(userDetails.password,userDetails.fname+userDetails.lname);
         console.log(userDetails);

         var result = database.insert(userDetails);
         result.then(data=>{
           console.log(data);
           if(data.result.ok == 1 && data.result.n == 1)
            callback({message:0,user:userDetails.userid});
           else {
               callback({message:-1,user:userDetails.userid});
           }
         })
         .catch(error=>{
           console.log('error while creating new user');
           callback({message:-1,user:userDetails.userid});
         })
      }else if (data != null){//user exists
        var decryptedusername =   decrypt(data._id,userDetails.userid);
        var decryptedPwd =   decrypt(data.password,data.fname+data.lname);
        if(data.userid === decryptedusername && data.fname === userDetails.fname
        && data.lname === userDetails.lname && data.email === userDetails.email
        && userDetails.password === decryptedPwd ){
          console.log("User exists");
          callback({message:1,user:userDetails.username});
        }else if(data.userid === decryptedusername && data.fname === userDetails.fname
        && data.lname === userDetails.lname && userDetails.password === decryptedPwd){
          console.log("User details present with different email id");
          callback({message:2,user:userDetails.userid});
        }else{
          console.log("User details present with same username");
          callback({message:3,user:userDetails.userid});
        }
      }else{//error
        console.log("error ");
        callback({message:-1,user:userDetails.userid});
      }

    });
  }

  this.getAllLeaves = (id,dbLeaves,callback)=>{
    console.log('in getallleaves');
    var result = dbLeaves.find({'_id':id,'year':new Date().getFullYear()}).toArray();
    result.then(data=>{
      console.log(data);
      callback((data !== undefined)?data:[]);
    })
    .catch(error =>{
      console.log('getAllLeaves error');
      console.log(error);
      callback(null);
    });
  }

}
module.exports.employeeDAO = employeeDAO;
