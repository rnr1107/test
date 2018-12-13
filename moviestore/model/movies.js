
async function getMoviesList(movieCollection){
  console.log("in getMoviesList");
  return await movieCollection.find({}).limit(10).toArray();
}

async function getMoviesListByID(movieCollection,filter){
  //var expr = {'imdb.id':'tt2017561'};
  var expr = {"imdb.id":filter};
  console.log(filter+ " in getMoviesListByID "+JSON.stringify(expr));
  return result = await movieCollection.find(expr).toArray();

}

 module.exports.getMoviesList = getMoviesList;
 module.exports.getMoviesListByID = getMoviesListByID;
