import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { g } from './globals.js';
import { collection as ArtRevision, findNextPrevArtRevision } from './api/artrevision/artrevision.js';
import { collection as Art } from './api/art/art.js';
import { collection as ArtLikes } from './api/artlikes/artlikes.js';
import { collection as Comments } from './api/comments/comments.js';
import {
  NumberLessThan100,
  NumberLessThan200,
  StringLengthLessThan100k,
  StringIsCommentString,
  StringLengthLessThan2k,
} from './checks.js';

G_BAD_USERNAME_RE = /[:\/\\?%#\t\n\r]/
function isBadUsername(username) {
  return G_RESERVED_NAMES[username.toLowerCase()] ||
         G_BAD_USERNAME_RE.test(username);
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

function init(options) {

  const saveDataURLToFile = options.saveDataURLToFile;

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
}

export {
 init,
};

