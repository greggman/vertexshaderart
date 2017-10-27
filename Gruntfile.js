"use strict";

var path   = require('path');
var fs     = require('fs');
var semver = require('semver');

var license = [
'/**                                                                                       ',
' * @license verteshaderart %(version)s Copyright (c) 2015, Gregg Tavares All Rights Reserved.    ',
' * Available via the MIT license.                                                         ',
' * see: http://github.com/greggman/vertexshaderart for details                                    ',
' */                                                                                       ',
'/**                                                                                       ',
' * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.',
' * Available via the MIT or new BSD license.                                              ',
' * see: http://github.com/jrburke/almond for details                                      ',
' */                                                                                       ',
'',
].map(function(s) { return s.replace(/\s+$/, ''); }).join("\n");

var replaceHandlers = {};
function registerReplaceHandler(keyword, handler) {
  replaceHandlers[keyword] = handler;
}

/**
 * Replace %(id)s in strings with values in objects(s)
 *
 * Given a string like `"Hello %(name)s from %(user.country)s"`
 * and an object like `{name:"Joe",user:{country:"USA"}}` would
 * return `"Hello Joe from USA"`.
 *
 * @param {string} str string to do replacements in
 * @param {Object|Object[]} params one or more objects.
 * @returns {string} string with replaced parts
 */
var replaceParams = (function() {
  var replaceParamsRE = /%\(([^\)]+)\)s/g;

  return function(str, params) {
    if (!params.length) {
      params = [params];
    }

    return str.replace(replaceParamsRE, function(match, key) {
      var colonNdx = key.indexOf(":");
      if (colonNdx >= 0) {
        try {
          var args = hanson.parse("{" + key + "}");
          var handlerName = Object.keys(args)[0];
          var handler = replaceHandlers[handlerName];
          if (handler) {
            return handler(args[handlerName]);
          }
          console.error("unknown substition handler: " + handlerName);
        } catch (e) {
          console.error(e);
          console.error("bad substitution: %(" + key + ")s");
        }
      } else {
        // handle normal substitutions.
        var keys = key.split('.');
        for (var ii = 0; ii < params.length; ++ii) {
          var obj = params[ii];
          for (var jj = 0; jj < keys.length; ++jj) {
            var key = keys[jj];
            obj = obj[key];
            if (obj === undefined) {
              break;
            }
          }
          if (obj !== undefined) {
            return obj;
          }
        }
      }
      console.error("unknown key: " + key);
      return "%(" + key + ")s";
    });
  };
}());

var packageInfo = JSON.parse(fs.readFileSync('package.json', {encoding: "utf8"}));

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  function setLicense() {
    var s = replaceParams(license, packageInfo);
    grunt.config.set('uglify.min.options.banner', s);
    //var start = s + fs.readFileSync('build/js/start.js', {encoding: "utf8"})
    //grunt.config.set('requirejs.full.options.wrap.start', start);
  }

  grunt.initConfig({
    webpack: {
      full: {
        entry: './src/js/main.js',
        resolve: {
          modules: [
            'src',
            'src/3rdparty',
          ],
          extensions: [
            '.js',
          ],
        },
        module: {
          loaders: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              //query: {
              //  presets: ['stage-0', 'es2015'],
              //},
            },
          ],
        },
        output: {
          path: path.join(__dirname, 'server/vertexshaderart/client'),
          filename: 'vsart.js',
          library: 'vsart',
          libraryTarget: 'umd',
        },
      },
    },
    requirejs: {
      //full: {
      //  options: {
      //    baseUrl: "./",
      //    name: "node_modules/almond/almond.js",
      //    include: "build/js/includer",
      //    out: "server/vertexshaderart/client/vsart.js",
      //    optimize: "none",
      //    wrap: {
      //      start: '<%= rsStart %>',
      //      endFile: 'build/js/end.js',
      //    },
      //    paths: {
      //      '3rdparty': 'src/3rdparty',
      //    },
      //  },
      //},
      css: {
        options: {
          baseUrl: "./",
          cssIn: "src/css/main.css",
          out: "server/vertexshaderart/client/vsart.css",
        },
      },
    },
    eslint: {
      lib: {
        src: [
          'src/js/*',
        ],
        options: {
          //configFile: 'build/conf/eslint.json',
          //rulesdir: ['build/rules'],
        },
      },
    },
    // uglify: {
    //   min: {
    //     options: {
    //       mangle: true,
    //       //screwIE8: true,
    //       banner: '<%= license %>',
    //       compress: false,
    //     },
    //     files: {
    //       'temp/delme.js': ['server/vertexshaderart/client/vsart.js'],
    //     },
    //   },
    // },
    clean: {
      dist: [ 'server/vertexshaderart/client/vsart.js' ],
    },
    copy: {
      resources: {
        files: [
          {
            expand: true,
            src: ['static/resources/**'],
            dest: 'server/vertexshaderart/public/',
          },
        ],
      },
    },
  });

  // grunt.loadNpmTasks('grunt-contrib-clean');
  // grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-contrib-requirejs');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('gruntify-eslint');

  grunt.registerTask('makeTemplates', function() {

    function getAllMatches(s, re) {
      var matches = [];
      do {
        var m = re.exec(s);
        if (m) {
          matches.push(m);
        }
      } while (m);
      return matches;
    }

    var attributeRE = /\s*(\w+)\s*=\s*"(.*?)"/g
    function parseAttributes(s) {
      var attributes = {};
      getAllMatches(s, attributeRE).forEach(function(m) {
        attributes[m[1]] = m[2];
      });
      return attributes;
    }

    var content = fs.readFileSync('src/index.html', {encoding: "utf-8"});
    var bodyRE = /<body>([\s\S]+)<\/body>/g
    var bodyMatch = bodyRE.exec(content);
    if (!bodyMatch) {
      throw "no body";
    }
    var body = bodyMatch[1];
    body = body.replace(/<!--template=(.*?)--><pre><\/pre>/g, "{{> $1}}");
    var scriptRE = /<script(.*?)>([\s\S]*?)<\/script>/g;
    var allScripts = getAllMatches(content, scriptRE);
    var scripts = [];
    var metaRE = /<meta.*?>/g;
    var metas = getAllMatches(content, metaRE);

    var html =
        '<template name="vsart">\n' + body + scripts.join("\n") + '\n</template>\n\n' +
        '<template name="vsartmetas">\n' + metas.join("\n") + '\n</template>\n\n';
    fs.writeFileSync("server/vertexshaderart/client/vsart.html", html);
  });

  grunt.registerTask('build', ['eslint:lib', 'clean:dist', 'webpack', 'requirejs', 'makeTemplates', 'copy']);
  grunt.registerTask('default', 'build');

  setLicense();


};

