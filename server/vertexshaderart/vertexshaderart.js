Art = new Mongo.Collection("art");

if (Meteor.isServer) {
  Meteor.publish("art", function () {
    return Art.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });

  var templateRE = /<template\s+name="(.*?)">([\s\S]*?)<\/template>/g;
  var ssrTemplates = Assets.getText('ssr-templates.html');
  do {
    var m = templateRE.exec(ssrTemplates);
    if (m) {
      SSR.compileTemplate(m[1], m[2]);
    }
  } while (m);
}

if (Meteor.isClient) {
  Meteor.subscribe("art");

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
      data: function() {
        return Art.findOne({_id: this.params._id});
      },
      action: function() {
       this.subscribe('art', this.params._id).wait();

        if (this.ready()) {
          this.render();
        } else {
          this.render('loading');
        }
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
    Art.insert({
      createdAt: new Date(),
      owner: owner,
      username: username,
      settings: JSON.stringify(settings),
      screenshotDataURL: screenshotDataURL,
    }, function(error, result) {
       if (Meteor.isClient) {
         var url = "/art/" + result;
         window.history.replaceState({}, "", url);
         window.vsart.markAsSaved();
       }
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
});


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
      return null;
  });

  Router.map(function() {
//    this.route('root', {
//      where: 'server',
//      path: '/',
//      action: function() {
//        var html = SSR.render("artGallerySSR", {
//          art: Art.find({}).fetch(),
//        });
//        this.response.end(html);
//      },
//    });
//
//    this.route('artpiece', {
//      where: 'server',
//      path: '/art/:_id',
//      action: function() {
//        var html = SSR.render("artGallerySSR", {
//          art: Art.find({}).fetch(),
//        });
//        this.response.end(html);
//      },
//    });
  });

}
