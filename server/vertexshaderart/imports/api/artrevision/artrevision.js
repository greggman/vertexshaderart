const artRevision = new Mongo.Collection("artrevision"); // note: username is the username at time of revision

function findNextPrevArtRevision(artId, date, next) {
  check(artId, String);
  return artRevision.find({
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

export {
  artRevision as collection,
  findNextPrevArtRevision,
};

