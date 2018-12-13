
async function findByName(userCollection,userDetails){
  console.log("in findbyname"+JSON.stringify(userDetails));
  return await userCollection.find({'uname':userDetails.uname}).toArray();
//  console.log(result);
//  return result;
 }

async function create(userCollection,userDetails){
    return await userCollection.insert(userDetails);
}

async function getMoviesRegisteredByUser(userCollection,rname){
  console.log("in getMoviesRegisteredByUser"+rname);
  return await userCollection.find({'uname':rname},{uname:1,email:1,moviesregistered:1,_id:0}).toArray();
}

async function update(userCollection,userDetails){
    return await userCollection.update({'uname':userDetails.userid},{$set:{"moviesregistered":userDetails.moviedetails}});
}

module.exports.findByName = findByName;
module.exports.create = create;
module.exports.update = update;
module.exports.getMoviesRegisteredByUser = getMoviesRegisteredByUser;
