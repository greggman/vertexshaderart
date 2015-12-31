IMAGE_PATH = process.env.IMAGE_PATH;

if (!IMAGE_PATH) {
  throw "IMAGE_PATH not set";
}

function extractDataForRank() {
  var fs = Npm.require('fs');
  fs.writeFileSync('/Users/gregg/src/vertexshaderart/src/rank/db.json', "var db = " + JSON.stringify(Art.find({
    private: {$ne: true},
    unlisted: {$ne: true},
  }, {
    fields: {settings: false},
  }).fetch()) + ";");
};
//extractDataForRank();

function addAvatarUrls() {
  Meteor.users.find({}).forEach(function(user) {
    if (!user.profile) {
      Meteor.users.update({_id: user._id}, {
        $set: {
          profile: {},
        },
      });
    }
  });

  Meteor.users.find({}).forEach(function(user) {
    //if (!user.profile.avatarUrl)
    {
      var url = getAvatarUrl(user);
      Meteor.users.update({_id: user._id}, {
        $set: {
          "profile.avatarUrl": url,
        },
      });
    }
  });

  function addAvatarUrlsToCollection(collection) {
    collection.find({
      $and: [
        { owner: {$exists: true}, },
        { owner: {$ne: null}, },
      ],
//      avatarUrl: {$exists: false},
    }).forEach(function(art) {
      var user = Meteor.users.findOne(art.owner);
      if (!user) {
        console.log("missing user for art:", art._id, "user:", art.owner);
        return;
      }
      console.log("adding avatarUrl to: ", art._id, "as", user.profile.avatarUrl);
      collection.update({_id: art._id}, {
        $set: {
          avatarUrl: user.profile.avatarUrl,
        },
      });
    });
  }
  addAvatarUrlsToCollection(Art);
  addAvatarUrlsToCollection(ArtRevision);
}
addAvatarUrls();

function generateUsername(username) {
  username = username.toLowerCase().trim().replace(" ", "");
  var count = Meteor.users.find({"username": username}).count();
  if (count === 0) {
    return username;
  } else {
    return username + (count + 1).toString();
  }
}

function getEmailOrHash(user) {
  var emailOrHash;
  if (user && user.emails) {
    var emails = _.pluck(user.emails, 'address');
    emailOrHash = emails[0] || '00000000000000000000000000000000';
  }  else {
    emailOrHash = '00000000000000000000000000000000';
  }
  return emailOrHash;
};

function getGravatarUrl(user, defaultUrl) {
  var options = {
    default: defaultUrl,
    size: 200,
    secure: true,
  };

  var emailOrHash = getEmailOrHash(user);
  return Gravatar.imageUrl(emailOrHash, options);
}

function getAvatarUrl(user) {
  var service = _.pairs(user.services)[0];
  var serviceName = service[0];
  var url;
  if (serviceName === 'twitter') {
    url = user.services.twitter.profile_image_url_https.replace('_normal.', '_200x200.');
  } else if (serviceName === 'facebook') {
    url = 'https://graph.facebook.com/' + user.services.facebook.id + '/picture?type=large';
  } else if (serviceName === 'google') {
    url = user.services.google.picture;
  } else if (serviceName === 'github') {
    url = 'https://avatars.githubusercontent.com/' + user.services.github.username + '?s=200';
  } else if (serviceName === 'instagram') {
    url = user.services.instagram.profile_picture;
  } else if (serviceName === 'linkedin') {
    url = user.services.linkedin.pictureUrl;
  } else if (serviceName === 'soundcloud') {
    url = user.services.soundcloud.avatar_url;
  } else if (serviceName === 'password') {
    var defaultUrl = Meteor.absoluteUrl() + "static/resources/images/missing-avatar.png";
    url = getGravatarUrl(user, defaultUrl);
  }
  return url;
}

Accounts.onCreateUser(function (options, user) {
    if (options && options.profile) {
        user.profile = options.profile;
    }
    if (!user.profile) {
      user.profile = {};
    }

    var serviceData = {};
    if (user.services) {
        var service = _.pairs(user.services)[0];

        var serviceName = service[0];
        serviceData = service[1] || {};

        if (serviceData.email) {
            if (serviceName == "facebook") {
                user.emails = [
                    {"address": serviceData.email, "verified": true},
                ];
                user.profile = {"first_name": serviceData.first_name, "last_name": serviceData.last_name, };
            } else if (serviceName == "google") {
                user.emails = [
                    {"address": serviceData.email, "verified": true},
                ];
                user.profile = {"first_name": serviceData.given_name, "last_name": serviceData.family_name, };
            }
        }

        user.profile.avatarUrl = getAvatarUrl(user);
    }

    user.username = generateUsername(user.username || serviceData.username || serviceData.first_name || serviceData.given_name || "unnamed");

    return user;
});

setupAccounts(Meteor.settings.accounts);

function setupAccounts(accounts) {
  //var log = console.log.bind(console);
  var log = function() {};
  log("----[ Setting up Accounts ] -------");
  if (!accounts) {
    log("no accounts!");
    return;
  }

  Object.keys(accounts).forEach(function(name) {
    log("----> setup:", name);
    var account = accounts[name];
    var fields = {
      loginStyle: "popup",
    };
    Object.keys(account).forEach(function(key) {
        log("    ", key, "=", account[key]);
        fields[key] = account[key];
    });
    ServiceConfiguration.configurations.upsert(
      { service: name },
      { $set: fields });
  });
}

WebApp.connectHandlers.use(function(req, res, next) {
  if (req.headers && req.headers.host && req.headers.host.match(/^vertexshaderart.com/) !== null ) {
       /* Redirect to the proper address */
        var correctURL = 'http://www.' + req.headers.host + req.url;
        res.writeHead(301, {
            'Content-Type': 'text/html; charset=UTF-8',
            Location: correctURL,
        });
        res.end("Moved to: " + correctURL);
  } else {
    next();
  }
});

var templateRE = /<template\s+name="(.*?)">([\s\S]*?)<\/template>/g;
var ssrTemplates = Assets.getText('ssr-templates.html');
do {
  var m = templateRE.exec(ssrTemplates);
  if (m) {
    SSR.compileTemplate(m[1], m[2]);
  }
} while (m);

var isBot = (function() {
  var bots = [
    'google',
    'googlebot',
    'baiduspider',
    'guruji',
    'yandex',
    'slurp',
    'msn',
    'bing',
    'facebookexternalhit',
    'facebot',
    'linkedin',
    'twitter',
    'slack',
    'telegram',
    'applebot',
    'pingdom',
  ];
  var botRE = new RegExp('(' + bots.join('|') + ')', RegExp.ignoreCase);
  return function isBot(req) {
    if (req.url && req.url.indexOf && req.url.indexOf("_escaped_fragment_=") >= 0) {
      return true;
    }
    var ua = req.headers["user-agent"] || '';
    var bot = botRE.test(ua);
    return bot;
  };
}());

function sendArtSSR(req, res, artId) {
  var arts = Art.find({_id: artId}).fetch();
  if (!arts || arts.length < 1) {
    res.statusCode = 404;
    res.end("no such art:" + req.url);
    return;
  }
  var html = SSR.render('artpieceSSR', arts[0]);
  res.write(html);
  res.end();
}

function sendArtRevisionSSR(req, res, revisionId) {
  var arts = ArtRevision.find({_id: revisionId}).fetch();
  if (!arts || arts.length < 1) {
    res.statusCode = 404;
    res.end("no such art revision:" + req.url);
    return;
  }
  var html = SSR.render('artpieceSSR', arts[0]);
  res.write(html);
  res.end();
}

var artPathRE = /\/art\/([^/]+)$/;
var artRevisionPathRE = /\/art\/([^/]+)\/revision\/([^/]+)$/;
WebApp.connectHandlers.use(function(req, res, next) {
  if (isBot(req)) {
    var m = artPathRE.exec(req.url);
    if (m) {
      return sendArtSSR(req, res, m[1]);
    }
    m = artRevisionPathRE.exec(req.url);
    if (m) {
      return sendArtRevisionSSR(req, res, m[2]);
    }
  }
  next();
});

// Adds a `rank` field to all existing art.
// The goal is to let new art appear on the "hotlist" for
// a day or 2 to give them a change to get some likes.
// then let liked pieces bubble back up to the top.
//
// Most rankings (reddit, hacker news) rank based on popularity / ageFn
// where the older they get the more likes they need to stay near the
// top. This is great for news but not so great for showing interesting
// things on site without a lot of traffic.
//
// So I worry that if I rank like those sites then the good but
// old stuff will flow off and the front will be only new but
// un-interesting. I have no idea how to rate for "interesting"
// except likes.
function computeHotlist() {
  var ageBonusInHours = 24 * 2;
  var now = Date.now();

  var rank = function rank(art) {
    var dob = Date.parse(art.modifiedAt);
    var age = Math.max(now - dob, 0);
    var hoursOld = age / 1000 / 60 / 60;
    // anon ages faster
    var ageMult = art.owner !== undefined ? 1 : 2;
    var agePenalty = Math.max(1, Math.log(hoursOld)) * ageMult;
    var bonusPoints = art.owner !== undefined ? 3 : 1;
    var viewPoints = art.views * 0;
    var likePoints = art.likes * 1;
    var ageBonusPoints = Math.max(0, ageBonusInHours - hoursOld);
    var points = bonusPoints + likePoints + viewPoints + ageBonusPoints;
    var score = points / agePenalty;
    return {
      ageMs: age,
      ageHrs: hoursOld,
      score: score,
      date: art.modifiedAt,
    };
  };

  var count = 0;
  var arts = Art.find({}, { fields: {settings: false}}).forEach(function(art) {
    ++count;
    var r = rank(art);
    Art.update({
      _id: art._id,
    }, {
      $set: {
        rank: r.score,
      },
    });
  });

  var then = now;
  var now = Date.now();
  var elapsedTime = now - then;
  console.log("computed hotlist from " + count + " entries in " + (elapsedTime * 0.001).toFixed(1) + " seconds");
}
computeHotlist();

CronJobs = {
  'compute hotlist': computeHotlist,
};

function setupCronJobs() {
  var cronJobs = Meteor.settings.cronJobs;
  var errors = 0;
  var error = function() {
    ++errors;
    console.error.apply(console, arguments);
  };
  if (!cronJobs) {
    error("no cronjobs set");
  } else {
    Object.keys(cronJobs).forEach(function(jobName) {
      var job = CronJobs[jobName];
      if (!job) {
        error("no cron job: " + jobName);
        return;
      }
      var options = cronJobs[jobName];
      SyncedCron.add({
        name: jobName,
        schedule: function(parser) {
          var s = parser.text(options.schedule);
          if (s.error >= 0) {
            error("could not parse schedule:", options.schedule);
            throw "Cron not setup";
          }
          return s;
        },
        job: job,
      });
      console.log("Added cron job:", jobName, options.schedule);
    });
  }
  console.log("Staring Cron Processing");
  SyncedCron.start();
};
setupCronJobs();



