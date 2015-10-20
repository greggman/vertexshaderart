(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var FS = Package['cfs:base-package'].FS;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/cfs_filesystem/packages/cfs_filesystem.js                                                              //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
(function () {                                                                                                     // 1
                                                                                                                   // 2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                          //     // 4
// packages/cfs:filesystem/filesystem.server.js                                                             //     // 5
//                                                                                                          //     // 6
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                            //     // 8
var fs = Npm.require('fs');                                                                                 // 1   // 9
var path = Npm.require('path');                                                                             // 2   // 10
var mkdirp = Npm.require('mkdirp');                                                                         // 3   // 11
//var chokidar = Npm.require('chokidar');                                                                   // 4   // 12
                                                                                                            // 5   // 13
FS.Store.FileSystem = function(name, options) {                                                             // 6   // 14
  var self = this;                                                                                          // 7   // 15
  if (!(self instanceof FS.Store.FileSystem))                                                               // 8   // 16
    throw new Error('FS.Store.FileSystem missing keyword "new"');                                           // 9   // 17
                                                                                                            // 10  // 18
  // We allow options to be string/path empty or options.path                                               // 11  // 19
  options = (options !== ''+options) ? options || {} : { path: options };                                   // 12  // 20
                                                                                                            // 13  // 21
  // Provide a default FS directory one level up from the build/bundle directory                            // 14  // 22
  var pathname = options.path;                                                                              // 15  // 23
  if (!pathname && __meteor_bootstrap__ && __meteor_bootstrap__.serverDir) {                                // 16  // 24
    pathname = path.join(__meteor_bootstrap__.serverDir, '../../../cfs/files/' + name);                     // 17  // 25
  }                                                                                                         // 18  // 26
                                                                                                            // 19  // 27
  if (!pathname)                                                                                            // 20  // 28
    throw new Error('FS.Store.FileSystem unable to determine path');                                        // 21  // 29
                                                                                                            // 22  // 30
  // Check if we have '~/foo/bar'                                                                           // 23  // 31
  if (pathname.split(path.sep)[0] === '~') {                                                                // 24  // 32
    var homepath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;                     // 25  // 33
    if (homepath) {                                                                                         // 26  // 34
      pathname = pathname.replace('~', homepath);                                                           // 27  // 35
    } else {                                                                                                // 28  // 36
      throw new Error('FS.Store.FileSystem unable to resolve "~" in path');                                 // 29  // 37
    }                                                                                                       // 30  // 38
  }                                                                                                         // 31  // 39
                                                                                                            // 32  // 40
  // Set absolute path                                                                                      // 33  // 41
  var absolutePath = path.resolve(pathname);                                                                // 34  // 42
                                                                                                            // 35  // 43
  // Ensure the path exists                                                                                 // 36  // 44
  mkdirp.sync(absolutePath);                                                                                // 37  // 45
  FS.debug && console.log(name + ' FileSystem mounted on: ' + absolutePath);                                // 38  // 46
                                                                                                            // 39  // 47
  return new FS.StorageAdapter(name, options, {                                                             // 40  // 48
    typeName: 'storage.filesystem',                                                                         // 41  // 49
    fileKey: function(fileObj) {                                                                            // 42  // 50
      // Lookup the copy                                                                                    // 43  // 51
      var store = fileObj && fileObj._getInfo(name);                                                        // 44  // 52
      // If the store and key is found return the key                                                       // 45  // 53
      if (store && store.key) return store.key;                                                             // 46  // 54
                                                                                                            // 47  // 55
      var filename = fileObj.name();                                                                        // 48  // 56
      var filenameInStore = fileObj.name({store: name});                                                    // 49  // 57
                                                                                                            // 50  // 58
      // If no store key found we resolve / generate a key                                                  // 51  // 59
      return fileObj.collectionName + '-' + fileObj._id + '-' + (filenameInStore || filename);              // 52  // 60
    },                                                                                                      // 53  // 61
    createReadStream: function(fileKey, options) {                                                          // 54  // 62
      // this is the Storage adapter scope                                                                  // 55  // 63
      var filepath = path.join(absolutePath, fileKey);                                                      // 56  // 64
                                                                                                            // 57  // 65
      // return the read stream - Options allow { start, end }                                              // 58  // 66
      return fs.createReadStream(filepath, options);                                                        // 59  // 67
    },                                                                                                      // 60  // 68
    createWriteStream: function(fileKey, options) {                                                         // 61  // 69
      options = options || {};                                                                              // 62  // 70
                                                                                                            // 63  // 71
      // this is the Storage adapter scope                                                                  // 64  // 72
      var filepath = path.join(absolutePath, fileKey);                                                      // 65  // 73
                                                                                                            // 66  // 74
      // Return the stream handle                                                                           // 67  // 75
      var writeStream = fs.createWriteStream(filepath, options);                                            // 68  // 76
                                                                                                            // 69  // 77
      // The filesystem does not emit the "end" event only close - so we                                    // 70  // 78
      // manually send the end event                                                                        // 71  // 79
      writeStream.on('close', function() {                                                                  // 72  // 80
        if (FS.debug) console.log('SA FileSystem - DONE!! fileKey: "' + fileKey + '"');                     // 73  // 81
                                                                                                            // 74  // 82
        // Get the exact size of the stored file, so that we can pass it to onEnd/onStored.                 // 75  // 83
        // Since stream transforms might have altered the size, this is the best way to                     // 76  // 84
        // ensure we update the fileObj.copies with the correct size.                                       // 77  // 85
        try {                                                                                               // 78  // 86
          // Get the stats of the file                                                                      // 79  // 87
          var stats = fs.statSync(filepath);                                                                // 80  // 88
                                                                                                            // 81  // 89
          // Emit end and return the fileKey, size, and updated date                                        // 82  // 90
          writeStream.emit('stored', {                                                                      // 83  // 91
            fileKey: fileKey,                                                                               // 84  // 92
            size: stats.size,                                                                               // 85  // 93
            storedAt: stats.mtime                                                                           // 86  // 94
          });                                                                                               // 87  // 95
                                                                                                            // 88  // 96
        } catch(err) {                                                                                      // 89  // 97
          // On error we emit the error on                                                                  // 90  // 98
          writeStream.emit('error', err);                                                                   // 91  // 99
        }                                                                                                   // 92  // 100
      });                                                                                                   // 93  // 101
                                                                                                            // 94  // 102
      return writeStream;                                                                                   // 95  // 103
    },                                                                                                      // 96  // 104
    remove: function(fileKey, callback) {                                                                   // 97  // 105
      // this is the Storage adapter scope                                                                  // 98  // 106
      var filepath = path.join(absolutePath, fileKey);                                                      // 99  // 107
                                                                                                            // 100
      // Call node unlink file                                                                              // 101
      fs.unlink(filepath, function (error, result) {                                                        // 102
        if (error && error.errno === 34) {                                                                  // 103
          console.warn("SA FileSystem: Could not delete " + filepath + " because the file was not found."); // 104
          callback && callback(null);                                                                       // 105
        } else {                                                                                            // 106
          callback && callback(error, result);                                                              // 107
        }                                                                                                   // 108
      });                                                                                                   // 109
    },                                                                                                      // 110
    stats: function(fileKey, callback) {                                                                    // 111
      // this is the Storage adapter scope                                                                  // 112
      var filepath = path.join(absolutePath, fileKey);                                                      // 113
      if (typeof callback === 'function') {                                                                 // 114
        fs.stat(filepath, callback);                                                                        // 115
      } else {                                                                                              // 116
        return fs.statSync(filepath);                                                                       // 117
      }                                                                                                     // 118
    }                                                                                                       // 119
    // Add this back and add the chokidar dependency back when we make this work eventually                 // 120
    // watch: function(callback) {                                                                          // 121
    //   function fileKey(filePath) {                                                                       // 122
    //     return filePath.replace(absolutePath, "");                                                       // 123
    //   }                                                                                                  // 124
                                                                                                            // 125
    //   FS.debug && console.log('Watching ' + absolutePath);                                               // 126
                                                                                                            // 127
    //   // chokidar seems to be most widely used and production ready watcher                              // 128
    //   var watcher = chokidar.watch(absolutePath, {ignored: /\/\./, ignoreInitial: true});                // 129
    //   watcher.on('add', Meteor.bindEnvironment(function(filePath, stats) {                               // 130
    //     callback("change", fileKey(filePath), {                                                          // 131
    //       name: path.basename(filePath),                                                                 // 132
    //       type: null,                                                                                    // 133
    //       size: stats.size,                                                                              // 134
    //       utime: stats.mtime                                                                             // 135
    //     });                                                                                              // 136
    //   }, function(err) {                                                                                 // 137
    //     throw err;                                                                                       // 138
    //   }));                                                                                               // 139
    //   watcher.on('change', Meteor.bindEnvironment(function(filePath, stats) {                            // 140
    //     callback("change", fileKey(filePath), {                                                          // 141
    //       name: path.basename(filePath),                                                                 // 142
    //       type: null,                                                                                    // 143
    //       size: stats.size,                                                                              // 144
    //       utime: stats.mtime                                                                             // 145
    //     });                                                                                              // 146
    //   }, function(err) {                                                                                 // 147
    //     throw err;                                                                                       // 148
    //   }));                                                                                               // 149
    //   watcher.on('unlink', Meteor.bindEnvironment(function(filePath) {                                   // 150
    //     callback("remove", fileKey(filePath));                                                           // 151
    //   }, function(err) {                                                                                 // 152
    //     throw err;                                                                                       // 153
    //   }));                                                                                               // 154
    // }                                                                                                    // 155
  });                                                                                                       // 156
};                                                                                                          // 157
                                                                                                            // 158
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 167
                                                                                                                   // 168
}).call(this);                                                                                                     // 169
                                                                                                                   // 170
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:filesystem'] = {};

})();

//# sourceMappingURL=cfs_filesystem.js.map
