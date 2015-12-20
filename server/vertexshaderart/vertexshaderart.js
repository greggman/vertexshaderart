S_CURRENTLY_SHARING = "currentlySharing";
S_CURRENTLY_LOGGING_IN = "currentlyLoggingIn";
S_EMBED = "embed";
S_PENDING_LIKE = "pendingLike";
S_ART_OWNER_ID = "artOwnerId";
S_ART_NAME = "artName";
S_ART_OWNER_NAME = "artOwnerName";
S_HELP_DIALOG_URL = "helpDialogUrl";
S_SAVE_VISIBILITY = "savevis";

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

NumberLessThan100 = Match.Where(function(v) {
  check(v, Number);
  return v >= 0 && v < 100;
});

NumberLessThan200 = Match.Where(function(v) {
  check(v, Number);
  return v >= 0 && v < 200;
});

StringLengthLessThan100k = Match.Where(function(v) {
  check(v, String);
  return v.length < 100 * 1024;
});

StringIsCommentString = Match.Where(function(v) {
  check(v, String);
  return v.length < 20 * 1024;
});

StringLengthLessThan2k = Match.Where(function(v) {
  check(v, String);
  return v.length < 2 * 1024;
});

function findNextPrevArtRevision(artId, date, next) {
  check(artId, String);
  return ArtRevision.find({
    artId: artId,
    createdAt: (next ? {$gt: date} : {$lt: date}),
    $or: [
      {
        private: {$ne: true},
        unlisted: {$ne: true},
      },
      { owner: this.userId },
    ],
  }, {
    fields: {settings: false, notes: false,},
    limit: 1,
    sort: {createdAt: next ? 1 : -1},
  });
};

if (Meteor.isServer) {
  Meteor.publish("artForGrid", function(username, sortField, skip, limit) {
    var find = {
      private: {$ne: true},
      unlisted: {$ne: true},
    };
    if (username && username !== "undefined") {
      check(username, String);
      find = {
        username: username,
        $or: [
          {
            private: {$ne: true},
            unlisted: {$ne: true},
          },
          { owner: this.userId },
        ],
      };
    }
    check(sortField, String);
    check(limit, NumberLessThan100);
    check(skip, Number);
    var sort = {};
    sort[sortField] = -1;
    var options = {
      fields: {settings: false, notes: false,},
      sort: sort,
      skip: skip,
      limit: limit,
    };
    return Art.find(find, options);
  });

  Meteor.publish("artSelection", function(sortField, limit) {
    var find = {
      private: {$ne: true},
      unlisted: {$ne: true},
    };
    check(sortField, String);
    check(limit, NumberLessThan100);
    var sort = {};
    sort[sortField] = -1;
    var options = {
      fields: {settings: false, notes: false,},
      sort: sort,
      limit: limit,
    };
    return Art.find(find, options);
  });

  Meteor.publish("hotlist", function(limit) {
    check(limit, NumberLessThan200);
    var find = {
      private: {$ne: true},
      unlisted: {$ne: true},
    };
    var options = {
      limit: limit,
      sort: { rank: -1 },
    };
    return Art.find(find, options);
  });

  Meteor.publish("art", function(id) {
    check(id, String);
    return Art.find({
      _id: id,
      $or: [
        {
          private: {$ne: true},
        },
        { owner: this.userId },
      ],
    });
  });

  Meteor.publish("artCount", function(username) {
    var find = {};
    if (username) {
      check(username, String);
      find.username = username;
    }
    Counts.publish(this, 'artCount', Art.find(find));
  });

  Meteor.publish("artRevisionCount", function(artId) {
    check(artId, String);
    var find = {
      artId: artId,
      $or: [
        {
          private: {$ne: true},
          unlisted: {$ne: true},
        },
        { owner: this.userId },
      ],
    };
    Counts.publish(this, 'artRevisionCount', ArtRevision.find(find));
  });

  Meteor.publish("artLikes", function (artId, userId) {
    check(artId, String);
    check(userId, String);
    return ArtLikes.find({artId: artId, userId: userId});
  });

  Meteor.publish("usernames", function(username) {
    check(username, String);
    return Meteor.users.find({username: username}, {
      fields: {
        username: 1,
        profile: 1,
      },
    });
  });

  Meteor.publish("artrevision", function(id) {
    check(id, String);
    return ArtRevision.find({
      _id: id,
      $or: [
        {
          private: {$ne: true},
        },
        { owner: this.userId },
      ],
    });
  });

  Meteor.publish("artrevisions", function(artId, skip, limit) {
    check(artId, String);
    check(limit, NumberLessThan100);
    check(skip, Number);
    return ArtRevision.find({
      artId: artId,
      $or: [
        {
          private: {$ne: true},
          unlisted: {$ne: true},
        },
        { owner: this.userId },
      ],
    }, {
      fields: {settings: false, notes: false,},
      skip: skip,
      limit: limit,
      sort: {createdAt: -1},
    });
  });

  Meteor.publish("artNextRevision", function(artId, date) {
    return findNextPrevArtRevision(artId, date, true);
  });
  Meteor.publish("artPrevRevision", function(artId, date) {
    return findNextPrevArtRevision(artId, date, false);
  });


  Meteor.publish("artComments", function(artId, skip, limit) {
    check(artId, String);
    var options = {
      sort: {createdAt: -1},
    };
    if (skip) {
      check(skip, Number);
      options.skip = skip;
    }
    if (limit) {
      check(limit, NumberLessThan100);
      options.limit = limit;
    }
    return Comments.find({
      artId: artId,
    }, options);
  });

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

  Meteor.publish("commentsWithArt", function(skip, limit) {
    check(skip, Number);
    check(limit, NumberLessThan100);
    var commentsCursor = Comments.find({}, {
      skip: skip,
      limit: limit,
      sort: { createdAt: -1 },
    });
    var artIds = commentsCursor.map(function(c) { return c.artId; });
    return [
      commentsCursor,
      Art.find({
        _id: {$in: artIds},
      }, {
        fields: {settings: false, notes: false,},
      }),
    ];
  });
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
  marked.setOptions({
    sanitize: true,
    breaks: true,
  });
  function getSortingType(sort) {
    switch (sort) {
      case "mostviewed":
        return "views";
      case "newest":
        return "modifiedAt";
      case "popular":
        return "likes";
      case "hot":
      default:
        return "rank";
    }
  }
}

/**
 * Replace %(id)s in strings with values in objects(s)
 *
 * Given a string like `"Hello %(name)s from $(user.country)s"`
 * and an object like `{name:"Joe",user:{country:"USA"}}` would
 * return `"Hello Joe from USA"`.
 *
 * @function
 * @param {string} str string to do replacements in
 * @param {Object|Object[]} params one or more objects.
 * @returns {string} string with replaced parts
 * @memberOf module:Strings
 */
var replaceParams = (function() {
  var replaceParamsRE = /%\(([^\)]+)\)s/g;

  return function(str, params) {
    if (!params.length) {
      params = [params];
    }

    return str.replace(replaceParamsRE, function(match, key) {
      var keys = key.split('.');
      for (var ii = 0; ii < params.length; ++ii) {
        var obj = params[ii];
        for (var jj = 0; jj < keys.length; ++jj) {
          var part = keys[jj];
          obj = obj[part];
          if (obj === undefined) {
            break;
          }
        }
        if (obj !== undefined) {
          return obj;
        }
      }
      console.error("unknown key: " + key);
      return "%(" + key + ")s";
    });
  };
}());

function objectToSearchString(obj, options) {
  options = options || {};
  return (options.prefix !== undefined ? options.prefix : "?") + Object.keys(obj).filter(function(key) {
    return obj[key] !== undefined;
  }).map(function(key) {
    return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
  }).join(options.separator || "&");
}

var popup = function(url, title) {
  var options = objectToSearchString({
    resizable: true,
    width: 600,
    height: 400,
    scrollbars: true,
    status: true,
    location: true,
  }, {
    prefix: "",
    separator: ",",
  });
  var newWindow = window.open(url, title, options);
  if (window.focus) {
    newWindow.focus();
  }
;};


if (Meteor.isClient) {
  Pages = new Mongo.Collection(null);

  Template.artselection.onCreated(function() {
    var instance = this;
    instance.autorun(function() {
      var sort = getSortingType(instance.data.sort);
      instance.subscribe('artSelection', sort, parseInt(instance.data.limit));
    });
  });

  Template.artselection.helpers({
    art: function() {
      var instance = Template.instance();
      var sortField = getSortingType(instance.data.sort);
      var sort = {};
      sort[sortField] = -1;
      var options = {
        sort: sort,
        limit: parseInt(instance.data.limit),
      };
      return Art.find({}, options);
    },
  });

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
      var sorting = route.data().sortType;

      instance.subscribe('artForGrid', username, sorting, skip, G_PAGE_SIZE);
      instance.subscribe('artCount', username);
    });
  });

  Template.artgrid.helpers({
    art: function() {
      var route = Router.current();
      var sort = {};
      sort[route.data().sortType] = -1;
      return Art.find({}, { sort: sort });
    },
  });

  Template.artrevisions.onCreated(function() {
    var instance = this;
    instance.autorun(function() {
      var route = Router.current();
      var artId = route.data().artId;
      var pageId = route.data().page;
      var page = pageId - 1;
      var skip = page * G_PAGE_SIZE;
      instance.subscribe('art', artId);
      instance.subscribe('artrevisions', artId, skip, G_PAGE_SIZE);
    });
  });

  Template.artrevisions.helpers({
    revisions: function() {
      return ArtRevision.find({}, {
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
    isOwner: function() {
      return this.owner === Meteor.userId();
    },
    createdAtFormatted: function() {
      var d = this.createdAt;
      return d.getFullYear() + "/" + padZeros(d.getMonth(), 2) + "/" + padZeros(d.getDate(), 2) + " " + padZeros(d.getHours(), 2) + ":" + padZeros(d.getMinutes(), 2);
    },
  });

  Template.publicity.helpers({
    isOwner: function() {
      return this.owner === Meteor.userId();
    },
  });

  function safeGetTime(date) {
    return date ? date.getTime() : 0;
  }

  Template.artpiece.helpers({
    hasRevisions: function() {
      return Router.current() &&
             Router.current().data &&
             Router.current().data().showRevisions &&
             safeGetTime(this.createdAt) !== safeGetTime(this.modifiedAt);
    },
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

  Template.atForm.events({
    "click .at-terms-link": function(e) {
      e.preventDefault();
      e.stopPropagation();
      Session.set(S_HELP_DIALOG_URL, e.target.href);
    },
  });


  Template.vslogin.helpers({
    currentlyLoggingIn: function() {
      var currentlyLoggingIn = Session.get(S_CURRENTLY_LOGGING_IN) && !Meteor.user();
      return currentlyLoggingIn;
    },
    helpDialog: function() {
      return Session.get(S_HELP_DIALOG_URL);
    },
  });

  Template.vslogin.events({
    "click #vsloginback": function() {
      Session.set(S_CURRENTLY_LOGGING_IN, false);
      Session.set(S_PENDING_LIKE, false);
    },
    "click #vslogin": function(e) {
      e.stopPropagation();
    },
    "click #loginhelpdialog": function(e) {
      e.stopPropagation();
      Session.set(S_HELP_DIALOG_URL, "");
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
  Template.signin.events({
    "click .nouser": function() {
      Session.set(S_CURRENTLY_LOGGING_IN, true);
    },
  });

  function getCaption() {
    return replaceParams(" [%(name)s] by %(username)s", {
      name: Session.get(S_ART_NAME),
      username: Session.get(S_ART_OWNER_NAME),
    });
  }

  function getSimpleDate(d) {
    if (!d) {
      return "-";
    }
    var day = d.getDate();
    var month = d.getMonth() + 1; //Months are zero based
    var year = d.getFullYear();
    return year + "-" + month + "-" + day;
  }

  Template.share.events({
    "click .share": function(e) {
      Session.set(S_CURRENTLY_SHARING, !Session.get(S_CURRENTLY_SHARING));
    },
    "click .sn-facebook": function(e) {
      e.stopPropagation();
      Session.set(S_CURRENTLY_SHARING, false);
      var title = "Share on Facebook";
      var url = "https://www.facebook.com/dialog/feed" + objectToSearchString({
        app_id: 140478046311045,
        display: "popup",
        caption: getCaption(),
        link: window.location.href,
        redirect_uri: Meteor.absoluteUrl("close"),
      });
      popup(url, title, "");
    },
    "click .sn-twitter": function(e) {
      e.stopPropagation();
      Session.set(S_CURRENTLY_SHARING, false);
      var title = "Share on Twitter";
      var url = "https://twitter.com/home" + objectToSearchString({
        status: window.location.href + getCaption(),
      });
      popup(url, title, "");
    },
    "click .sn-tumblr": function(e) {
      e.stopPropagation();
      Session.set(S_CURRENTLY_SHARING, false);
      var title = "Share on Tumblr";
      var url = "https://www.tumblr.com/widgets/share/tool" + objectToSearchString({
        posttype: "link",
        title: Session.get(S_ART_NAME),
        content: window.location.href,
        caption: getCaption(),
        url: window.location.href,
        "show-via": true,
      });
      popup(url, title, "");
    },
    "click .sn-embed": function(e) {
      e.stopPropagation();
      Session.set(S_CURRENTLY_SHARING, false);
      var html = '<iframe width="700" height="400" src="' + window.location.href + '" frameborder="0" allowfullscreen></iframe>';
      Session.set(S_EMBED, html);
    },
  });

  Template.share.helpers({
    isSharing: function() {
      return Session.get(S_CURRENTLY_SHARING);
    },
  });

  Template.shareform.helpers({
    embed: function() {
      return Session.get(S_EMBED);
    },
  });

  Template.shareform.events({
    "click .shareform": function() {
      Session.set(S_EMBED, "");
    },
    "click .shareform>div": function(e) {
      e.stopPropagation();
    },
  });

  Template.privacypopup.events({
    "click li": function(e) {
      e.stopPropagation();
      Dropdowns.hideAll();
      Meteor.call("setPrivate", this._id, e.currentTarget.dataset.option);
    },
  });

  Template.userprofile.onCreated(function() {
    var instance = this;

    instance.autorun(function() {
      var route = Router.current();
      var username = route.data().username;

      instance.subscribe('usernames', username);
    });
  });

  Template.userprofile.helpers({
    editUsername: function() {
      return Session.get("editUsername");
    },
    userExists: function() {
      var route = Router.current();
      var username = route.data().username;
      if (Meteor.users.findOne({username: username})) {
        return true;
      }
      return false;
    },
    userIsCurrentUser: function() {
      var route = Router.current();
      return Meteor.userId() && Meteor.user() &&
             route.params._username === Meteor.user().username;
    },
    userdata: function() {
      var route = Router.current();
      var username = route.data().username;
      return Meteor.users.findOne({username: username});
    },
    userinfoprocessed: function() {
      var route = Router.current();
      var username = route.data().username;
      var user = Meteor.users.findOne({username: username});
      if (user && user.profile && user.profile.info) {
        return marked(user.profile.info);
      }
    },
    avatar: function() {
      var route = Router.current();
      var username = route.data().username;
      var user = Meteor.users.findOne({username: username});
      var url = "";
      if (user && user.profile) {
        url = user.profile.avatarUrl;
      }
      return getAvatarUrl(url);
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
      if (Meteor.userId() && Meteor.user() &&
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
    "blur .userinfoedit": function() {
      Session.set("editUserinfo", false);
      $(".infoContainer .userinfo").show();
      $(".infoContainer .userinfoedit").hide();
    },
    "click .userinfo": function(e) {
      var route = Router.current();
      if (Meteor.userId() && Meteor.user() &&
          Meteor.user().username === route.params._username) {
        e.preventDefault();
        Session.set("editUserinfo", true);
        $(".infoContainer .userinfo").hide();
        $(".infoContainer .userinfoedit").show().focus();
      }
    },
    "keydown .userinfoedit": function(e) {
      if (e.keyCode === 13 && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (Meteor.userId()) {
          var info = e.target.value.trim();
          Meteor.call("changeUserinfo", info, function(error) {
            if (!error) {
              Session.set("editUserinfo", false);
              $(".infoContainer .userinfo").show();
              $(".infoContainer .userinfoedit").hide();
              return;
            }
          });
        }
      }
    },
    "click .logout": function() {
       if (Meteor.userId()) {
         Meteor.logout();
       }
    },
  });

  Template.markedfield.helpers({
    userIsCurrentUser: function() {
      return this.settings.userIsCurrentUser();
    },
    textprocessed: function() {
      return marked(this.settings.getText() || "");
    },
    text: function() {
      return this.settings.getText();
    },
  });

  Template.markedfield.events({
    "blur .markededit": function(e, template) {
      template.$(".markeddisp").show();
      template.$(".markededitwrap").hide();
      this.settings.setText(e.target.value.trim());
    },
    "click .markeddisp": function(e, template) {
      if (this.settings.canEdit()) {
        e.preventDefault();
        template.$(".markeddisp").hide();
        template.$(".markededitwrap").show();
        template.$(".markededit").focus();
      }
    },
    "keydown .markededit": function(e, template) {
      if (this.settings.finishOnEnter && e.keyCode === 13 && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        this.settings.setText(e.target.value.trim());
      }
    },
  });

  Template.meta.onCreated(function() {
    var instance = this;
    instance.autorun(function() {
      var route = Router.current();
      var data = (route && route.data && typeof route.data === "function") ? (route.data() || {}) : {};
      var artId = data.artId || data._id;
      if (artId) {
        instance.subscribe('artComments', artId);
        instance.subscribe('artNextRevision', artId, data.createdAt);
        instance.subscribe('artPrevRevision', artId, data.createdAt);
      }
    });
  });

  Template.meta.events({
    'click .post': function(e, template) {
      var route = Router.current();
      var artId = route.params._id;
      if (!artId) {
        console.log("can not add comment to unsaved art");
        return;
      }
      var ta = template.find('.newcomment');
      var comment = ta.value.trim();
      if (comment.length > 0) {
        ta.disabled = true;
        var data = {
          artId: artId,
          comment: comment,
        };
        Meteor.call('addComment', data, function() {
          ta.disabled = false;
          ta.value = "";
        });
      }
    },
  });

  function getCurrentUserAvatar() {
    var avatarUrl = (Meteor.userId() && Meteor.user().profile) ? Meteor.user().profile.avatarUrl : "";
    return getAvatarUrl(avatarUrl);
  }

  function getAvatarUrl(url) {
    return url || "/static/resources/images/missing-avatar.png";
  }

  function getNextPrevArtRevisionUrl(next) {
    var route = Router.current();
    var artId = route.params._id;//data().artId || route.data()._id;
    var result = findNextPrevArtRevision(artId, route.data().createdAt, next).fetch();
    if (!result || result.length === 0) {
      return;
    }
    var rev = result[0];
    return "/art/" + rev.artId + "/revision/" + rev._id;
  }

  Template.meta.helpers({
    date: function() {
      return getSimpleDate(this.createdAt);
    },
    hasRevisions: function() {
      return getNextPrevArtRevisionUrl(true) || getNextPrevArtRevisionUrl(false);
    },
    prevRevision: function() {
      return getNextPrevArtRevisionUrl(false);
    },
    nextRevision: function() {
      return getNextPrevArtRevisionUrl(true);
    },
    settings: function() {
      var route = Router.current();
      var dataContext = this;
      return {
        finishOnEnter: false,
        userIsCurrentUser: function() {
          var route = Router.current();
          return Meteor.userId() && route.data() && Meteor.userId() === route.data().owner;
        },
        canEdit: function() {
          var route = Router.current();
          return Meteor.userId() && route.data() && Meteor.userId() === route.data().owner;
        },
        getText: function() {
          var route = Router.current();
          return route.data().notes || "";
        },
        setText: function(newText) {
          if (newText.length > 0 && newText !== this.comment) {
            var route = Router.current();
            var revisionId = dataContext.revisionId || dataContext._id;
            if (!revisionId) {
              console.log("Can't set notes of unsaved art");
              return;
            }
            var data = {
              revisionId: revisionId,
              notes: newText,
            };
            Meteor.call('updateNote', data);
          }
        },
      };
    },
    haveArt: function() {
      var route = Router.current();
      return route.data && route.data()._id;
    },
    showNotes: function() {
      var route = Router.current();
      // Don't show if anon and no notes
      return route.data() && route.data().owner;
    },
    currentUserAvatar: function() {
      return getCurrentUserAvatar();
    },
    avatar: function() {
      var route = Router.current();
      return getAvatarUrl(route.data().avatarUrl);
    },
    comments: function() {
      var route = Router.current();
      return Comments.find({artId: route.params._id}, {sort: {createdAt: 1}});
    },
  });

  Template.comment.events({
    "click .delete": function(e, template) {
      var result = confirm("delete for reals?");
      if (result) {
        Meteor.call('deleteComment', template.data._id);
      }
    },
  });

  Template.comment.helpers({
    settings: function() {
      var owner   = this.owner;
      var _id     = this._id;
      var comment = this.comment;
      return {
        finishOnEnter: false,
        userIsCurrentUser: function() {
          return Meteor.userId() && owner;
        },
        canEdit: function() {
          return Meteor.userId() && owner;
        },
        getText: function() {
          return comment;
        },
        setText: function(newText) {
          if (newText && newText !== comment) {
            if (!_id) {
              console.log("cannot set comment on unsaved art");
              return;
            }
            var data = {
              _id: _id,
              comment: newText,
            };
            Meteor.call('updateComment', data);
          }
        },
      };
    },
    commentIsForCurrentUser: function() {
      return this.owner === Meteor.userId();
    },
    avatar: function() {
      return getAvatarUrl(this.avatarUrl);
    },
    comment: function() {
      return marked(this.comment || "");
    },
    date: function() {
      return getSimpleDate(this.modifiedAt);
    },
  });

  Template.allcomments.helpers({
    comments: function() {
      return Comments.find({}, {sort: {createdAt: -1}});
    },
  });

  Template.commentart.helpers({
  });

  Template.separatecomment.helpers({
    art: function() {
      return Art.findOne({_id: this.artId});
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
      var sort = route.data().sort;

      var makeUrl = function(pageId) {
        return path + '/' + pageId + (sort ? ('?sort=' + sort) : '');
      };

      Pages.remove({});
      if (numPages > 1) {
        var needPrevNext = numPages > numPageButtons;
        if (needPrevNext) {
          var prev = Math.max(page, 1);
          Pages.insert({purl: makeUrl(prev), pagenum: "<<", samepageclass: pageId === prev ? "selected" : ""});
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
            Pages.insert({purl: makeUrl(ii + 1), pagenum: ii + 1, samepageclass: ii === page ? "selected" : ""});
          }
        }

        if (needPrevNext) {
          var next = Math.min(lastPage, page + 1);
          Pages.insert({purl: makeUrl(next + 1), pagenum: ">>", samepageclass: page === next ? "selected" : ""});
        }
      }
      return Pages.find({});
    },
  });

  //Template.sorting.events({
  //  "click .sorting .popular": function() {
  //    SetSorting("popular");
  //  },
  //  "click .sorting .newest": function() {
  //    SetSorting("newest");
  //  },
  //  "click .sorting .mostviewed": function() {
  //    SetSorting("mostViewed");
  //  },
  //});

  Template.sorting.helpers({
    selected: function(sortType) {
      var route = Router.current();
      var sort = route.data().sort || "hot";
      return sort === sortType ? "selected" : "";
    },
    url: function(sortType) {
      var route = Router.current();
      return route.data().path + '/' + route.data().page + '?sort=' + sortType;
    },
  });

  function SetArt(data) {
    var settings;
    var options = {
      saveFn: save,
      screenshotURL: data && data.screenshotURL,
    };
    Session.set(S_ART_OWNER_ID, undefined);
    Session.set(S_ART_OWNER_NAME, "-anon-");
    Session.set(S_ART_NAME, "unnamed");
    if (data && data.settings) {
      try {
        settings = JSON.parse(data.settings);
        Session.set(S_ART_OWNER_ID, data.owner);
        Session.set(S_ART_NAME, data.name);
        Session.set(S_ART_OWNER_NAME, data.username);
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
    var isNew = window.location.pathname.substr(0, 5) === "/new/"
    if (!settings) {
      options.uiMode = "#ui-one";
      if (!isNew) {
        settings = window.vsart.missingSettings;
      }
    }
    window.vsart.setSettings(settings, options);
  }

  function goWithoutInterruptingMusic(url) {
    window.vsart.setOptions({
      interruptMusic: false,
    });
    Router.go(url);
  }

  Template.artpage.onRendered(function() {
    SetArt(this.data);
  });

  Template.artpage.onDestroyed(function() {
    window.vsart.stop(true);
  });

  function save() {
    if (!Session.get("saving") && window.vsart.isSaveable()) {
      Session.set("saving", true);
      window.vsSaveData = {
        settings: window.vsart.getSettings(),
        screenshot: window.vsart.takeScreenshot("image/jpeg", 0.7),
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
    //"keydown": function(e) {
    //  if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
    //    e.preventDefault();
    //    save();
    //  }
    //}
  });

  Template.save.helpers({
    saving: function() {
      return Session.get("saving");
    },
    visibility: function() {
      return Session.get(S_SAVE_VISIBILITY) || "public";

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
    "click #visibility li": function(e) {
      e.stopPropagation();
      Dropdowns.hideAll();
      Session.set(S_SAVE_VISIBILITY, e.currentTarget.dataset.option);
    },
    "click #saveit, click #savenew": function(e, template) {
      var route = Router.current();
      var origId;
      if (route && route.params) {
        origId = route.params._id;
      }
      window.vsart.markAsSaving();
      Session.set("saving", false);
      var notesElem = template.find(".notes");
      var notes = notesElem ? notesElem.value : "";
      var data = {
        privacy: Session.get(S_SAVE_VISIBILITY) || "public",
        notes: notes,
      };
      Meteor.call("addArt", $("#savedialog #name").val(), origId, window.vsSaveData, data, function(err, result) {
        window.vsart.markAsSaved();
        if (err) {
          console.error(err);
          return;
        }
        var url = "/art/" + result;
        goWithoutInterruptingMusic(url)
      });
    },
    "click #updateit": function(e, template) {
      var route = Router.current();
      var origId;
      if (route && route.params) {
        origId = route.params._id;
      }
      window.vsart.markAsSaving();
      var notesElem = template.find(".notes");
      var notes = notesElem ? notesElem.value : "";
      var data = {
        privacy: Session.get(S_SAVE_VISIBILITY) || "public",
        notes: notes,
      };
      Session.set("saving", false);
      Meteor.call("updateArt", $("#savedialog #name").val(), origId, window.vsSaveData, data, function(err, result) {
        window.vsart.markAsSaved();
        if (err) {
          console.error(err);
          return;
        }

        // Were we editing a revisions?
        if (route.params._revisionId) {
          var url = "/art/" + origId + "/revision/" + result;
          goWithoutInterruptingMusic(url);
        }
      });
    },
    "click #cancel": function() {
      Session.set("saving", false);
    },
  });

  Template.play.events({
    'click .playbutton': function() {
      window.vsart.toggleMusic();
      Session.set("MusicState", window.vsart.getMusicState());
    }
  });

  Template.play.helpers({
    isPlaying: function() {
      Session.get("MusicState");
      return window.vsart.getMusicState();
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
    // How can I ask less info? I don't need any info.
    // I only need these services to provided authentication.
    // nothing else.
    requestPermissions: {
      github: [],
      google: ['profile'],
    },
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
  showForgotPasswordLink: true,
  enablePasswordChange: true,
  privacyUrl: Meteor.absoluteUrl('static/resources/privacy.html'),
  termsUrl: Meteor.absoluteUrl('static/resources/tos.html'),
});

Router.configure({
  trackPageView: true,
});

//Router.route('/', {
//  template: 'front',
//});
Router.route('/', {
  name: 'galleryrouteroot',
  template: 'gallery',
  data: function() {
    var sort = this.params.query.sort;
    var sortType = getSortingType(sort);
    var page = 1;
    return {
      page: page,
      path: '/gallery',
      count: 'artCount',
      sort: sort,
      sortType: sortType,
    };
  },
});
Router.route('/gallery/:_page', {
  name: 'galleryroute',
  template: 'gallery',
  data: function() {
    var sort = this.params.query.sort;
    var sortType = getSortingType(sort);
    var page = parseInt(this.params._page);
    return {
      page: page,
      path: '/gallery',
      count: 'artCount',
      sort: sort,
      sortType: sortType,
    };
  },
});
Router.route('/new/', function() {
  this.render('artpage');
});
Router.route('/user/:_username', {
  template: 'userprofile',
  data: function() {
    var sort = this.params.query.sort || "newest";
    var sortType = getSortingType(sort);
    var page = 1;
    var username = this.params._username;
    return {
      page: page,
      username: username,
      path: '/user/' + username,
      count: 'artCount',
      showRevisions: true,
      sort: sort,
      sortType: sortType,
    };
  },
});
Router.route('/user/:_username/:_page', {
  template: 'userprofile',
  data: function() {
    var page = parseInt(this.params._page);
    var username = this.params._username;
    var sort = this.params.query.sort || "newest";
    var sortType = getSortingType(sort);
    return {
      page: page,
      username: username,
      path: '/user/' + username,
      count: 'artCount',
      showRevisions: true,
      sort: sort,
      sortType: sortType,
    };
  },
});
Router.route('/art/:_id', {
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
Router.route('/art/:_id/revision/:_revisionId', {
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
Router.route('/art/:_id/revisions/', {
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
      Meteor.subscribe('artRevisionCount', artId),
    ];
    return subs;
  },
  cache: 5,
  expire: 5,
});
Router.route('/art/:_id/revisions/:_page', {
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
    var artId = this.params._id;
    var subs = [
      Meteor.subscribe('artRevisionCount', artId),
    ];
    return subs;
  },
  cache: 5,
  expire: 5,
});
Router.route('/comments', function() {
  Router.go('/comments/1');
});
Router.route('/comments/:_page', {
  template: 'allcomments',
  data: function() {
    var page = this.params._page;
    return {
      page: page,
    };
  },
  subscriptions: function() {
    var page = this.params._page - 1;
    var skip = page * 50;
    var limit = 50;
    var subs = [
      Meteor.subscribe('commentsWithArt', skip, limit),
    ];
    return subs;
  },
  cache: 5,
  expire: 5,
});
Router.route('imageFiles', {
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

function addArt(name, origId, vsData, data) {
  // Make sure the user is logged in before inserting art
  //    if (! Meteor.userId()) {
  //      throw new Meteor.Error("not-authorized");
  //    }
  name = name || "unnamed";
  var owner = Meteor.userId();
  var user = Meteor.user();
  var username = (owner && user) ? user.username : "-anon-";
  var avatarUrl = (owner && user && user.profile) ? user.profile.avatarUrl : "";
  var settings = vsData.settings || {};
  var screenshotDataURL = vsData.screenshot.dataURL || "";
  var screenshotURL = "";
  var hasSound = settings.sound && settings.sound.length > 0;
  var notes = data.notes || "";
  if (!owner) {
    data.privacy = "public";
  }
  var privacy = validateAndGetPrivacy(data.privacy);

  if (origId) {
    check(origId, String);
  }
  check(JSON.stringify(settings), StringLengthLessThan100k);
  check(notes, StringIsCommentString);

  if (screenshotDataURL) {
    screenshotURL = saveDataURLToFile(screenshotDataURL);
  }

  var date = new Date();
  var artId = Art.insert({
    owner: owner,
    createdAt: date,
    modifiedAt: date,
    origId: origId,
    name: name,
    notes: notes,
    rank: date.getTime(),
    private: privacy.private,
    unlisted: privacy.unlisted,
    username: username,
    avatarUrl: avatarUrl,
    settings: JSON.stringify(settings),
    screenshotURL: screenshotURL,
    hasSound: hasSound,
    views: 0,
    likes: 0,
  });
  var revisionId = ArtRevision.insert({
    createdAt: date,
    owner: owner,
    origId: origId,
    artId: artId,
    name: name,
    notes: notes,
    private: privacy.private,
    unlisted: privacy.unlisted,
    username: username,
    avatarUrl: avatarUrl,
    settings: JSON.stringify(settings),
    hasSound: hasSound,
    screenshotURL: screenshotURL,
  });
  Art.update({_id: artId},
    {$set: {
      revisionId: revisionId,
    },
  });
  return artId;
};

function updateArt(name, origId, vsData, data) {
  var owner = Meteor.userId();
  var user = Meteor.user();
  if (!owner || !user) {
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
  var privacy = validateAndGetPrivacy(data.privacy);
  var username = Meteor.user().username;
  var settings = vsData.settings || {};
  var screenshotDataURL = vsData.screenshot.dataURL || "";
  var screenshotURL = "";
  var hasSound = settings.sound && settings.sound.length > 0;
  var notes = data.notes || "";
  check(notes, StringIsCommentString);

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
    notes: notes,
    private: privacy.private,
    unlisted: privacy.unlisted,
    username: username,
    settings: JSON.stringify(settings),
    hasSound: hasSound,
    screenshotURL: screenshotURL,
    avatarUrl: (user && user.profile) ? user.profile.avatarUrl : "",
  });
  if (privacy.listed || art.private || art.unlisted) {
    Art.update({_id: origId},
      {$set: {
        revisionId: revisionId,
        modifiedAt: new Date(),
        name: name,
        notes: notes,
        private: privacy.private,
        unlisted: privacy.unlisted,
        settings: JSON.stringify(settings),
        hasSound: hasSound,
        screenshotURL: screenshotURL,
      },
    });
  }
  return revisionId;
}

function validateAndGetPrivacy(privacy) {
  check(privacy, String);
  privacy = privacy.toLowerCase();
  check(privacy, Match.OneOf("private", "public", "unlisted"));

  var _private  = privacy === "private";
  var _unlisted = privacy === "unlisted";

  return {
    private: _private,
    unlisted: _unlisted,
    listed: !_private && !_unlisted,
  };
}


Meteor.methods({
  addArt: addArt,
  updateArt: updateArt,
  updateNote: function(data) {
    check(data.revisionId, String);
    check(data.notes, StringIsCommentString);
    var userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-loggedin", "can not update notes if not logged in");
    }
    // We can't do this on the client because the revision we are about to look up is
    // NOT in the mini mongo. Should we add it?
    if (Meteor.isClient) {
      return;
    }
    var revision = ArtRevision.findOne({_id: data.revisionId});
    if (!revision) {
      throw new Meteor.Error("not-exists", "can not update notes of non-existant revision");
    }
    var art = Art.findOne({_id: revision.artId});
    if (!art) {
      throw new Meteor.Error("not-exists", "can not update notes of non-existant art (shold never get this error}");
    }
    if (revision.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-owner", "must be onwer to update notes");
    }

    ArtRevision.update({_id: data.revisionId}, {
      $set: {
        notes: data.notes,
      },
    });
    if (art.revisionId == data.revisionId) {
      Art.update({_id: revision.artId},
        {$set: {
          notes: data.notes,
        },
      });
    }
  },
  likeArt: function(artId) {
     check(artId, String);
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
  setPrivate: function (revisionId, _privacy) {
    check(revisionId, String);
    var privacy = validateAndGetPrivacy(_privacy);
    var revision = ArtRevision.findOne(revisionId);
    if (!revision) {
      throw new Meteor.Error("no such revisions");
    }

    if (revision.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    ArtRevision.update(revisionId, {
      $set: {
        private: privacy.private,
        unlisted: privacy.unlisted,
      },
    });
    var newestPublicRevision = ArtRevision.findOne({
      artId: revision.artId,
      private: {$ne: true},
      unlisted: {$ne: true},
    }, {
      sort: {createdAt: -1},
    });


    var art = Art.findOne(revision.artId);
    if (art) {
      if (newestPublicRevision) {
        Art.update({_id: revision.artId},
          {$set: {
            revisionId: newestPublicRevision._id,
            modifiedAt: newestPublicRevision.createdAt,
            name: newestPublicRevision.name,
            settings: newestPublicRevision.settings,
            screenshotURL: newestPublicRevision.screenshotURL,
            private: false,
            unlisted: false,
          },
        });
      } else {
        Art.update({_id: revision.artId},
          {$set: {
            private: privacy.private,
            unlisted: privacy.unlisted,
          },
        });
      }
    }
  },
  changeUsername: function(username) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not loggedin", "please login to change your username");
    }
    if (!username) {
      throw new Meteor.Error("bad data", "username is empty or mostly empty");
    }
    check(username, String);
    username = username.trim();
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
    ArtRevision.update({owner: Meteor.userId()}, {$set: {username: username}}, {multi: true});
    Comments.update({owner: Meteor.userId()}, {$set: {username: username}}, {multi: true});
  },
  changeUserinfo: function(info) {
    check(info, StringLengthLessThan2k);
    if (!Meteor.userId()) {
      throw new Meteor.Error("not loggedin", "please login to change your username");
    }
    if (!Meteor.isServer) {
      return;
    }
    Meteor.users.update({_id: Meteor.userId()}, {
      $set: {
        "profile.info": info,
      },
    });
  },
  addComment: function(data) {
    var owner = Meteor.userId();
    var user = Meteor.user() || {};
    if (!owner) {
      throw new Meteor.Error("not-loggedin", "use must be logged in to comment");
    }
    check(data.artId, String);
    check(data.comment, StringIsCommentString);
    var arts = Art.find({_id: data.artId}).fetch();
    if (!arts || arts.length != 1) {
      throw new Meteor.Error("not-exists", "can not common non-existant art");
    }
    var date = new Date();
    Comments.insert({
      owner: owner,
      artId: data.artId,
      comment: data.comment,
      createdAt: date,
      modifiedAt: date,
      username: user.username,
      avatarUrl: user.profile.avatarUrl,
    });
  },
  updateComment: function(data) {
    var owner = Meteor.userId();
    if (!owner) {
      throw new Meteor.Error("not-loggedin", "use must be logged in to comment");
    }
    check(data._id, String);
    check(data.comment, StringIsCommentString);
    var comment = Comments.findOne({_id: data._id});
    if (!comment) {
      throw new Meteor.Error("not-exists", "comment does not exist");
    }
    if (comment.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authroized", "can not edit someone else's comments");
    }
    var date = new Date();
    Comments.update({_id: data._id}, {
      $set: {
        comment: data.comment,
        modifiedAt: date,
      },
    });
  },
  deleteComment: function(id) {
    check(id, String);
    var comment = Comments.findOne({_id: id});
    if (!comment) {
      throw new Meteor.Error("not-exists", "comment does not exist");
    }
    if (comment.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authroized", "can not delete someone else's comments");
    }
    Comments.remove({_id: id});
  },
  incArtViews: function(artId) {
    check(artId, String);
    Art.update({_id: artId}, {$inc: {views: 1}});
  },
});


Meteor.startup(function () {
});


