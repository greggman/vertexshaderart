S_CURRENTLY_LOGGING_IN = "currentlyLoggingIn";
S_PENDING_LIKE = "pendingLike";
S_VIEW_STYLE = "viewstyle";
S_ART_OWNER_ID = "artOwnerId";
S_ART_NAME = "artName";

G_PAGE_SIZE = (Meteor.settings.public.app && Meteor.settings.public.app.pageSize) ? Meteor.settings.public.app.pageSize : 15;
G_PAGE_RANGE = 2;
G_NUM_PAGE_BUTTONS = G_PAGE_RANGE * 2 + 1;
G_RESERVED_NAMES = {
  "-anon-": true,
};

G_BAD_USERNAME_RE = /[:\/\\?%#\t\n\r]/
function isBadUsername(username) {
  return G_RESERVED_NAMES[username.toLowerCase()] ||
         G_BAD_USERNAME_RE.test(username);
}

var S_ZEROS = "0000000000";
function padZeros(v, len) {
  var s = v.toString();
  return S_ZEROS.substr(0, len - s.length) + s;
}

if (Meteor.isServer) {

  Meteor.publish("artForGrid", function (username, sortField, skip, limit) {
    var find = (username && username !== "undefined") ? {username: username} : {};
    var sort = {};
    sort[sortField] = -1;
    var options = {
      fields: {settings: false},
      sort: sort,
      skip: skip,
      limit: limit,
    };
    return Art.find(find, options);
  });

  Meteor.publish("art", function(id) {
    return Art.find({_id: id});
  });

  Meteor.publish("artCount", function(username) {
    var find = {};
    if (username) {
      find.username = username;
    }
    Counts.publish(this, 'artCount', Art.find(find));
  });

  Meteor.publish("artRevisionCount", function(artId) {
    var find = {artId: artId};
    Counts.publish(this, 'artRevisionCount', ArtRevision.find(find));
  });

  Meteor.publish("artLikes", function (artId, userId) {
    return ArtLikes.find({artId: artId, userId: userId});
  });

  Meteor.publish("usernames", function(username) {
    return Meteor.users.find({username: username}, {fields: {username: 1}});
  });

  Meteor.publish("artrevision", function(id) {
    return ArtRevision.find({_id: id});
  });

  Meteor.publish("artrevisions", function(artId, skip, limit) {
    return ArtRevision.find({artId: artId}, {
      fields: {settings: false},
      skip: skip,
      limit: limit,
      sort: {createdAt: -1},
    });
  });


//  var templateRE = /<template\s+name="(.*?)">([\s\S]*?)<\/template>/g;
//  var ssrTemplates = Assets.getText('ssr-templates.html');
//  do {
//    var m = templateRE.exec(ssrTemplates);
//    if (m) {
//      SSR.compileTemplate(m[1], m[2]);
//    }
//  } while (m);

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

var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 3,
  },
  {
      _id: 'email',
      type: 'email',
      required: true,
      displayName: "email",
      re: /.+@(.+){2,}\.(.+){2,}/,
      errStr: 'Invalid email',
  },
  {
      _id: 'username_and_email',
      type: 'text',
      required: true,
      displayName: "Login",
  },
  pwd
]);

if (Meteor.isClient) {
  function getSorting() {
    var sorting;
    switch (Session.get(S_VIEW_STYLE)) {
      case "mostviewed":
        sorting = "views";
        break;
      case "newest":
        sorting = "createdAt";
        break;
      case "popular":
      default:
        sorting = "likes";
        break;
    }
    return sorting;
  }
}



if (Meteor.isClient) {
  Session.set(S_VIEW_STYLE, "popular");
  Pages = new Mongo.Collection(null);

  Template.gallery.helpers({
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Art.find({checked: {$ne: true}}).count();
    },
  });

  Template.artgrid.onCreated(function() {
    var instance = this;

    instance.autorun(function() {
      var route = Router.current();
      var pageId = route.data().page;
      var page = pageId - 1;
      var username = route.data().username;
      var skip = page * G_PAGE_SIZE;
      var sorting = getSorting();

      instance.subscribe('artForGrid', username, sorting, skip, G_PAGE_SIZE);
      instance.subscribe('artCount', username);
    });
  });

  Template.artgrid.helpers({
    art: function() {
      var sort = {};
      sort[getSorting()] = -1;
      return Art.find({}, { sort: sort });
    },
  });

  Template.artrevisions.helpers({
    revisions: function() {
      var route = Router.current();
      var artId = route.params._id;
      var pageId = parseInt(route.params._page) || 1;
      var page = pageId - 1;
      var skip = page * G_PAGE_SIZE;
      var limit = 10;
      return ArtRevision.find({artId: artId}, {
       // skip: skip,
        limit: limit,
        sort: { createdAt: -1 },
      });
    },
  });

  Template.revision.helpers({
    screenshotLink: function() {
      if (this.screenshotURL) {
        return { url: this.screenshotURL };
      } else if (this.screenshotDataId) {
        return { url: "/cfs/files/images/" + this.screenshotDataId };
//        return Images.findOne(({_id: this.screenshotDataId}));
      } else if (this.screenshotDataURL) {
        return { url:this.screenshotDataURL };
      } else {
        return { url:"/static/resources/images/missing-thumbnail.jpg" };
      }
    },
    createdAtFormatted: function() {
      var d = this.createdAt;
      return d.getFullYear() + "/" + padZeros(d.getMonth(), 2) + "/" + padZeros(d.getDate(), 2) + " " + padZeros(d.getHours(), 2) + ":" + padZeros(d.getMinutes(), 2);
    },
  });

  Template.artpiece.helpers({
    screenshotLink: function() {
      if (this.screenshotURL) {
        return { url: this.screenshotURL };
      } else if (this.screenshotDataId) {
        return { url: "/cfs/files/images/" + this.screenshotDataId };
//        return Images.findOne(({_id: this.screenshotDataId}));
      } else if (this.screenshotDataURL) {
        return { url:this.screenshotDataURL };
      } else {
        return { url:"/static/resources/images/missing-thumbnail.jpg" };
      }
    },
  });

  //Template.artitem.helpers({
  //  isOwner: function () {
  //    return this.owner === Meteor.userId();
  //  }
  //});
  //
  //Template.artitem.events({
  //  "click .toggle-checked": function () {
  //    // Set the checked property to the opposite of its current value
  //    Meteor.call("setChecked", this._id, ! this.checked);
  //  },
  //  "click .delete": function () {
  //    Meteor.call("deleteTask", this._id);
  //  },
  //  "click .toggle-private": function () {
  //    Meteor.call("setPrivate", this._id, ! this.private);
  //  },
  //});

  Template.vslogin.helpers({
    currentlyLoggingIn: function() {
      var currentlyLoggingIn = Session.get(S_CURRENTLY_LOGGING_IN) && !Meteor.user();
      return currentlyLoggingIn;
    }
  });

  Template.vslogin.events({
    "click #vsloginback": function() {
      Session.set(S_CURRENTLY_LOGGING_IN, false);
      Session.set(S_PENDING_LIKE, false);
    },
    "click #vslogin": function(e) {
      e.stopPropagation();
    },
  });

  Template.userinfo.helpers({
    artId: function() {
      var route = Router.current();
      return route.params._id;
    },
  });
  Template.userinfolike.helpers({
    likedByUser: function() {
      var route = Router.current();
      if (ArtLikes.findOne({artId: route.params._id, userId: Meteor.userId()})) {
        return true;
      } else {
        return false;
      }
    },
  });
  Template.userinfolike.events({
    "click #like.nouser": function() {
      Session.set(S_CURRENTLY_LOGGING_IN, true);
      Session.set(S_PENDING_LIKE, true);
    },
    "click #like.currentuser": function() {
      var route = Router.current();
      Meteor.call("likeArt", route.params._id);
    },
  });
  Template.userinfosignin.events({
    "click #user.nouser": function() {
      Session.set(S_CURRENTLY_LOGGING_IN, true);
    },
    "click #user.currentuser": function() {
      window.location.href = "/user/" + Meteor.user().username;
    },
  });

  Template.userprofile.helpers({
    editUsername: function() {
      return Session.get("editUsername");
    },
    userExists: function() {
      var route = Router.current();
      var username = route.params._username;
      if (Meteor.users.findOne({username: username})) {
        return true;
      }
      return false;
    },
    userIsCurrentUser: function() {
      var route = Router.current();
      return Meteor.userId() &&
             route.params._username === Meteor.user().username;
    },
  });

  Template.userprofile.events({
    "blur .usernameedit": function() {
      Session.set("editUsername", false);
      $(".infoContainer .username").show();
      $(".infoContainer .usernameedit").hide();
    },
    "click .username": function(e) {
      var route = Router.current();
      if (Meteor.userId() &&
          Meteor.user().username === route.params._username) {
        Session.set("editUsername", true);
        $(".infoContainer .username").hide();
        $(".infoContainer .usernameedit").show().focus();
      }
    },
    "change .usernameedit": function(e) {
      if (Meteor.userId()) {
        var username = e.target.value.trim();
        Meteor.call("changeUsername", username, function(error) {
          if (!error) {
            Session.set("editUsername", false);
            Router.go("/user/" + username);
            return;
          }
        });
      }
    },
    "click .logout": function() {
       if (Meteor.userId()) {
         Meteor.logout();
       }
    },
  });

  Template.pagination.helpers({
    pages: function() {
      var instance = Template.instance();
      var route = Router.current();
      var countVar = route.data().count;
      var count = Counts.get(countVar);
      var pageId = route.data().page;
      var page = pageId - 1;
      var numPages = (count + G_PAGE_SIZE - 1) / G_PAGE_SIZE | 0;
      var numPageButtons = G_NUM_PAGE_BUTTONS;
      var pageRange = G_PAGE_RANGE;
      var lastPage = numPages - 1;
      var path = route.data().path;

      if (window.screen && window.screen.availWidth < 400) {
        numPageButtons = 0;
        pageRange = 0;
      }

      Pages.remove({});
      if (numPages > 1) {
        var needPrevNext = numPages > numPageButtons;
        if (needPrevNext) {
          var prev = Math.max(page, 1);
          Pages.insert({path: path, pagenum: "<<", pageid: prev, samepageclass: pageId === prev ? "selected" : ""});
        }

        var min = page - pageRange;
        var max = page + pageRange;
        if (min < 0) {
          max = max - min;
          min = 0;
        }
        if (max > lastPage) {
          min = Math.max(0, min - (max - lastPage));
          max = lastPage;
        }
        if (min !== max) {
          for (var ii = min; ii <= max; ++ii) {
            Pages.insert({path: path, pagenum: ii + 1, pageid: ii + 1, samepageclass: ii === page ? "selected" : ""});
          }
        }

        if (needPrevNext) {
          var next = Math.min(lastPage, page + 1);
          Pages.insert({path: path, pagenum: ">>", pageid: next + 1, samepageclass: page === next ? "selected" : ""});
        }
      }
      return Pages.find({});
    },
  });

  Template.sorting.events({
    "click .sorting .popular": function() {
      Session.set(S_VIEW_STYLE, "popular");
    },
    "click .sorting .newest": function() {
      Session.set(S_VIEW_STYLE, "newest");
    },
    "click .sorting .mostviewed": function() {
      Session.set(S_VIEW_STYLE, "mostviewed");
    },
  });

  Template.sorting.helpers({
    selected: function(sortType) {
      return Session.get(S_VIEW_STYLE) === sortType ? "selected" : "";
    },
  });

  function SetArt(data) {
    var settings;
    Session.set(S_ART_OWNER_ID, undefined);
    Session.set(S_ART_NAME, "unnamed");
    if (data && data.settings) {
      try {
        settings = JSON.parse(data.settings);
        Session.set(S_ART_OWNER_ID, data.owner);
        Session.set(S_ART_NAME, data.name);
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

  function save() {
    if (window.vsart.isSaveable()) {
      Session.set("saving", true);
      window.vsSaveData = {
        settings: window.vsart.getSettings(),
        screenshot: window.vsart.takeScreenshot("image/jpeg", 0.8),
      };
    }
  }

  Template.artpage.events({
    "click #save": function() {
      save();
    },
    "click #new": function() {
      window.location.href = "/new/";
    },
    "keydown": function(e) {
      if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        save();
      }
    }
  });

  Template.save.helpers({
    saving: function() {
      return Session.get("saving");
    },
    artname: function() {
      return Session.get(S_ART_NAME);
    },
    isCurrentUsersExistingArt: function() {
      var route = Router.current();
      var artId = route.params ? route.params._id : undefined;
      return artId && Meteor.userId() && Meteor.userId() === Session.get(S_ART_OWNER_ID);
    },
    screenshot: function() {
      if (!window.vsSaveData) {
        console.log("no save data");
        Session.set("saving", false);
        return "";
      }
      return window.vsSaveData.screenshot.dataURL;
    },
  });

  Template.save.events({
    "click #savedialogback": function() {
      Session.set("saving", false);
    },
    "click #savedialog": function(e) {
      e.stopPropagation();
    },
    "click #saveit, click #savenew": function() {
      var route = Router.current();
      var origId;
      if (route && route.params) {
        origId = route.params._id;
      }
      window.vsart.markAsSaving();
      Session.set("saving", false);
      Meteor.call("addArt", $("#savedialog #name").val(), origId, window.vsSaveData, function(err, result) {
        window.vsart.markAsSaved();
        if (err) {
          console.error(err);
          return;
        }
        var url = "/art/" + result;
        Router.go(url);
      });
    },
    "click #updateit": function() {
      var route = Router.current();
      var origId;
      if (route && route.params) {
        origId = route.params._id;
      }
      window.vsart.markAsSaving();
      Session.set("saving", false);
      Meteor.call("updateArt", $("#savedialog #name").val(), origId, window.vsSaveData, function(err, result) {
        window.vsart.markAsSaved();
      });
    },
    "click #cancel": function() {
      Session.set("saving", false);
    },
    "click .signin": function() {
      Session.set(S_CURRENTLY_LOGGING_IN, true);
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
  });

}

var mySubmitFunc = function(error, state){
  if (error) {
    console.log("login error");
  } else if (state === "signIn") {
      // Successfully logged in
      // ...
    console.log("sign in");
  } else  if (state === "signUp") {
      // Successfully registered
      // ...
    console.log("sign up");
  }
};

AccountsTemplates.configure({
  onSubmitHook: mySubmitFunc,
});

Router.configure({
  trackPageView: true,
});

Router.map(function() {
  this.route('/', {
    template: 'gallery',
    data: function() {
      var page = 1;
      return {
        page: page,
        path: '/gallery',
        count: 'artCount',
      };
    },
  });
  this.route('/gallery/:_page', {
    template: 'gallery',
    data: function() {
      var page = parseInt(this.params._page);
      return {
        page: page,
        path: '/gallery',
        count: 'artCount',
      };
    },
  });
  this.route('/new/', function() {
    this.render('artpage');
  });
  this.route('/user/:_username', {
    template: 'userprofile',
    data: function() {
      var page = 1;
      var username = this.params._username;
      return {
        page: page,
        username: username,
        path: '/user/' + username,
        count: 'artCount',
      };
    },
    subscriptions: function() {
      var subs = [];
      subs.push(Meteor.subscribe('usernames', this.params._username));
      return subs;
    },
    cache: 5,
    expire: 5,
  });
  this.route('/user/:_username/:_page', {
    template: 'userprofile',
    data: function() {
      var page = parseInt(this.params._page);
      var username = this.params._username;
      return {
        page: page,
        username: username,
        path: '/user/' + username,
        count: 'artCount',
      };
    },
    subscriptions: function() {
      var subs = [];
      subs.push(Meteor.subscribe('usernames', this.params._username));
      return subs;
    },
    cache: 5,
    expire: 5,
  });
  this.route('/art/:_id', {
    template: 'artpage',
    subscriptions: function() {
      var subs = [
        Meteor.subscribe('art', this.params._id),
      ];
      if (Meteor.userId()) {
        subs.push(Meteor.subscribe('artLikes', this.params._id, Meteor.userId()));
      }
      return subs;
    },
    cache: 5,
    expire: 5,
    data: function() {
      return Art.findOne({_id: this.params._id});
    },
    action: function() {
      if (this.ready()) {
        Session.set(S_CURRENTLY_LOGGING_IN, false);
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
  this.route('/art/:_id/revision/:_revisionId', {
    template: 'artpage',
    subscriptions: function() {
      var subs = [
        Meteor.subscribe('artrevision', this.params._revisionId),
        Meteor.subscribe('art', this.params._id),
      ];
      if (Meteor.userId()) {
        subs.push(Meteor.subscribe('artLikes', this.params._id, Meteor.userId()));
      }
      return subs;
    },
    cache: 5,
    expire: 5,
    data: function() {
      return ArtRevision.findOne({_id: this.params._revisionId});
    },
    action: function() {
      if (this.ready()) {
        Session.set(S_CURRENTLY_LOGGING_IN, false);
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
      //
      // -- let's not track views for revisions
      //
      // var artId = this.params._id;
      // var lastArtId = Session.get("view_art_id");
      // if (artId !== lastArtId) {
      //   Session.set("view_art_id", artId);
      //   Meteor.call("incArtViews", artId);
      // }
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
  this.route('/art/:_id/revisions/', {
    template: 'artrevisions',
    data: function() {
      var artId = this.params._id;
      return {
        artId: artId,
        page: 1,
        path: '/art/' + artId + '/revisions',
        count: 'artRevisionCount',
      };
    },
    subscriptions: function() {
      var artId = this.params._id;
      var subs = [
        Meteor.subscribe('art', artId),
        Meteor.subscribe('artrevisions', artId, 0, G_PAGE_SIZE),
        Meteor.subscribe('artRevisionCount', artId),
      ];
      return subs;
    },
    cache: 5,
    expire: 5,
  });
  this.route('/art/:_id/revisions/:_page', {
    template: 'artrevisions',
    data: function() {
      var artId = this.params._id;
      var page = this.params._page;
      return {
        artId: artId,
        page: page,
        path: '/art/' + artId + '/revisions',
        count: 'artRevisionCount',
      };
    },
    subscriptions: function() {
      var page = parseInt(this.params._page) - 1;
      var skip = page * G_PAGE_SIZE;
      var artId = this.params._id;
      var subs = [
        Meteor.subscribe('art', artId),
        Meteor.subscribe('artrevisions', artId, skip, G_PAGE_SIZE),
        Meteor.subscribe('artRevisionCount', artId),
      ];
      return subs;
    },
    cache: 5,
    expire: 5,
  });
  this.route('imageFiles', {
    where: 'server',
    path: /^\/cfs\/files\/(.*)$/,
    action: Meteor.wrapAsync(function() {
      if (Meteor.isServer) {
        var fs = Npm.require('fs');
        var path = Npm.require('path');
      }
      return function() {
        var req = this.request;
        var res = this.response;

        try {
          var name = this.params[0].replace(/\//g, '-');
          var filePath = IMAGE_PATH + '/' + name;
          var ext = path.extname(filePath)
          if (fs.existsSync(filePath)) {
            var data = fs.readFileSync(filePath);
            var type = "image/png";
            if (path.extname(filePath) === ".jpg") {
              type = "image/jpg";
            }
            res.writeHead(200, {
              'Content-Type': type,
              'Cache-Control': 'public, max-age=8640000',
            });
            res.write(data, null);
            res.end();
            return;
          } else {
            console.error("request for non-existent file:", req.url);
            res.statusCode = 404;
            res.end("no such image:" + req.url);
            return;
          }
        } catch (e) {
          console.error(e);
          if (e.stack) {
            console.error(e.stack);
          }
        }
        console.error("error in request for:", req.url);
        res.statusCode = 400;
        res.end("error in request for:" + req.url);
      };
    }()),
  });
});

var G_VALID_LETTERS = "abcdefghijklmnopqrstuvwxyz0123456789";
function randomName(len) {
  var l = [];
  for (var ii = 0; ii < len; ++ii) {
    var ndx = (Math.random() * G_VALID_LETTERS.length + Date.now()) % G_VALID_LETTERS.length;
    l.push(G_VALID_LETTERS.substr(ndx, 1));
  }
  return l.join("");
}

var saveDataURLToFile = function() {
  if (Meteor.isServer) {
    var fs = Npm.require('fs');
    var path = Npm.require('path');
  }
  var dataURLHeaderRE = /^data:(.*?),/;

  return function saveDataURLToFile(dataURL) {
    var match = dataURLHeaderRE.exec(dataURL);
    if (!match) {
      throw new Meteor.Error("bad dataURL: Does not start with 'data:...,'");
    }
    var spec = match[1].split(";");
    if (spec.length === 1) {
      spec.unshift("");
    }

    var header   = match[0];
    var mimeType = spec[0];
    var encoding = spec[1];
    var ext = "." + mimeType.split("/").pop();
    if (ext === ".jpeg") {
      ext = ".jpg";
    }

    if (Meteor.isClient) {
      return "/static/resources/images/saving-thumbnail.jpg";
    }

    var found = false;
    while (!found) {
      var filename = "images-" + randomName(17) + '-thumbnail' + ext;
      var fullpath = path.join(IMAGE_PATH, filename);
      found = !fs.existsSync(fullpath);
    }

    fs.writeFileSync(fullpath, dataURL.substr(header.length), encoding);
    return url = "/cfs/files/" + filename.replace("-", "/"); // replaces only first '-'
  };
}();

function addArt(name, origId, data) {
  // Make sure the user is logged in before inserting art
  //    if (! Meteor.userId()) {
  //      throw new Meteor.Error("not-authorized");
  //    }
  name = name || "unnamed";
  var owner = Meteor.userId();
  var username = Meteor.userId() ? Meteor.user().username : "-anon-";
  var settings = data.settings || {};
  var screenshotDataURL = data.screenshot.dataURL || "";
  var screenshotURL = "";

  if (screenshotDataURL) {
    screenshotURL = saveDataURLToFile(screenshotDataURL);
  }

  var artId = Art.insert({
    owner: owner,
    createdAt: new Date(),
    origId: origId,
    name: name,
    username: username,
    settings: JSON.stringify(settings),
    screenshotURL: screenshotURL,
    views: 0,
    likes: 0,
  });
  var revisionId = ArtRevision.insert({
    createdAt: new Date(),
    owner: owner,
    origId: origId,
    artId: artId,
    name: name,
    username: username,
    settings: JSON.stringify(settings),
    screenshotURL: screenshotURL,
  });
  Art.update({_id: artId},
    {$set: {
      revisionId: revisionId,
    },
  });
  return artId;
};

function updateArt(name, origId, data) {
  var owner = Meteor.userId();
  if (!owner) {
    throw new Meteor.Error("not-loggedin", "use must be logged in to update");
  }
  var arts = Art.find({_id: origId}).fetch();
  if (!arts || arts.length != 1) {
    throw new Meteor.Error("not-exists", "can not update non-existant art");
  }
  var art = arts[0];
  if (art.owner !== owner) {
    throw new Meteor.Error("not-owner", "must be onwer to update art");
  }

  var username = Meteor.user().username;
  var settings = data.settings || {};
  var screenshotDataURL = data.screenshot.dataURL || "";
  var screenshotURL = "";

  if (screenshotDataURL) {
    screenshotURL = saveDataURLToFile(screenshotDataURL);
  }

  name = name || "unnamed";
  var revisionId = ArtRevision.insert({
    createdAt: new Date(),
    owner: owner,
    origId: origId,
    artId: art._id,
    prevRevisionId: art.revisionId,
    name: name,
    username: username,
    settings: JSON.stringify(settings),
    screenshotURL: screenshotURL,
  });
  Art.update({_id: origId},
    {$set: {
      revisionId: revisionId,
      name: name,
      settings: JSON.stringify(settings),
      screenshotURL: screenshotURL,
    },
  });
}


Meteor.methods({
  addArt: addArt,
  updateArt: updateArt,
  likeArt: function(artId) {
     var userId = Meteor.userId();
     if (!userId) {
       throw new Meteor.Error("not-loggedin", "can not like something if not logged in");
     }
     var like = ArtLikes.findOne({artId: artId, userId: userId});
     if (like) {
       ArtLikes.remove(like._id);
     } else {
       ArtLikes.insert({artId: artId, userId: userId});
     }
     Art.update({_id: artId}, {$inc: {likes: like ? -1 : 1}});
  },
  changeUsername: function(username) {
    username = username.trim();
    if (!Meteor.userId()) {
      throw new Meteor.Error("not loggedin", "please login to change your username");
    }
    if (!username) {
      throw new Meteor.Error("bad data", "username is empty or mostly empty");
    }
    if (isBadUsername(username)) {
      throw new Meteor.Error("bad data", "not a valid name (no #%?/\\: allowed");
    }
    if (Meteor.user().username === username) {
      return;
    }
    if (!Meteor.isServer) {
      return;
    }
    try {
      Accounts.setUsername(Meteor.userId(), username);
    } catch(e) {
      console.log("could not set username");
      throw e;
    }
    Art.update({owner: Meteor.userId()}, {$set: {username: username}}, {multi: true});
  },
  //deleteArt: function (artId) {
  //  var art = Art.findOne(artId);
  //  if (art.private && art.owner !== Meteor.userId()) {
  //    // If the task is private, make sure only the owner can delete it
  //    throw new Meteor.Error("not-authorized");
  //  }
  //  Art.remove(artId);
  //},
  //setChecked: function (artId, setChecked) {
  //  var art = Art.findOne(artId);
  //  if (art.private && art.owner !== Meteor.userId()) {
  //    // If the task is private, make sure only the owner can check it off
  //    throw new Meteor.Error("not-authorized");
  //  }
  //
  //  Art.update(artId, { $set: { checked: setChecked} });
  //},
  //setPrivate: function (artId, setToPrivate) {
  //  var art = Art.findOne(artId);
  //
  //  // Make sure only the task owner can make a task private
  //  if (art.owner !== Meteor.userId()) {
  //    throw new Meteor.Error("not-authorized");
  //  }
  //
  //  Art.update(artId, { $set: { private: setToPrivate } });
  //},
  //testSSR: function() {
  //  if (Meteor.isServer) {
  //    var html = SSR.render("artSSR", {
  //      art: Art.find({}).fetch(),
  //    });
  //    console.log("-----\n", html);
  //  }
  //},
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


