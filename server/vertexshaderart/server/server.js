IMAGE_PATH = process.env.IMAGE_PATH;

if (!IMAGE_PATH) {
  throw "IMAGE_PATH not set";
}

function generateUsername(username) {
  username = username.toLowerCase().trim().replace(" ", "");
  var count = Meteor.users.find({"username": username}).count();
  if (count === 0) {
    return username;
  } else {
    return username + (count + 1).toString();
  }
}

//function addModifiedAt() {
//  var arts = Art.find({}).fetch();
//  arts.forEach(function(art) {
//    var newestPublicRevision = ArtRevision.findOne({
//      artId: art._id,
//      private: {$ne: true},
//    }, {
//      sort: {createdAt: -1},
//    });
//    if (newestPublicRevision && art.modifiedAt.getTime() !== newestPublicRevision.createdAt.getTime()) {
//console.log("updating art: " + art._id);
//      Art.update({_id: art._id}, {
//        $set: {
//          modifiedAt: newestPublicRevision.createdAt,
//        },
//      });
//    }
//  });
//}
//addModifiedAt();

Accounts.onCreateUser(function (options, user) {
    if (options && options.profile) {
        user.profile = options.profile;
    }

    var serviceData = {};
    if (user.services) {
        var service = _.pairs(user.services)[0];

        var serviceName = service[0];
        serviceData = service[1] || {};

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
    'gurujibot',
    'yandexbot',
    'slurp',
    'msnbot',
    'bingbot',
    'facebookexternalhit',
    'facebot',
    'linkedinbot',
    'twitterbot',
    'slackbot',
    'telegrambot',
    'applebot',
    'pingdom',
  ];
  var botRE = new RegExp('(' + bots.join('|') + ')', RegExp.ignoreCase);
  return function isBot(req) {
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
      return sendArtRevision(req, res, m[2]);
    }
  }
  next();
});

