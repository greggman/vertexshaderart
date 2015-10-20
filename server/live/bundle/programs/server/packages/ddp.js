(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;

/* Package-scope variables */
var DDP, DDPServer;



/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.ddp = {
  DDP: DDP,
  DDPServer: DDPServer
};

})();

//# sourceMappingURL=ddp.js.map
