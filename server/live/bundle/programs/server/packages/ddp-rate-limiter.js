(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var RateLimiter = Package['rate-limit'].RateLimiter;

/* Package-scope variables */
var DDPRateLimiter;

(function(){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// packages/ddp-rate-limiter/packages/ddp-rate-limiter.js                             //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
(function(){                                                                          // 1
                                                                                      // 2
//////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                              //    // 4
// packages/ddp-rate-limiter/ddp-rate-limiter.js                                //    // 5
//                                                                              //    // 6
//////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                //    // 8
// Rate Limiter built into DDP with a default error message. See README or      // 1  // 9
// online documentation for more details.                                       // 2  // 10
DDPRateLimiter = {};                                                            // 3  // 11
                                                                                // 4  // 12
var errorMessage = function (rateLimitResult) {                                 // 5  // 13
  return "Error, too many requests. Please slow down. You must wait " +         // 6  // 14
    Math.ceil(rateLimitResult.timeToReset / 1000) + " seconds before " +        // 7  // 15
    "trying again.";                                                            // 8  // 16
};                                                                              // 9  // 17
var rateLimiter = new RateLimiter();                                            // 10
                                                                                // 11
DDPRateLimiter.getErrorMessage = function (rateLimitResult) {                   // 12
  if (typeof errorMessage === 'function')                                       // 13
    return errorMessage(rateLimitResult);                                       // 14
  else                                                                          // 15
    return errorMessage;                                                        // 16
};                                                                              // 17
                                                                                // 18
/**                                                                             // 19
 * @summary Set error message text when method or subscription rate limit       // 20
 * exceeded.                                                                    // 21
 * @param {string|function} message Functions are passed in an object with a    // 22
 * `timeToReset` field that specifies the number of milliseconds until the next       // 31
 * method or subscription is allowed to run. The function must return a string  // 24
 * of the error message.                                                        // 25
 */                                                                             // 26
DDPRateLimiter.setErrorMessage = function (message) {                           // 27
  errorMessage = message;                                                       // 28
};                                                                              // 29
                                                                                // 30
/**                                                                             // 31
 * @summary                                                                     // 32
 * Add a rule that matches against a stream of events describing method or      // 33
 * subscription attempts. Each event is an object with the following            // 34
 * properties:                                                                  // 35
 *                                                                              // 36
 * - `type`: Either "method" or "subscription"                                  // 37
 * - `name`: The name of the method or subscription being called                // 38
 * - `userId`: The user ID attempting the method or subscription                // 39
 * - `connectionId`: A string representing the user's DDP connection            // 40
 * - `clientAddress`: The IP address of the user                                // 41
 *                                                                              // 42
 * Returns unique `ruleId` that can be passed to `removeRule`.                  // 43
 *                                                                              // 44
 * @param {Object} matcher                                                      // 45
 *   Matchers specify which events are counted towards a rate limit. A matcher  // 46
 *   is an object that has a subset of the same properties as the event objects       // 55
 *   described above. Each value in a matcher object is one of the following:   // 48
 *                                                                              // 49
 *   - a string: for the event to satisfy the matcher, this value must be equal       // 58
 *   to the value of the same property in the event object                      // 51
 *                                                                              // 52
 *   - a function: for the event to satisfy the matcher, the function must      // 53
 *   evaluate to true when passed the value of the same property                // 54
 *   in the event object                                                        // 55
 *                                                                              // 56
 * Here's how events are counted: Each event that satisfies the matcher's       // 57
 * filter is mapped to a bucket. Buckets are uniquely determined by the         // 58
 * event object's values for all properties present in both the matcher and     // 59
 * event objects.                                                               // 60
 *                                                                              // 61
 * @param {number} numRequests  number of requests allowed per time interval.   // 62
 * Default = 10.                                                                // 63
 * @param {number} timeInterval time interval in milliseconds after which       // 64
 * rule's counters are reset. Default = 1000.                                   // 65
 */                                                                             // 66
DDPRateLimiter.addRule = function (matcher, numRequests, timeInterval) {        // 67
  return rateLimiter.addRule(matcher, numRequests, timeInterval);               // 68
};                                                                              // 69
                                                                                // 70
DDPRateLimiter.printRules = function () {                                       // 71
  return rateLimiter.rules;                                                     // 72
};                                                                              // 73
                                                                                // 74
/**                                                                             // 75
 * @summary Removes the specified rule from the rate limiter. If rule had       // 76
 * hit a rate limit, that limit is removed as well.                             // 77
 * @param  {string} id 'ruleId' returned from `addRule`                         // 78
 * @return {boolean}    True if a rule was removed.                             // 79
 */                                                                             // 80
DDPRateLimiter.removeRule = function (id) {                                     // 81
  return rateLimiter.removeRule(id);                                            // 82
};                                                                              // 83
                                                                                // 84
// This is accessed inside livedata_server.js, but shouldn't be called by any   // 85
// user.                                                                        // 86
DDPRateLimiter._increment = function (input) {                                  // 87
  rateLimiter.increment(input);                                                 // 88
};                                                                              // 89
                                                                                // 90
DDPRateLimiter._check = function (input) {                                      // 91
  return rateLimiter.check(input);                                              // 92
};                                                                              // 93
                                                                                // 94
//////////////////////////////////////////////////////////////////////////////////    // 103
                                                                                      // 104
}).call(this);                                                                        // 105
                                                                                      // 106
////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ddp-rate-limiter'] = {
  DDPRateLimiter: DDPRateLimiter
};

})();

//# sourceMappingURL=ddp-rate-limiter.js.map
