(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var SpacebarsCompiler = Package['spacebars-compiler'].SpacebarsCompiler;
var Spacebars = Package.spacebars.Spacebars;
var HTML = Package.htmljs.HTML;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;

/* Package-scope variables */
var Boilerplate;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/boilerplate-generator/packages/boilerplate-generator.js                     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
(function(){                                                                            // 1
                                                                                        // 2
///////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                               //     // 4
// packages/boilerplate-generator/boilerplate-generator.js                       //     // 5
//                                                                               //     // 6
///////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                 //     // 8
var fs = Npm.require('fs');                                                      // 1   // 9
var path = Npm.require('path');                                                  // 2   // 10
                                                                                 // 3   // 11
// Copied from webapp_server                                                     // 4   // 12
var readUtf8FileSync = function (filename) {                                     // 5   // 13
  return Meteor.wrapAsync(fs.readFile)(filename, 'utf8');                        // 6   // 14
};                                                                               // 7   // 15
                                                                                 // 8   // 16
Boilerplate = function (arch, manifest, options) {                               // 9   // 17
  var self = this;                                                               // 10  // 18
  options = options || {};                                                       // 11  // 19
  self.template = _getTemplate(arch);                                            // 12  // 20
  self.baseData = null;                                                          // 13  // 21
  self.func = null;                                                              // 14  // 22
                                                                                 // 15  // 23
  self._generateBoilerplateFromManifestAndSource(                                // 16  // 24
    manifest,                                                                    // 17  // 25
    self.template,                                                               // 18  // 26
    options                                                                      // 19  // 27
  );                                                                             // 20  // 28
};                                                                               // 21  // 29
                                                                                 // 22  // 30
// The 'extraData' argument can be used to extend 'self.baseData'. Its           // 23  // 31
// purpose is to allow you to specify data that you might not know at            // 24  // 32
// the time that you construct the Boilerplate object. (e.g. it is used          // 25  // 33
// by 'webapp' to specify data that is only known at request-time).              // 26  // 34
Boilerplate.prototype.toHTML = function (extraData) {                            // 27  // 35
  var self = this;                                                               // 28  // 36
                                                                                 // 29  // 37
  if (! self.baseData || ! self.func)                                            // 30  // 38
    throw new Error('Boilerplate did not instantiate correctly.');               // 31  // 39
                                                                                 // 32  // 40
  return  "<!DOCTYPE html>\n" +                                                  // 33  // 41
    Blaze.toHTML(Blaze.With(_.extend(self.baseData, extraData),                  // 34  // 42
                            self.func));                                         // 35  // 43
};                                                                               // 36  // 44
                                                                                 // 37  // 45
// XXX Exported to allow client-side only changes to rebuild the boilerplate     // 38  // 46
// without requiring a full server restart.                                      // 39  // 47
// Produces an HTML string with given manifest and boilerplateSource.            // 40  // 48
// Optionally takes urlMapper in case urls from manifest need to be prefixed     // 41  // 49
// or rewritten.                                                                 // 42  // 50
// Optionally takes pathMapper for resolving relative file system paths.         // 43  // 51
// Optionally allows to override fields of the data context.                     // 44  // 52
Boilerplate.prototype._generateBoilerplateFromManifestAndSource =                // 45  // 53
  function (manifest, boilerplateSource, options) {                              // 46  // 54
    var self = this;                                                             // 47  // 55
    // map to the identity by default                                            // 48  // 56
    var urlMapper = options.urlMapper || _.identity;                             // 49  // 57
    var pathMapper = options.pathMapper || _.identity;                           // 50  // 58
                                                                                 // 51  // 59
    var boilerplateBaseData = {                                                  // 52  // 60
      css: [],                                                                   // 53  // 61
      js: [],                                                                    // 54  // 62
      head: '',                                                                  // 55  // 63
      body: '',                                                                  // 56  // 64
      meteorManifest: JSON.stringify(manifest)                                   // 57  // 65
    };                                                                           // 58  // 66
                                                                                 // 59  // 67
    // allow the caller to extend the default base data                          // 60  // 68
    _.extend(boilerplateBaseData, options.baseDataExtension);                    // 61  // 69
                                                                                 // 62  // 70
    _.each(manifest, function (item) {                                           // 63  // 71
      var urlPath = urlMapper(item.url);                                         // 64  // 72
      var itemObj = { url: urlPath };                                            // 65  // 73
                                                                                 // 66  // 74
      if (options.inline) {                                                      // 67  // 75
        itemObj.scriptContent = readUtf8FileSync(                                // 68  // 76
          pathMapper(item.path));                                                // 69  // 77
        itemObj.inline = true;                                                   // 70  // 78
      }                                                                          // 71  // 79
                                                                                 // 72  // 80
      if (item.type === 'css' && item.where === 'client') {                      // 73  // 81
        boilerplateBaseData.css.push(itemObj);                                   // 74  // 82
      }                                                                          // 75  // 83
      if (item.type === 'js' && item.where === 'client') {                       // 76  // 84
        boilerplateBaseData.js.push(itemObj);                                    // 77  // 85
      }                                                                          // 78  // 86
      if (item.type === 'head') {                                                // 79  // 87
        boilerplateBaseData.head =                                               // 80  // 88
          readUtf8FileSync(pathMapper(item.path));                               // 81  // 89
      }                                                                          // 82  // 90
      if (item.type === 'body') {                                                // 83  // 91
        boilerplateBaseData.body =                                               // 84  // 92
          readUtf8FileSync(pathMapper(item.path));                               // 85  // 93
      }                                                                          // 86  // 94
    });                                                                          // 87  // 95
    var boilerplateRenderCode = SpacebarsCompiler.compile(                       // 88  // 96
      boilerplateSource, { isBody: true });                                      // 89  // 97
                                                                                 // 90  // 98
    // Note that we are actually depending on eval's local environment capture   // 91  // 99
    // so that UI and HTML are visible to the eval'd code.                       // 92  // 100
    // XXX the template we are evaluating relies on the fact that UI is globally        // 101
      // available.                                                              // 94  // 102
    global.UI = UI;                                                              // 95  // 103
    self.func = eval(boilerplateRenderCode);                                     // 96  // 104
    self.baseData = boilerplateBaseData;                                         // 97  // 105
};                                                                               // 98  // 106
                                                                                 // 99  // 107
var _getTemplate = _.memoize(function (arch) {                                   // 100
  var filename = 'boilerplate_' + arch + '.html';                                // 101
  return Assets.getText(filename);                                               // 102
});                                                                              // 103
                                                                                 // 104
///////////////////////////////////////////////////////////////////////////////////     // 113
                                                                                        // 114
}).call(this);                                                                          // 115
                                                                                        // 116
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['boilerplate-generator'] = {
  Boilerplate: Boilerplate
};

})();

//# sourceMappingURL=boilerplate-generator.js.map
