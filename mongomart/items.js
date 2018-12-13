/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    //"use strict";

    //var db = database.collection('item');

    this.getCategories = function(callback) {
      //  "use strict";

        /*
        * TODO-lab1A
        *
        * LAB #1A: Implement the getCategories() method.
        *
        * Write an aggregation query on the "item" collection to return the
        * total number of items in each category. The documents in the array
        * output by your aggregation should contain fields for "_id" and "num".
        *
        * HINT: Test your mongodb query in the shell first before implementing
        * it in JavaScript.
        *
        * In addition to the categories created by your aggregation query,
        * include a document for category "All" in the array of categories
        * passed to the callback. The "All" category should contain the total
        * number of items across all categories as its value for "num". The
        * most efficient way to calculate this value is to iterate through
        * the array of categories produced by your aggregation query, summing
        * counts of items in each category.
        *
        * Ensure categories are organized in alphabetical order before passing
        * to the callback.
        *
        */

        var categories = [];
        var total_num = 0;
      /*  var category = {
            _id: "All",
            num: 9999
        };*/

        categories.push({  _id: "All",num:total_num});

//console.log(database);
        var categoryArr = database.aggregate([
          {
            $group:{
               '_id' : '$category',
               'num' : {$sum:1}
            }
          },
          {
            $sort:{
              '_id':-1
            }
          },
          {
            $group:{
              '_id':null,
              "result":{$addToSet:{"_id":'$_id',"num":'$num'}}
            }
          }
        ]).toArray();
        categoryArr.then(data =>{
          //console.log(JSON.stringify(data));
          var result = data[0].result;
        //  console.log(JSON.stringify(result));
          result.forEach(function(rec){
          //  console.log(rec);
            categories.push(rec);
            total_num += rec.num;
          });
        //  console.log(JSON.stringify(categories));
          categories[0].num = total_num;
        //  console.log(JSON.stringify(categories));
          callback(categories);
        })
        .catch(error =>{
          console.log(error);
        })

        // TODO-lab1A Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the categories array to the
        // callback.

    }


   this.getItems = function(category, page, itemsPerPage, callback) {
       "use strict";

        /*
         * TODO-lab1B
         *
         * LAB #1B: Implement the getItems() method.
         *
         * Create a query on the "item" collection to select only the items
         * that should be displayed for a particular page of a given category.
         * The category is passed as a parameter to getItems().
         *
         * Use sort(), skip(), and limit() and the method parameters: page and
         * itemsPerPage to identify the appropriate products to display on each
         * page. Pass these items to the callback function.
         *
         * Sort items in ascending order based on the _id field. You must use
         * this sort to answer the final project questions correctly.
         *
         * Note: Since "All" is not listed as the category for any items,
         * you will need to query the "item" collection differently for "All"
         * than you do for other categories.
         *
         */

      /* var pageItem = this.createDummyItem();
        var pageItems = [];
        for (var i=0; i<5; i++) {
            pageItems.push(pageItem);
        }
*/
//console.log(page);
       var skipNoOfPages = itemsPerPage * page;
       //console.log(page);
        var pageItems = [];
        var searchResultQuery;
        if(category === 'All'){
          searchResultQuery={};
        }else {
          searchResultQuery={'category':category};
        }
        var searchResult = database.find(searchResultQuery).sort({"_id" : 1}).skip(skipNoOfPages).limit(itemsPerPage).toArray();
       searchResult.then(data =>{
        // console.log(data);
         var itemCount=0;
         data.forEach(function(pageItem){
            //console.log(pageItem);
             itemCount+=1;
             if(itemCount <= itemsPerPage){
               pageItems.push(pageItem);
             }//end of if
         });//end of foreach outer
        // console.log(pageItems);
         // TODO Include the following line in the appropriate
         // place within your code to pass the items for the selected page
         // to the callback.
         callback(pageItems);
       })
       .catch(error =>{
           console.log(error);
       });
        // TODO-lab1B Replace all code above (in this method).

    }


    this.getNumItems = function(category, callback) {
      //  "use strict";

      //  var numItems = 0;

        /*
         * TODO-lab1C:
         *
         * LAB #1C: Implement the getNumItems method()
         *
         * Write a query that determines the number of items in a category
         * and pass the count to the callback function. The count is used in
         * the mongomart application for pagination. The category is passed
         * as a parameter to this method.
         *
         * See the route handler for the root path (i.e. "/") for an example
         * of a call to the getNumItems() method.
         *
         */

         // TODO Include the following line in the appropriate
         // place within your code to pass the count to the callback.
         if(category === 'All'){
           searchResultQuery={};
         }else {
           searchResultQuery={'category':category};
         }
        var searchResult = database.find(searchResultQuery).count();
        searchResult.then(data =>{
        //  console.log(data);
          callback(data);
        })
        .catch(error =>{
           console.log(error);
        });

    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
    //    "use strict";

        /*
         * TODO-lab2A
         *
         * LAB #2A: Implement searchItems()
         *
         * Using the value of the query parameter passed to searchItems(),
         * perform a text search against the "item" collection.
         *
         * Sort the results in ascending order based on the _id field.
         *
         * Select only the items that should be displayed for a particular
         * page. For example, on the first page, only the first itemsPerPage
         * matching the query should be displayed.
         *
         * Use limit() and skip() and the method parameters: page and
         * itemsPerPage to select the appropriate matching products. Pass these
         * items to the callback function.
         *
         * searchItems() depends on a text index. Before implementing
         * this method, create a SINGLE text index on title, slogan, and
         * description. You should simply do this in the mongo shell.
         *
         */

    /*    var item = this.createDummyItem();
        var items = [];
        for (var i=0; i<5; i++) {
            items.push(item);
        }
      */
        // TODO-lab2A Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the items for the selected page
        // of search results to the callback.
        var items=[];
        var skipNoOfPages = itemsPerPage * page;
        var searchResult = database.find({$text:{$search:query}}).sort({_id:1}).skip(skipNoOfPages).limit(itemsPerPage).toArray();
        searchResult.then(data=>{
          //  console.log(data);
          var itemCount=0;
          data.forEach(function(searchItem){
             //console.log(pageItem);
              itemCount+=1;
              if(itemCount <= itemsPerPage){
                items.push(searchItem);
              }//end of if
          });//end of foreach outer
          callback(items);
        })
        .catch(error =>{
            console.log(error);
        })

    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var numItems = 0;

        /*
        * TODO-lab2B
        *
        * LAB #2B: Using the value of the query parameter passed to this
        * method, count the number of items in the "item" collection matching
        * a text search. Pass the count to the callback function.
        *
        * getNumSearchItems() depends on the same text index as searchItems().
        * Before implementing this method, ensure that you've already created
        * a SINGLE text index on title, slogan, and description. You should
        * simply do this in the mongo shell.
        */

        var searchResult = database.find({$text:{$search:query}}).count();
        searchResult.then(data=>{
          numItems = data;
        //  console.log(numItems);
            callback(numItems);
        })
        .catch(error =>{
            console.log(error);
        })

    }


    this.getItem = function(itemId, callback) {
      //  "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Implement the getItem() method.
         *
         * Using the itemId parameter, query the "item" collection by
         * _id and pass the matching item to the callback function.
         *
         */

      //  var item = this.createDummyItem();

        // TODO-lab3 Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the matching item
        // to the callback.
        var result = database.find({_id:itemId}).toArray();
        result.then(data =>{
          console.log(data);
          var item = data[0];
          callback(item);
        })
        .catch(error=>{
          console.log(error);
        })
        //callback(item);
    }


   this.getRelatedItems = function(callback) {
        "use strict";

        database.find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                //console.log(relatedItems);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
//        "use strict";

        /*
         * TODO-lab4
         *
         * LAB #4: Implement addReview().
         *
         * Using the itemId parameter, update the appropriate document in the
         * "item" collection with a new review. Reviews are stored as an
         * array value for the key "reviews". Each review has the fields:
         * "name", "comment", "stars", and "date".
         *
         */
/*
        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }
*/
        // TODO replace the following two lines with your code that will
        // update the document with a new review.
      //  var doc = this.createDummyItem();
      //   doc.reviews = [reviewDoc];
      var result = database.update({_id:itemId},{"$addToSet":{"reviews":{"name":name,"stars":stars,"comment":comment,date:Date.now()}}});
      result.then(data=>{
        console.log('updated the reviews');
        callback(data);
      })
      .catch(error => {
        console.log(error);
      })

        // TODO Include the following line in the appropriate
        // place within your code to pass the updated doc to the
        // callback.
      //  callback(doc);
   }


   this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }

}


module.exports.ItemDAO = ItemDAO;
