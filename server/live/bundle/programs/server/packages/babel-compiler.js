(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var check = Package.check.check;
var Match = Package.check.Match;

/* Package-scope variables */
var Babel, BabelCompiler;

(function(){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/babel-compiler/packages/babel-compiler.js                               //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
(function(){                                                                        // 1
                                                                                    // 2
////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                            //    // 4
// packages/babel-compiler/babel.js                                           //    // 5
//                                                                            //    // 6
////////////////////////////////////////////////////////////////////////////////    // 7
                                                                              //    // 8
var meteorBabel = Npm.require('meteor-babel');                                // 1  // 9
                                                                              // 2  // 10
function validateExtraFeatures(extraFeatures) {                               // 3  // 11
  if (extraFeatures) {                                                        // 4  // 12
    check(extraFeatures, {                                                    // 5  // 13
      // Modify options to enable ES2015 module syntax.                       // 6  // 14
      modules: Match.Optional(Boolean),                                       // 7  // 15
      // Modify options to enable async/await syntax powered by Fibers.       // 8  // 16
      meteorAsyncAwait: Match.Optional(Boolean),                              // 9  // 17
      // Modify options to enable React/JSX syntax.                           // 10
      react: Match.Optional(Boolean),                                         // 11
      // Improve compatibility in older versions of Internet Explorer.        // 12
      jscript: Match.Optional(Boolean)                                        // 13
    });                                                                       // 14
  }                                                                           // 15
}                                                                             // 16
                                                                              // 17
/**                                                                           // 18
 * Returns a new object containing default options appropriate for            // 19
 */                                                                           // 20
function getDefaultOptions(extraFeatures) {                                   // 21
  validateExtraFeatures(extraFeatures);                                       // 22
                                                                              // 23
  // See https://github.com/meteor/babel/blob/master/options.js for more      // 24
  // information about what the default options are.                          // 25
  var options = meteorBabel.getDefaultOptions(extraFeatures);                 // 26
                                                                              // 27
  // The sourceMap option should probably be removed from the default         // 28
  // options returned by meteorBabel.getDefaultOptions.                       // 29
  delete options.sourceMap;                                                   // 30
                                                                              // 31
  return options;                                                             // 32
}                                                                             // 33
                                                                              // 34
Babel = {                                                                     // 35
  getDefaultOptions: getDefaultOptions,                                       // 36
                                                                              // 37
  validateExtraFeatures: validateExtraFeatures,                               // 38
                                                                              // 39
  compile: function (source, options) {                                       // 40
    options = options || getDefaultOptions();                                 // 41
    return meteorBabel.compile(source, options);                              // 42
  },                                                                          // 43
                                                                              // 44
  // Provided for backwards compatibility; prefer Babel.compile.              // 45
  transformMeteor: function (source, extraOptions) {                          // 46
    var options = getDefaultOptions();                                        // 47
                                                                              // 48
    if (extraOptions) {                                                       // 49
      if (extraOptions.extraWhitelist) {                                      // 50
        options.whitelist.push.apply(                                         // 51
          options.whitelist,                                                  // 52
          extraOptions.extraWhitelist                                         // 53
        );                                                                    // 54
      }                                                                       // 55
                                                                              // 56
      for (var key in extraOptions) {                                         // 57
        if (key !== "extraWhitelist" &&                                       // 58
            hasOwnProperty.call(extraOptions, key)) {                         // 59
          options[key] = extraOptions[key];                                   // 60
        }                                                                     // 61
      }                                                                       // 62
    }                                                                         // 63
                                                                              // 64
    return meteorBabel.compile(source, options);                              // 65
  },                                                                          // 66
                                                                              // 67
  setCacheDir: function (cacheDir) {                                          // 68
    meteorBabel.setCacheDir(cacheDir);                                        // 69
  }                                                                           // 70
};                                                                            // 71
                                                                              // 72
////////////////////////////////////////////////////////////////////////////////    // 81
                                                                                    // 82
}).call(this);                                                                      // 83
                                                                                    // 84
                                                                                    // 85
                                                                                    // 86
                                                                                    // 87
                                                                                    // 88
                                                                                    // 89
(function(){                                                                        // 90
                                                                                    // 91
////////////////////////////////////////////////////////////////////////////////    // 92
//                                                                            //    // 93
// packages/babel-compiler/babel-compiler.js                                  //    // 94
//                                                                            //    // 95
////////////////////////////////////////////////////////////////////////////////    // 96
                                                                              //    // 97
/**                                                                           // 1  // 98
 * A compiler that can be instantiated with features and used inside          // 2  // 99
 * Plugin.registerCompiler                                                    // 3  // 100
 * @param {Object} extraFeatures The same object that getDefaultOptions takes       // 101
 */                                                                           // 5  // 102
BabelCompiler = function BabelCompiler(extraFeatures) {                       // 6  // 103
  Babel.validateExtraFeatures(extraFeatures);                                 // 7  // 104
  this.extraFeatures = extraFeatures;                                         // 8  // 105
};                                                                            // 9  // 106
                                                                              // 10
var BCp = BabelCompiler.prototype;                                            // 11
var excludedFileExtensionPattern = /\.es5\.js$/i;                             // 12
                                                                              // 13
BCp.processFilesForTarget = function (inputFiles) {                           // 14
  var self = this;                                                            // 15
                                                                              // 16
  inputFiles.forEach(function (inputFile) {                                   // 17
    var source = inputFile.getContentsAsString();                             // 18
    var inputFilePath = inputFile.getPathInPackage();                         // 19
    var outputFilePath = inputFile.getPathInPackage();                        // 20
    var fileOptions = inputFile.getFileOptions();                             // 21
    var toBeAdded = {                                                         // 22
      sourcePath: inputFilePath,                                              // 23
      path: outputFilePath,                                                   // 24
      data: source,                                                           // 25
      hash: inputFile.getSourceHash(),                                        // 26
      sourceMap: null,                                                        // 27
      bare: !! fileOptions.bare                                               // 28
    };                                                                        // 29
                                                                              // 30
    // If you need to exclude a specific file within a package from Babel     // 31
    // compilation, pass the { transpile: false } options to api.addFiles     // 32
    // when you add that file.                                                // 33
    if (fileOptions.transpile !== false &&                                    // 34
        // If you need to exclude a specific file within an app from Babel    // 35
        // compilation, give it the following file extension: .es5.js         // 36
        ! excludedFileExtensionPattern.test(inputFilePath)) {                 // 37
                                                                              // 38
      var targetCouldBeInternetExplorer8 =                                    // 39
        inputFile.getArch() === "web.browser";                                // 40
                                                                              // 41
      self.extraFeatures = self.extraFeatures || {};                          // 42
      if (! self.extraFeatures.hasOwnProperty("jscript")) {                   // 43
        // Perform some additional transformations to improve                 // 44
        // compatibility in older browsers (e.g. wrapping named function      // 45
        // expressions, per http://kiro.me/blog/nfe_dilemma.html).            // 46
        self.extraFeatures.jscript = targetCouldBeInternetExplorer8;          // 47
      }                                                                       // 48
                                                                              // 49
      var babelOptions = Babel.getDefaultOptions(self.extraFeatures);         // 50
                                                                              // 51
      babelOptions.sourceMap = true;                                          // 52
      babelOptions.filename = inputFilePath;                                  // 53
      babelOptions.sourceFileName = "/" + inputFilePath;                      // 54
      babelOptions.sourceMapName = "/" + outputFilePath + ".map";             // 55
                                                                              // 56
      try {                                                                   // 57
        var result = Babel.compile(source, babelOptions);                     // 58
      } catch (e) {                                                           // 59
        if (e.loc) {                                                          // 60
          inputFile.error({                                                   // 61
            message: e.message,                                               // 62
            sourcePath: inputFilePath,                                        // 63
            line: e.loc.line,                                                 // 64
            column: e.loc.column,                                             // 65
          });                                                                 // 66
                                                                              // 67
          return;                                                             // 68
        }                                                                     // 69
                                                                              // 70
        throw e;                                                              // 71
      }                                                                       // 72
                                                                              // 73
      toBeAdded.data = result.code;                                           // 74
      toBeAdded.hash = result.hash;                                           // 75
      toBeAdded.sourceMap = result.map;                                       // 76
    }                                                                         // 77
                                                                              // 78
    inputFile.addJavaScript(toBeAdded);                                       // 79
  });                                                                         // 80
};                                                                            // 81
                                                                              // 82
BCp.setDiskCacheDirectory = function (cacheDir) {                             // 83
  Babel.setCacheDir(cacheDir);                                                // 84
};                                                                            // 85
                                                                              // 86
////////////////////////////////////////////////////////////////////////////////    // 184
                                                                                    // 185
}).call(this);                                                                      // 186
                                                                                    // 187
//////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['babel-compiler'] = {
  Babel: Babel,
  BabelCompiler: BabelCompiler
};

})();

//# sourceMappingURL=babel-compiler.js.map
