(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var Spacebars = Package.spacebars.Spacebars;
var SpacebarsCompiler = Package['spacebars-compiler'].SpacebarsCompiler;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var Template, SSR;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks_ssr/packages/meteorhacks_ssr.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
(function () {                                                                                                        // 1
                                                                                                                      // 2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                                              //    // 4
// packages/meteorhacks:ssr/lib/overrides.js                                                                    //    // 5
//                                                                                                              //    // 6
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                                                //    // 8
// we don't need autorun to go through Tracker                                                                  // 1  // 9
Blaze.View.prototype.autorun = function(f) {                                                                    // 2  // 10
  var handler = {stop: function() {}};                                                                          // 3  // 11
  f.call(this, handler);                                                                                        // 4  // 12
  return handler;                                                                                               // 5  // 13
};                                                                                                              // 6  // 14
                                                                                                                // 7  // 15
Spacebars.With = function (argFunc, contentFunc, elseFunc) {                                                    // 8  // 16
  var argVar = new Blaze.ReactiveVar;                                                                           // 9  // 17
  var view = Blaze.View('Spacebars_with', function () {                                                         // 10
    return Blaze.If(function () { return argVar.get(); },                                                       // 11
                    function () { return Blaze.With(function () {                                               // 12
                      return argVar.get(); }, contentFunc); },                                                  // 13
                    elseFunc);                                                                                  // 14
  });                                                                                                           // 15
                                                                                                                // 16
  view.onViewCreated(function () {                                                                              // 17
    this.autorun(function () {                                                                                  // 18
      argVar.set(argFunc());                                                                                    // 19
    });                                                                                                         // 20
  });                                                                                                           // 21
                                                                                                                // 22
  return view;                                                                                                  // 23
};                                                                                                              // 24
                                                                                                                // 25
// if we get a cursor from a templateHelper                                                                     // 26
// we need fetch the data                                                                                       // 27
// observering us useless and throw errors                                                                      // 28
var originalLookup = Blaze.View.prototype.lookup;                                                               // 29
Blaze.View.prototype.lookup = function(key) {                                                                   // 30
  var helper = originalLookup.apply(this, arguments);                                                           // 31
  return wrapHelper(helper);                                                                                    // 32
};                                                                                                              // 33
                                                                                                                // 34
function wrapHelper(helper) {                                                                                   // 35
  if(typeof helper != 'function') {                                                                             // 36
    return helper;                                                                                              // 37
  }                                                                                                             // 38
                                                                                                                // 39
  return function() {                                                                                           // 40
    var res = helper.apply(this, arguments);                                                                    // 41
    if(res && typeof res.observeChanges == 'function') {                                                        // 42
      return res.fetch();                                                                                       // 43
    } else {                                                                                                    // 44
      return res;                                                                                               // 45
    }                                                                                                           // 46
  }                                                                                                             // 47
}                                                                                                               // 48
                                                                                                                // 49
var originalTemplateWith = Blaze._TemplateWith;                                                                 // 50
Blaze._TemplateWith = function(arg, contentFunc) {                                                              // 51
  // data is available instantly and if we delayed                                                              // 52
  // things won't work as expected                                                                              // 53
                                                                                                                // 54
  if(typeof arg == 'function') {                                                                                // 55
    arg = arg();                                                                                                // 56
  }                                                                                                             // 57
  return originalTemplateWith.call(this, arg, contentFunc);                                                     // 58
};                                                                                                              // 59
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 68
                                                                                                                      // 69
}).call(this);                                                                                                        // 70
                                                                                                                      // 71
                                                                                                                      // 72
                                                                                                                      // 73
                                                                                                                      // 74
                                                                                                                      // 75
                                                                                                                      // 76
(function () {                                                                                                        // 77
                                                                                                                      // 78
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 79
//                                                                                                              //    // 80
// packages/meteorhacks:ssr/lib/template.js                                                                     //    // 81
//                                                                                                              //    // 82
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 83
                                                                                                                //    // 84
// Packages and apps add templates on to this object.                                                           // 1  // 85
Template = Blaze.Template;                                                                                      // 2  // 86
                                                                                                                // 3  // 87
// Check for duplicate template names and illegal names that won't work.                                        // 4  // 88
Template.__checkName = function (name) {                                                                        // 5  // 89
  if (name in Template) {                                                                                       // 6  // 90
    if ((Template[name] instanceof Template) && name !== "body")                                                // 7  // 91
      throw new Error("There are multiple templates named '" + name + "'. Each template needs a unique name."); // 8  // 92
    throw new Error("This template name is reserved: " + name);                                                 // 9  // 93
  }                                                                                                             // 10
};                                                                                                              // 11
                                                                                                                // 12
// Define a template `Template.body` that renders its                                                           // 13
// `contentViews`.  `<body>` tags (of which there may be                                                        // 14
// multiple) will have their contents added to it.                                                              // 15
Template.body = new Template('body', function () {                                                              // 16
  var parts = Template.body.contentViews;                                                                       // 17
  // enable lookup by setting `view.template`                                                                   // 18
  for (var i = 0; i < parts.length; i++)                                                                        // 19
    parts[i].template = Template.body;                                                                          // 20
  return parts;                                                                                                 // 21
});                                                                                                             // 22
Template.body.contentViews = []; // array of Blaze.Views                                                        // 23
Template.body.view = null;                                                                                      // 24
                                                                                                                // 25
Template.body.addContent = function (renderFunc) {                                                              // 26
  var kind = 'body_content_' + Template.body.contentViews.length;                                               // 27
                                                                                                                // 28
  Template.body.contentViews.push(Blaze.View(kind, renderFunc));                                                // 29
};                                                                                                              // 30
                                                                                                                // 31
// This function does not use `this` and so it may be called                                                    // 32
// as `Meteor.startup(Template.body.renderIntoDocument)`.                                                       // 33
Template.body.renderToDocument = function () {                                                                  // 34
                                                                                                                // 35
};                                                                                                              // 36
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 121
                                                                                                                      // 122
}).call(this);                                                                                                        // 123
                                                                                                                      // 124
                                                                                                                      // 125
                                                                                                                      // 126
                                                                                                                      // 127
                                                                                                                      // 128
                                                                                                                      // 129
(function () {                                                                                                        // 130
                                                                                                                      // 131
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 132
//                                                                                                              //    // 133
// packages/meteorhacks:ssr/lib/dynamic.js                                                                      //    // 134
//                                                                                                              //    // 135
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 136
                                                                                                                //    // 137
Template.__dynamic = new Template("Template.__dynamic", function() {                                            // 1  // 138
  var view = this;                                                                                              // 2  // 139
  var template = Spacebars.call(view.lookup("template"));                                                       // 3  // 140
  if(!template) {                                                                                               // 4  // 141
    throw new Error('you must specify template argument in UI.dynamic');                                        // 5  // 142
  } else if(!Template[template]) {                                                                              // 6  // 143
    throw new Error('there is no template defined to include with UI.dynamic: '  + template);                   // 7  // 144
  }                                                                                                             // 8  // 145
                                                                                                                // 9  // 146
  var data = Spacebars.call(view.lookup("data"));                                                               // 10
  if(!data) {                                                                                                   // 11
    // get data from the parent                                                                                 // 12
    data = Spacebars.call(view.lookup)                                                                          // 13
  }                                                                                                             // 14
                                                                                                                // 15
  return Blaze._TemplateWith(data, function() {                                                                 // 16
    return Spacebars.include(Template[template]);                                                               // 17
  });                                                                                                           // 18
});                                                                                                             // 19
                                                                                                                // 20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 158
                                                                                                                      // 159
}).call(this);                                                                                                        // 160
                                                                                                                      // 161
                                                                                                                      // 162
                                                                                                                      // 163
                                                                                                                      // 164
                                                                                                                      // 165
                                                                                                                      // 166
(function () {                                                                                                        // 167
                                                                                                                      // 168
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 169
//                                                                                                              //    // 170
// packages/meteorhacks:ssr/lib/api.js                                                                          //    // 171
//                                                                                                              //    // 172
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 173
                                                                                                                //    // 174
var format = Npm.require('util').format;                                                                        // 1  // 175
var Compilers = {};                                                                                             // 2  // 176
Compilers.html = SpacebarsCompiler;                                                                             // 3  // 177
if(Package['mquandalle:jade-compiler']) {                                                                       // 4  // 178
  Compilers.jade = Package['mquandalle:jade-compiler'].JadeCompiler;                                            // 5  // 179
}                                                                                                               // 6  // 180
                                                                                                                // 7  // 181
SSR = {};                                                                                                       // 8  // 182
                                                                                                                // 9  // 183
SSR.render = function(templateName, data) {                                                                     // 10
  var renderFunc = (data)? Blaze.toHTMLWithData : Blaze.toHTML;                                                 // 11
  var template = (typeof templateName == 'string')?                                                             // 12
    Template[templateName] : templateName;                                                                      // 13
                                                                                                                // 14
  return renderFunc(template, data);                                                                            // 15
};                                                                                                              // 16
                                                                                                                // 17
SSR.compileTemplate = function(name, content, options) {                                                        // 18
  var language = options && options.language || "html";                                                         // 19
  var compiler = Compilers[language];                                                                           // 20
  if(!compiler) {                                                                                               // 21
    throw Error("Unknown language: " + language);                                                               // 22
  }                                                                                                             // 23
                                                                                                                // 24
  var compiled = compiler.compile(content);                                                                     // 25
  var templateFmt = "new Template('%s', function() {var view=this; return %s()})";                              // 26
  var template = format(templateFmt, name, compiled);                                                           // 27
                                                                                                                // 28
  return Template[name] = eval(template);                                                                       // 29
};                                                                                                              // 30
                                                                                                                // 31
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 206
                                                                                                                      // 207
}).call(this);                                                                                                        // 208
                                                                                                                      // 209
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['meteorhacks:ssr'] = {
  Template: Template,
  SSR: SSR
};

})();

//# sourceMappingURL=meteorhacks_ssr.js.map
