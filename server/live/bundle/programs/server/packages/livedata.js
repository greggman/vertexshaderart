(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;

/* Package-scope variables */
var DDP, DDPServer, LivedataTest;



/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.livedata = {
  DDP: DDP,
  DDPServer: DDPServer,
  LivedataTest: LivedataTest
};

})();

//# sourceMappingURL=livedata.js.map
