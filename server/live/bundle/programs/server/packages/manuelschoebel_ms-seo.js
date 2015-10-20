(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;

/* Package-scope variables */
var __coffeescriptShare;

(function(){

//////////////////////////////////////////////////////////////////////////
//                                                                      //
// packages/manuelschoebel_ms-seo/packages/manuelschoebel_ms-seo.js     //
//                                                                      //
//////////////////////////////////////////////////////////////////////////
                                                                        //
(function () {                                                          // 1
                                                                        // 2
///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/manuelschoebel:ms-seo/seo_collection.coffee.js           //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
this.SeoCollection = new Mongo.Collection('seo');                       // 10
///////////////////////////////////////////////////////////////////////
                                                                        // 12
}).call(this);                                                          // 13
                                                                        // 14
                                                                        // 15
                                                                        // 16
                                                                        // 17
                                                                        // 18
                                                                        // 19
(function () {                                                          // 20
                                                                        // 21
///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/manuelschoebel:ms-seo/seo_publications.coffee.js         //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
Meteor.publish('seoByRouteName', function(routeName) {                  // 29
  check(routeName, String);                                             // 30
  return SeoCollection.find({                                           // 31
    route_name: routeName                                               // 32
  });                                                                   // 33
});                                                                     // 34
///////////////////////////////////////////////////////////////////////
                                                                        // 36
}).call(this);                                                          // 37
                                                                        // 38
//////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['manuelschoebel:ms-seo'] = {};

})();

//# sourceMappingURL=manuelschoebel_ms-seo.js.map
