import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { s } from './session.js';
import { g } from './globals.js';
import { collection as ArtRevision, findNextPrevArtRevision } from './api/artrevision/artrevision.js';
import { collection as Art } from './api/art/art.js';
import { collection as ArtLikes } from './api/artlikes/artlikes.js';
import { collection as Comments } from './api/comments/comments.js';
import { getSortingType } from './utils.js';

function init(options) {

  const handleImageFiles = options.handleImageFiles;

  Router.configure({
    trackPageView: true,
  });

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
  Router.route('/users', function() {
    Router.go('/users/1');
  });
  Router.route('/users/:_page', {
    template: 'users',
    data: function() {
      var page = this.params._page;
      return {
        page: page,
        count: 'userCount',
        path: '/users',
      };
    },
    subscriptions: function() {
      var page = this.params._page - 1;
      var skip = page * 50;
      var limit = 50;
      var subs = [
        Meteor.subscribe('users', skip, limit),
        Meteor.subscribe('userCount'),
     ];
      return subs;
    },
    cache: 5,
    expire: 5,
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
        Session.set(s.CURRENTLY_LOGGING_IN, false);
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
        Session.set(s.CURRENTLY_LOGGING_IN, false);
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
        count: 'commentCount',
      };
    },
    subscriptions: function() {
      var page = this.params._page - 1;
      var skip = page * 50;
      var limit = 50;
      var subs = [
        Meteor.subscribe('commentsWithArt', skip, limit),
        Meteor.subscribe('commentCount'),
      ];
      return subs;
    },
    cache: 5,
    expire: 5,
  });

  Router.route('imageFiles', {
    where: 'server',
    path: /^\/cfs\/files\/(.*)$/,
    action: Meteor.wrapAsync(handleImageFiles),
  });
}

export {
  init,
};


