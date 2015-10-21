Art = new Mongo.Collection("art");

//FS.debug = true;
Images = new FS.Collection("images", {
  stores: [
    new FS.Store.FileSystem("images", {
      path: IMAGE_PATH,
      beforeWrite: function(fileObj) {
        fileObj.name("thumbnail.png");
        return {
          extension: 'png',
          type: 'image/png',
        };
      },
    }),
  ],
});


if (Meteor.isServer) {
  Images.allow({
    'insert': function() {
        // add custom authentication code here
        return true;
    },
    'download': function() {
         return true;
    },
  });

  Meteor.publish("art", function () {
    return Art.find({});
  });

  Meteor.publish("images", function () {
    return Images.find({});
  });

  var templateRE = /<template\s+name="(.*?)">([\s\S]*?)<\/template>/g;
  var ssrTemplates = Assets.getText('ssr-templates.html');
  do {
    var m = templateRE.exec(ssrTemplates);
    if (m) {
      SSR.compileTemplate(m[1], m[2]);
    }
  } while (m);

  var urlRE = /(.*?\:)\/\/(.*)$/;
  function parseUrl(url) {
    var u = {};
    var hashNdx = url.indexOf("#");
    if (hashNdx >= 0) {
      u.hash = url.substr(hashNdx);
      url = url.substr(0, hashNdx);
    }
    var searchNdx = url.indexOf("?");
    if (searchNdx >= 0) {
      u.search = url.substr(searchNdx);
      url = url.substr(0, searchNdx);
    }
    var m = urlRE.exec(url);
    if (m) {
      u.protocol = m[1];
      url = m[2];
    }
    var slashNdx = url.indexOf("/");
    if (slashNdx >= 0) {
      u.hostname = url.substr(0, slashNdx);
      u.pathname = url.substr(slashNdx);
    } else {
      u.host = other;
    }

    return u;
  }

  //var artPathRE = /\/art\/(.*)/;
  //WebApp.connectHandlers.use("/", function(req, res, next) {
  //   var url = parseUrl(req.url);
  //   if (url.pathname) {
  //     var m = artPathRE.exec(url.pathname);
  //     if (m) {
  //
  //     }
  //   }
  //   next();
  //});

//  Inject.meta("foo", "bar");
}

if (Meteor.isClient) {
  Meteor.subscribe("art");
  Meteor.subscribe("images");

  Template.gallery.helpers({
    art: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Art.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Art.find({}, {sort: {createdAt: -1}});
      }
    },
    numImages: function() {
      return Images.find().count();
    },
    images: function() {
      return Images.find();
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Art.find({checked: {$ne: true}}).count();
    },
  });


  Template.gallery.events({
    "submit .new-art": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert a art into the collection
      Meteor.call("addArt", text);

      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.artpiece.helpers({
    screenshotLink: function() {
      if (this.screenshotDataId) {
        return Images.findOne(({_id: this.screenshotDataId}));
      } else if (this.screenshotDataURL) {
        return { url:this.screenshotDataURL };
      } else {
        return { url:"/static/resources/images/missing-thumbnail.jpg" };
      }
    },
  });

  Template.artitem.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.artitem.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    },
  });

  function SetArt(data) {
    var settings;
    if (data && data.settings) {
      try {
        settings = JSON.parse(data.settings);
      } catch (e) {
        console.log("could not parse settings");
      }
    } else {
      if (!data) {
        console.log("data not set");
      } else {
        console.log("data.settings not set for id:", data._id);
      }
    }
    if (!settings && window.location.pathname.substr(0, 5) !== "/new/") {
      settings = window.vsart.missingSettings;
    }
    window.vsart.setSettings(settings);
  }

  Template.artpage.onRendered(function() {
    SetArt(this.data);
  });

  Template.artpage.onDestroyed(function() {
    window.vsart.stop();
  });

  Template.artpage.events({
    "click #save": function() {
      window.vsart.markAsSaving();
      Meteor.call("addArt", {
        settings: window.vsart.getSettings(),
        screenshot: window.vsart.takeScreenshot(),
      });
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
  });

}

Router.map(function() {
  this.route('/', function() {
    this.render('gallery');
  });
  this.route('/new/', function() {
    this.render('artpage');
  });
  this.route('/art/:_id', {
    template: 'artpage',
    waitOn: function() {
      return [Meteor.subscribe('art', this.params._id)];
    },
    data: function() {
      return Art.findOne({_id: this.params._id});
    },
    action: function() {
      //this.subscribe('art', this.params._id).wait();

      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    },
    onAfterAction: function() {
      if (!Meteor.isClient) {
        return;
      }

      // hard to decide what's the best way to do this
      // this just makes it not get into an infinite loop.
      // Do we care that if you just refresh the page it's a new view?
      // Youtube doesn't care so should I?
      var artId = this.params._id;
      var lastArtId = Session.get("view_art_id");
      if (artId !== lastArtId) {
        Session.set("view_art_id", artId);
        Meteor.call("incArtViews", artId);
      }
      //SEO.set({
      //  title: "foobar",
      //  meta: {
      //    'description': "foobar-desc",
      //  },
      //  og: {
      //    'title': this.params._id,
      //    'description': "foobar-desc",
      //  },
      //});

    },
  });
});

Meteor.methods({
  addArt: function (data) {
    // Make sure the user is logged in before inserting art
//    if (! Meteor.userId()) {
//      throw new Meteor.Error("not-authorized");
//    }
    var owner = Meteor.userId();
    var username = Meteor.userId() ? Meteor.user().username : "-anon-";
    var settings = data.settings || {};
    var screenshotDataURL = data.screenshot.dataURL || "";
    Images.insert(screenshotDataURL, function(err, fileObj) {
      Art.insert({
        createdAt: new Date(),
        owner: owner,
        username: username,
        settings: JSON.stringify(settings),
        screenshotDataId: fileObj._id,
        views: 0,
        likes: 0,
      }, function(error, result) {
         if (Meteor.isClient) {
           var url = "/art/" + result;
           window.history.replaceState({}, "", url);
           window.vsart.markAsSaved();
         }
      });
    });
  },
  deleteArt: function (artId) {
    var art = Art.findOne(artId);
    if (art.private && art.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }
    Art.remove(artId);
  },
  setChecked: function (artId, setChecked) {
    var art = Art.findOne(artId);
    if (art.private && art.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Art.update(artId, { $set: { checked: setChecked} });
  },
  setPrivate: function (artId, setToPrivate) {
    var art = Art.findOne(artId);

    // Make sure only the task owner can make a task private
    if (art.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Art.update(artId, { $set: { private: setToPrivate } });
  },
  testSSR: function() {
    if (Meteor.isServer) {
      var html = SSR.render("artSSR", {
        art: Art.find({}).fetch(),
      });
      console.log("-----\n", html);
    }
  },
  incArtViews: function(artId) {
    Art.update({_id: artId}, {$inc: {views: 1}});
  },
});


Meteor.startup(function () {
 if(Meteor.isClient){
 }
 if(Meteor.isClient){
     // SEO.config({
     //   title: 'vertexshaderart.com',
     //   meta: {
     //     'apple-mobile-web-app-capable': "yes",
     //     'apple-mobile-web-app-status-bar-style': "black",
     //     'HandheldFriendly': "True",
     //     'MobileOptimized': "320",
     //     'viewport': "width=device-width, target-densitydpi=160dpi, initial-scale=1.0, minimal-ui",
     //     'description': 'vertexshaderart.com - realtime vertex shader art',
     //   },
     //   og: {
     //     'image': 'http://vertexshaderart.com/static/resources/images/vertexshaderart.png',
     //   },
     // });
 }
});


