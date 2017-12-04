import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { s } from '../session.js';
import { g } from '../globals.js';
import { collection as ArtRevision, findNextPrevArtRevision } from '../api/artrevision/artrevision.js';
import { collection as Art } from '../api/art/art.js';
import { collection as ArtLikes } from '../api/artlikes/artlikes.js';
import { collection as Comments } from '../api/comments/comments.js';
import { getArtPath, getRevisionPath, getSortingType } from '../utils.js';

import * as methods from '../methods.js';
import './vertexshaderart.html';

// import { marked } from '../lib/marked.js';
const marked = require('../../lib/marked.js');
const vsart = require('../../client/vsart.js');

marked.setOptions({
  sanitize: true,
  breaks: true,
});

methods.init({
  saveDataURLToFile: function() {
    return "/static/resources/images/saving-thumbnail.jpg";
  },
});

G_PAGE_SIZE = (Meteor.settings.public.app && Meteor.settings.public.app.pageSize) ? Meteor.settings.public.app.pageSize : 15;
G_PAGE_RANGE = 2;
G_NUM_PAGE_BUTTONS = G_PAGE_RANGE * 2 + 1;
G_RESERVED_NAMES = {
  "-anon-": true,
};

S_ZEROS = "0000000000";
function padZeros(v, len) {
  const str = v.toString();
  return S_ZEROS.substr(0, len - str.length) + str;
}

const pwd = AccountsTemplates.removeField('password');
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

const Pages = new Mongo.Collection(null);

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
  revisionPath: function() {
    return getRevisionPath(this.artId, this._id);
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
  artPath: function() {
    return getArtPath(this._id);
  },
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
    Session.set(s.HELP_DIALOG_URL, e.target.href);
  },
});


Template.vslogin.helpers({
  currentlyLoggingIn: function() {
    var currentlyLoggingIn = Session.get(s.CURRENTLY_LOGGING_IN) && !Meteor.user();
    return currentlyLoggingIn;
  },
  helpDialog: function() {
    return Session.get(s.HELP_DIALOG_URL);
  },
});

Template.vslogin.events({
  "click #vsloginback": function() {
    Session.set(s.CURRENTLY_LOGGING_IN, false);
    Session.set(s.PENDING_LIKE, false);
  },
  "click #vslogin": function(e) {
    e.stopPropagation();
  },
  "click #loginhelpdialog": function(e) {
    e.stopPropagation();
    Session.set(s.HELP_DIALOG_URL, "");
  },
});

Template.userinfo.helpers({
  origPath: function() {
    return getArtPath(this.origId);
  },
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
    Session.set(s.CURRENTLY_LOGGING_IN, true);
    Session.set(s.PENDING_LIKE, true);
  },
  "click #like.currentuser": function() {
    var route = Router.current();
    Meteor.call("likeArt", route.params._id);
  },
});
Template.signin.events({
  "click .nouser": function() {
    Session.set(s.CURRENTLY_LOGGING_IN, true);
  },
});

function getCaption() {
  return replaceParams(" [%(name)s] by %(username)s", {
    name: Session.get(s.ART_NAME),
    username: Session.get(s.ART_OWNER_NAME),
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
    Session.set(s.CURRENTLY_SHARING, !Session.get(s.CURRENTLY_SHARING));
  },
  "click .sn-facebook": function(e) {
    e.stopPropagation();
    Session.set(s.CURRENTLY_SHARING, false);
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
    Session.set(s.CURRENTLY_SHARING, false);
    var title = "Share on Twitter";
    var url = "https://twitter.com/home" + objectToSearchString({
      status: window.location.href + getCaption(),
    });
    popup(url, title, "");
  },
  "click .sn-tumblr": function(e) {
    e.stopPropagation();
    Session.set(s.CURRENTLY_SHARING, false);
    var title = "Share on Tumblr";
    var url = "https://www.tumblr.com/widgets/share/tool" + objectToSearchString({
      posttype: "link",
      title: Session.get(s.ART_NAME),
      content: window.location.href,
      caption: getCaption(),
      url: window.location.href,
      "show-via": true,
    });
    popup(url, title, "");
  },
  "click .sn-embed": function(e) {
    e.stopPropagation();
    Session.set(s.CURRENTLY_SHARING, false);
    var html = '<iframe width="700" height="400" src="' + window.location.href + '" frameborder="0" allowfullscreen></iframe>';
    Session.set(s.EMBED, html);
  },
});

Template.share.helpers({
  isSharing: function() {
    return Session.get(s.CURRENTLY_SHARING);
  },
});

Template.shareform.helpers({
  embed: function() {
    return Session.get(s.EMBED);
  },
});

Template.shareform.events({
  "click .shareform": function() {
    Session.set(s.EMBED, "");
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

var domainsToConvertToHTTPSRE = /(\.wp\.com)$/i;
function getAvatarUrl(url) {
  url = url || "/static/resources/images/missing-avatar.png";
  try {
    var u = new URL(url);
    if (u.protocol === "http:" && domainsToConvertToHTTPSRE.test(u.domain)) {
      url = "https" + url.substr(5);
    }
  } catch (e) {
  }
  return url;
}

function getNextPrevArtRevisionUrl(next) {
  var route = Router.current();
  var artId = route.params._id;//data().artId || route.data()._id;
  var result = findNextPrevArtRevision(artId, route.data().createdAt, next).fetch();
  if (!result || result.length === 0) {
    return;
  }
  var rev = result[0];
  return getRevisionPath(rev.artId, rev._id);
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

Template.user.onCreated(function() {
  var instance = this;

  instance.autorun(function() {
    var route = Router.current();
    var pageId = route.data().page;
    var page = pageId - 1;
    var skip = page * G_PAGE_SIZE;

    instance.subscribe('userCount');
  });
});

Template.users.helpers({
  users: function() {
    return Meteor.users.find({}, {
      sort: {createdAt: 1},
    });
  },
});

Template.user.helpers({
  avatar: function() {
    return getAvatarUrl(this.profile.avatarUrl);
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
  Session.set(s.ART_OWNER_ID, undefined);
  Session.set(s.ART_OWNER_NAME, "-anon-");
  Session.set(s.ART_NAME, "unnamed");
  if (data && data.settings) {
    try {
      settings = JSON.parse(data.settings);
      Session.set(s.ART_OWNER_ID, data.owner);
      Session.set(s.ART_NAME, data.name);
      Session.set(s.ART_OWNER_NAME, data.username);
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
      settings = vsart.missingSettings;
    }
  }
  vsart.setSettings(settings, options);
}

function goWithoutInterruptingMusic(url) {
  vsart.setOptions({
    interruptMusic: false,
  });
  Router.go(url);
}

Template.artpage.onRendered(function() {
  SetArt(this.data);
});

Template.artpage.onDestroyed(function() {
  vsart.stop(true);
});

function save() {
  if (!Session.get("saving") && vsart.isSaveable()) {
    Session.set("saving", true);
    window.vsSaveData = {
      settings: vsart.getSettings(),
      screenshot: vsart.takeScreenshot("image/jpeg", 0.7),
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
    return Session.get(s.SAVE_VISIBILITY) || "unlisted";

  },
  artname: function() {
    return Session.get(s.ART_NAME);
  },
  isCurrentUsersExistingArt: function() {
    var route = Router.current();
    var artId = route.params ? route.params._id : undefined;
    return artId && Meteor.userId() && Meteor.userId() === Session.get(s.ART_OWNER_ID);
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
    Session.set(s.SAVE_VISIBILITY, e.currentTarget.dataset.option);
  },
  "click #saveit, click #savenew": function(e, template) {
    var route = Router.current();
    var origId;
    if (route && route.params) {
      origId = route.params._id;
    }
    vsart.markAsSaving();
    Session.set("saving", false);
    var notesElem = template.find(".notes");
    var notes = notesElem ? notesElem.value : "";
    var data = {
      privacy: Session.get(s.SAVE_VISIBILITY) || "unlisted",
      notes: notes,
    };
    Meteor.call("addArt", $("#savedialog #name").val(), origId, window.vsSaveData, data, function(err, result) {
      vsart.markAsSaved();
      if (err) {
        console.error(err);
        return;
      }
      var url = getArtPath(result);
      goWithoutInterruptingMusic(url)
    });
  },
  "click #updateit": function(e, template) {
    var route = Router.current();
    var origId;
    if (route && route.params) {
      origId = route.params._id;
    }
    vsart.markAsSaving();
    var notesElem = template.find(".notes");
    var notes = notesElem ? notesElem.value : "";
    var data = {
      privacy: Session.get(s.SAVE_VISIBILITY) || "unlisted",
      notes: notes,
    };
    Session.set("saving", false);
    Meteor.call("updateArt", $("#savedialog #name").val(), origId, window.vsSaveData, data, function(err, result) {
      vsart.markAsSaved();
      if (err) {
        console.error(err);
        return;
      }

      // Were we editing a revisions?
      if (route.params._revisionId) {
        const url = getRevisionPath(origId, result);
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
    vsart.toggleMusic();
    Session.set("MusicState", vsart.getMusicState());
  }
});

Template.play.helpers({
  isPlaying: function() {
    Session.get("MusicState");
    return vsart.getMusicState();
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

Meteor.startup(function () {
});


