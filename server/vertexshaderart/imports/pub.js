import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
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

Meteor.publish("users", function(skip, limit) {
  check(skip, Number);
  check(limit, NumberLessThan100);
  return Meteor.users.find({}, {
    skip: skip,
    limit: limit,
    fields: {
      username: true,
      createdAt: true,
      profile: true,
    },
    sort: {createdAt: 1},
  });
});

Meteor.publish("userCount", function() {
  Counts.publish(this, 'userCount', Meteor.users.find({}));
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

Meteor.publish("commentCount", function() {
  Counts.publish(this, 'commentCount', Comments.find());
});

