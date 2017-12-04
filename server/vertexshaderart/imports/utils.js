
import { Meteor } from 'meteor/meteor';

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

function getRevisionPath(artId, revisionId) {
  return `/art/${artId}/revision/${revisionId}`;
}

function getArtPath(artId, revisionId) {
  return `/art/${artId}`;
}

function absoluteUrl(path) {
  return Meteor.absoluteUrl(path[0] === '/' ? path.substring(1) : path);
}

export {
  absoluteUrl,
  getArtPath,
  getRevisionPath,
  getSortingType,
};
