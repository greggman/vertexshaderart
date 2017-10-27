import { check, Match } from 'meteor/check';

const NumberLessThan100 = Match.Where(function(v) {
  check(v, Number);
  return v >= 0 && v < 100;
});

const NumberLessThan200 = Match.Where(function(v) {
  check(v, Number);
  return v >= 0 && v < 200;
});

const StringLengthLessThan100k = Match.Where(function(v) {
  check(v, String);
  return v.length < 100 * 1024;
});

const StringIsCommentString = Match.Where(function(v) {
  check(v, String);
  return v.length < 20 * 1024;
});

const StringLengthLessThan2k = Match.Where(function(v) {
  check(v, String);
  return v.length < 2 * 1024;
});

export {
  NumberLessThan100,
  NumberLessThan200,
  StringLengthLessThan100k,
  StringIsCommentString,
  StringLengthLessThan2k,
};


