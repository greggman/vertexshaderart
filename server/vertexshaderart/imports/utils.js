
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

export {
  getSortingType,
};
