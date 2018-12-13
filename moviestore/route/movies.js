var movieModel = require('../model/movies');


function searchMovies(req,res,movieCollection,filter){
  console.log(filter);
  if(filter === ''){
    movieModel.getMoviesList(movieCollection)
    .then(data =>{
      let result = data;
      if(typeof result === 'undefined'){
         throw new Error("Undefined...Error encounterd in getMoviesList");
      }
      if(typeof result !== 'undefined' && result.length <= 0){
        console.log(" no movies present ");
        return res.render('moviessearch',{"title":"movies collection","mList":[],"message":"No movies in the Collection...","userid":req.query.id});
      }
      if(typeof result !== 'undefined' && result.length > 0){
        console.log(" movies in collection..."/*+JSON.stringify(result)*/);
        return res.render('moviessearch',{"title":"movies collection","mList":result,"userid":req.query.id,"mListStr":JSON.stringify(result)});
      }
    })
    .catch(error =>{
        console.log("error in searchmovies ");
        return res.render('error',error.message);
    });
 }else{
   movieModel.getMoviesListByID(movieCollection,filter)
   .then(data =>{
     console.log('**'+JSON.stringify(data));
     const resultByid = data;
     if(typeof resultByid === 'undefined'){
        throw new Error("Undefined...Error encounterd in getMoviesListByID");
     }

     if(typeof resultByid !== 'undefined' && resultByid.length > 0){
       console.log(" moviesbyid in collection..."+JSON.stringify(resultByid));
       return {"error":{"code":0,"message":"Success"},resultByid};
     }
   })
   .then(data =>{
     const resultset = data;
     if(typeof resultset === 'undefined'){
        throw new Error("Undefined...Error encounterd in getMoviesListByID 2");
     }
     if(typeof resultset !== 'undefined' && resultset.length > 0){
       console.log(" 2 moviesbyid in collection..."+JSON.stringify(resultset));
       return {"error":{"code":0,"message":"Success"},resultset};
     }
   })
   .catch(error =>{
       console.log("error in searchmovies ");
       throw error;
   });
 }

}

function insertMovies(req,res,movieCollection,filter){
  movieModel.getMoviesListByID(movieCollection,filter)
  .then(data =>{
    console.log('**'+JSON.stringify(data));
    const moviesSelected = data;
    if(typeof moviesSelected === 'undefined'){
       throw new Error("Undefined...Error encounterd in getMoviesListByID");
    }
    if(typeof moviesSelected !== 'undefined' && JSON.stringify(moviesSelected).length == 2){
      console.log(" no movies selected..."+JSON.stringify(moviesSelected));
      return {"error":{"code":1,"message":"No movies selected"},"moviesSelected":moviesSelected};
    }
    if(typeof moviesSelected !== 'undefined' && moviesSelected.length > 0){
      console.log(" moviesbyid in collection..."+JSON.stringify(moviesSelected));
      return {"error":{"code":0,"message":"Success"},"moviesSelected":moviesSelected};
    }
  })
  .then(data =>{
     const resultset = data;
     if(typeof resultset !== 'undefined' && resultset.error.code === 0){

     }else if(typeof resultset !== 'undefined' && resultset.error.code === 1){

     }
  })
  .catch(error =>{
      console.log("error in searchmovies ");
      throw error;
  });
}

module.exports.searchMovies = searchMovies;
module.exports.insertMovies = insertMovies;
