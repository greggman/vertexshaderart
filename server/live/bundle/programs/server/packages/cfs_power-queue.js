(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var ReactiveProperty = Package['cfs:reactive-property'].ReactiveProperty;

/* Package-scope variables */
var MicroQueue, ReactiveList, PowerQueue;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/cfs_power-queue/packages/cfs_power-queue.js              //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {                                                       // 1
                                                                     // 2
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/cfs:power-queue/power-queue.js                                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// Rig weak dependencies                                                                                             // 1
if (typeof MicroQueue === 'undefined' && Package['micro-queue']) {                                                   // 2
  MicroQueue = Package['micro-queue'].MicroQueue;                                                                    // 3
}                                                                                                                    // 4
if (typeof ReactiveList === 'undefined' && Package['reactive-list']) {                                               // 5
  ReactiveList = Package['reactive-list'].ReactiveList;                                                              // 6
}                                                                                                                    // 7
                                                                                                                     // 8
// Rig weak dependencies in +0.9.1                                                                                   // 9
if (typeof MicroQueue === 'undefined' && Package['cfs:micro-queue']) {                                               // 10
  MicroQueue = Package['cfs:micro-queue'].MicroQueue;                                                                // 11
}                                                                                                                    // 12
if (typeof ReactiveList === 'undefined' && Package['cfs:reactive-list']) {                                           // 13
  ReactiveList = Package['cfs:reactive-list'].ReactiveList;                                                          // 14
}                                                                                                                    // 15
                                                                                                                     // 16
/**                                                                                                                  // 17
 * Creates an instance of a power queue // Testing inline comment                                                    // 18
 * [Check out demo](http://power-queue-test.meteor.com/)                                                             // 19
 *                                                                                                                   // 20
 * @constructor                                                                                                      // 21
 * @self powerqueue                                                                                                  // 22
 * @param {object} [options] Settings                                                                                // 23
 * @param {boolean} [options.filo=false] Make it a first in last out queue                                           // 24
 * @param {boolean} [options.isPaused=false] Set queue paused                                                        // 25
 * @param {boolean} [options.autostart=true] May adding a task start the queue                                       // 26
 * @param {string} [options.name="Queue"] Name of the queue                                                          // 27
 * @param {number} [options.maxProcessing=1] Limit of simultanous running tasks                                      // 28
 * @param {number} [options.maxFailures = 5] Limit retries of failed tasks, if 0 or below we allow infinite failures // 29
 * @param {number} [options.jumpOnFailure = true] Jump to next task and retry failed task later                      // 30
 * @param {boolean} [options.debug=false] Log verbose messages to the console                                        // 31
 * @param {boolean} [options.reactive=true] Set whether or not this queue should be reactive                         // 32
 * @param {boolean} [options.onAutostart] Callback for the queue autostart event                                     // 33
 * @param {boolean} [options.onPaused] Callback for the queue paused event                                           // 34
 * @param {boolean} [options.onReleased] Callback for the queue release event                                        // 35
 * @param {boolean} [options.onEnded] Callback for the queue end event                                               // 36
 * @param {[SpinalQueue](spinal-queue.spec.md)} [options.spinalQueue] Set spinal queue uses pr. default `MicroQueue` or `ReactiveList` if added to the project
 */                                                                                                                  // 38
PowerQueue = function(options) {                                                                                     // 39
  var self = this;                                                                                                   // 40
  var test = 5;                                                                                                      // 41
                                                                                                                     // 42
  self.reactive = (options && options.reactive === false) ? false :  true;                                           // 43
                                                                                                                     // 44
  // Allow user to use another micro-queue #3                                                                        // 45
  // We try setting the ActiveQueue to MicroQueue if installed in the app                                            // 46
  var ActiveQueue = (typeof MicroQueue !== 'undefined') && MicroQueue || undefined;                                  // 47
                                                                                                                     // 48
  // If ReactiveList is added to the project we use this over MicroQueue                                             // 49
  ActiveQueue = (typeof ReactiveList !== 'undefined') && ReactiveList || ActiveQueue;                                // 50
                                                                                                                     // 51
  // We allow user to overrule and set a custom spinal-queue spec complient queue                                    // 52
  if (options && typeof options.spinalQueue !== 'undefined') {                                                       // 53
    ActiveQueue = options.spinalQueue;                                                                               // 54
  }                                                                                                                  // 55
                                                                                                                     // 56
  if (typeof ActiveQueue === 'undefined') {                                                                          // 57
    console.log('Error: You need to add a spinal queue to the project');                                             // 58
    console.log('Please add "micro-queue", "reactive-list" to the project');                                         // 59
    throw new Error('Please add "micro-queue", "reactive-list" or other spinalQueue compatible packages');           // 60
  }                                                                                                                  // 61
                                                                                                                     // 62
  // Default is fifo lilo                                                                                            // 63
  self.invocations = new ActiveQueue({                                                                               // 64
    //                                                                                                               // 65
    sort: (options && (options.filo || options.lifo)),                                                               // 66
    reactive: self.reactive                                                                                          // 67
  });                                                                                                                // 68
  //var self.invocations = new ReactiveList(queueOrder);                                                             // 69
                                                                                                                     // 70
  // List of current tasks being processed                                                                           // 71
  self._processList = new ActiveQueue({                                                                              // 72
    reactive: self.reactive                                                                                          // 73
  }); //ReactiveList();                                                                                              // 74
                                                                                                                     // 75
  // Max number of simultanious tasks being processed                                                                // 76
  self._maxProcessing = new ReactiveProperty(options && options.maxProcessing || 1, self.reactive);                  // 77
                                                                                                                     // 78
  // Reactive number of tasks being processed                                                                        // 79
  self._isProcessing = new ReactiveProperty(0, self.reactive);                                                       // 80
                                                                                                                     // 81
  // Boolean indicating if queue is paused or not                                                                    // 82
  self._paused = new ReactiveProperty((options && options.isPaused || false), self.reactive);                        // 83
                                                                                                                     // 84
  // Boolean indicator for queue status active / running (can still be paused)                                       // 85
  self._running = new ReactiveProperty(false, self.reactive);                                                        // 86
                                                                                                                     // 87
  // Counter for errors, errors are triggered if maxFailures is exeeded                                              // 88
  self._errors = new ReactiveProperty(0, self.reactive);                                                             // 89
                                                                                                                     // 90
  // Counter for task failures, contains error count                                                                 // 91
  self._failures = new ReactiveProperty(0, self.reactive);                                                           // 92
                                                                                                                     // 93
  // On failure jump to new task - if false the current task is rerun until error                                    // 94
  self._jumpOnFailure = (options && options.jumpOnFailure === false) ? false : true;                                 // 95
                                                                                                                     // 96
  // Count of all added tasks                                                                                        // 97
  self._maxLength = new ReactiveProperty(0, self.reactive);                                                          // 98
                                                                                                                     // 99
  // Boolean indicate whether or not a "add" task is allowed to start the queue                                      // 100
  self._autostart = new ReactiveProperty( ((options && options.autostart === false) ? false : true), self.reactive); // 101
                                                                                                                     // 102
  // Limit times a task is allowed to fail and be rerun later before triggering an error                             // 103
  self._maxFailures = new ReactiveProperty( (options && options.maxFailures || 5), self.reactive);                   // 104
                                                                                                                     // 105
  // Name / title of this queue - Not used - should deprecate                                                        // 106
  self.title = options && options.name || 'Queue';                                                                   // 107
                                                                                                                     // 108
  // debug - will print error / failures passed to next                                                              // 109
  self.debug = !!(options && options.debug);                                                                         // 110
                                                                                                                     // 111
  /** @method PowerQueue.total                                                                                       // 112
   * @reactive                                                                                                       // 113
   * @returns {number} The total number of tasks added to this queue                                                 // 114
   */                                                                                                                // 115
  self.total = self._maxLength.get;                                                                                  // 116
                                                                                                                     // 117
  /** @method PowerQueue.isPaused                                                                                    // 118
   * @reactive                                                                                                       // 119
   * @returns {boolean} Status of the paused state of the queue                                                      // 120
   */                                                                                                                // 121
  self.isPaused = self._paused.get;                                                                                  // 122
                                                                                                                     // 123
  /** @method PowerQueue.processing                                                                                  // 124
   * @reactive                                                                                                       // 125
   * @returns {number} Number of tasks currently being processed                                                     // 126
   */                                                                                                                // 127
  self.processing = self._isProcessing.get;                                                                          // 128
                                                                                                                     // 129
  /** @method PowerQueue.errors                                                                                      // 130
   * @reactive                                                                                                       // 131
   * @returns {number} The total number of errors                                                                    // 132
   * Errors are triggered when [maxFailures](PowerQueue.maxFailures) are exeeded                                     // 133
   */                                                                                                                // 134
  self.errors = self._errors.get;                                                                                    // 135
                                                                                                                     // 136
  /** @method PowerQueue.failures                                                                                    // 137
   * @reactive                                                                                                       // 138
   * @returns {number} The total number of failed tasks                                                              // 139
   */                                                                                                                // 140
  self.failures = self._failures.get;                                                                                // 141
                                                                                                                     // 142
  /** @method PowerQueue.isRunning                                                                                   // 143
   * @reactive                                                                                                       // 144
   * @returns {boolean} True if the queue is running                                                                 // 145
   * > NOTE: The task can be paused but marked as running                                                            // 146
   */                                                                                                                // 147
  self.isRunning = self._running.get;                                                                                // 148
                                                                                                                     // 149
  /** @method PowerQueue.maxProcessing Get setter for maxProcessing                                                  // 150
   * @param {number} [max] If not used this function works as a getter                                               // 151
   * @reactive                                                                                                       // 152
   * @returns {number} Maximum number of simultaneous processing tasks                                               // 153
   *                                                                                                                 // 154
   * Example:                                                                                                        // 155
   * ```js                                                                                                           // 156
   *   foo.maxProcessing();    // Works as a getter and returns the current value                                    // 157
   *   foo.maxProcessing(20);  // This sets the value to 20                                                          // 158
   * ```                                                                                                             // 159
   */                                                                                                                // 160
  self.maxProcessing = self._maxProcessing.getset;                                                                   // 161
                                                                                                                     // 162
  self._maxProcessing.onChange = function() {                                                                        // 163
    // The user can change the max allowed processing tasks up or down here...                                       // 164
    // Update the throttle up                                                                                        // 165
    self.updateThrottleUp();                                                                                         // 166
    // Update the throttle down                                                                                      // 167
    self.updateThrottleDown();                                                                                       // 168
  };                                                                                                                 // 169
                                                                                                                     // 170
  /** @method PowerQueue.autostart Get setter for autostart                                                          // 171
   * @param {boolean} [autorun] If not used this function works as a getter                                          // 172
   * @reactive                                                                                                       // 173
   * @returns {boolean} If adding a task may trigger the queue to start                                              // 174
   *                                                                                                                 // 175
   * Example:                                                                                                        // 176
   * ```js                                                                                                           // 177
   *   foo.autostart();    // Works as a getter and returns the current value                                        // 178
   *   foo.autostart(true);  // This sets the value to true                                                          // 179
   * ```                                                                                                             // 180
   */                                                                                                                // 181
  self.autostart = self._autostart.getset;                                                                           // 182
                                                                                                                     // 183
  /** @method PowerQueue.maxFailures Get setter for maxFailures                                                      // 184
   * @param {number} [max] If not used this function works as a getter                                               // 185
   * @reactive                                                                                                       // 186
   * @returns {number} The maximum for failures pr. task before triggering an error                                  // 187
   *                                                                                                                 // 188
   * Example:                                                                                                        // 189
   * ```js                                                                                                           // 190
   *   foo.maxFailures();    // Works as a getter and returns the current value                                      // 191
   *   foo.maxFailures(10);  // This sets the value to 10                                                            // 192
   * ```                                                                                                             // 193
   */                                                                                                                // 194
  self.maxFailures = self._maxFailures.getset;                                                                       // 195
                                                                                                                     // 196
  /** @callback PowerQueue.onPaused                                                                                  // 197
   * Is called when queue is ended                                                                                   // 198
   */                                                                                                                // 199
  self.onPaused = options && options.onPaused || function() {                                                        // 200
    self.debug && console.log(self.title + ' ENDED');                                                                // 201
  };                                                                                                                 // 202
                                                                                                                     // 203
  /** @callback PowerQueue.onEnded                                                                                   // 204
   * Is called when queue is ended                                                                                   // 205
   */                                                                                                                // 206
  self.onEnded = options && options.onEnded || function() {                                                          // 207
    self.debug && console.log(self.title + ' ENDED');                                                                // 208
  };                                                                                                                 // 209
                                                                                                                     // 210
  /** @callback PowerQueue.onRelease                                                                                 // 211
   * Is called when queue is released                                                                                // 212
   */                                                                                                                // 213
  self.onRelease = options && options.onRelease || function() {                                                      // 214
    self.debug && console.log(self.title + ' RELEASED');                                                             // 215
  };                                                                                                                 // 216
                                                                                                                     // 217
  /** @callback PowerQueue.onAutostart                                                                               // 218
   * Is called when queue is auto started                                                                            // 219
   */                                                                                                                // 220
  self.onAutostart = options && options.onAutostart || function() {                                                  // 221
    self.debug && console.log(self.title + ' Autostart');                                                            // 222
  };                                                                                                                 // 223
};                                                                                                                   // 224
                                                                                                                     // 225
  /** @method PowerQueue.prototype.processList                                                                       // 226
   * @reactive                                                                                                       // 227
   * @returns {array} List of tasks currently being processed                                                        // 228
   */                                                                                                                // 229
  PowerQueue.prototype.processingList = function() {                                                                 // 230
    var self = this;                                                                                                 // 231
    return self._processList.fetch();                                                                                // 232
  };                                                                                                                 // 233
                                                                                                                     // 234
  /** @method PowerQueue.prototype.isHalted                                                                          // 235
   * @reactive                                                                                                       // 236
   * @returns {boolean} True if the queue is not running or paused                                                   // 237
   */                                                                                                                // 238
  PowerQueue.prototype.isHalted = function() {                                                                       // 239
    var self = this;                                                                                                 // 240
    return (!self._running.get() || self._paused.get());                                                             // 241
  };                                                                                                                 // 242
                                                                                                                     // 243
  /** @method PowerQueue.prototype.length                                                                            // 244
   * @reactive                                                                                                       // 245
   * @returns {number} Number of tasks left in queue to be processed                                                 // 246
   */                                                                                                                // 247
  PowerQueue.prototype.length = function() {                                                                         // 248
    var self = this;                                                                                                 // 249
    return self.invocations.length();                                                                                // 250
  };                                                                                                                 // 251
                                                                                                                     // 252
  /** @method PowerQueue.prototype.progress                                                                          // 253
   * @reactive                                                                                                       // 254
   * @returns {number} 0 .. 100 % Indicates the status of the queue                                                  // 255
   */                                                                                                                // 256
  PowerQueue.prototype.progress = function() {                                                                       // 257
    var self = this;                                                                                                 // 258
    var progress = self._maxLength.get() - self.invocations.length() - self._isProcessing.get();                     // 259
    if (self._maxLength.value > 0) {                                                                                 // 260
      return Math.round(progress / self._maxLength.value * 100);                                                     // 261
    }                                                                                                                // 262
    return 0;                                                                                                        // 263
  };                                                                                                                 // 264
                                                                                                                     // 265
  /** @method PowerQueue.prototype.usage                                                                             // 266
   * @reactive                                                                                                       // 267
   * @returns {number} 0 .. 100 % Indicates resource usage of the queue                                              // 268
   */                                                                                                                // 269
  PowerQueue.prototype.usage = function() {                                                                          // 270
    var self = this;                                                                                                 // 271
    return Math.round(self._isProcessing.get() / self._maxProcessing.get() * 100);                                   // 272
  };                                                                                                                 // 273
                                                                                                                     // 274
  /** @method PowerQueue.prototype.reset Reset the queue                                                             // 275
   * Calling this will:                                                                                              // 276
   * * stop the queue                                                                                                // 277
   * * paused to false                                                                                               // 278
   * * Discart all queue data                                                                                        // 279
   *                                                                                                                 // 280
   * > NOTE: At the moment if the queue has processing tasks they can change                                         // 281
   * > the `errors` and `failures` counters. This could change in the future or                                      // 282
   * > be prevented by creating a whole new instance of the `PowerQueue`                                             // 283
   */                                                                                                                // 284
  PowerQueue.prototype.reset = function() {                                                                          // 285
    var self = this;                                                                                                 // 286
    self.debug && console.log(self.title + ' RESET');                                                                // 287
    self._running.set(false);                                                                                        // 288
    self._paused.set(false);                                                                                         // 289
    self.invocations.reset();                                                                                        // 290
    self._processList.reset();                                                                                       // 291
                                                                                                                     // 292
    // // Loop through the processing tasks and reset these                                                          // 293
    // self._processList.forEach(function(data) {                                                                    // 294
    //   if (data.queue instanceof PowerQueue) {                                                                     // 295
    //     data.queue.reset();                                                                                       // 296
    //   }                                                                                                           // 297
    // }, true);                                                                                                     // 298
    self._maxLength.set(0);                                                                                          // 299
    self._failures.set(0);                                                                                           // 300
    self._errors.set(0);                                                                                             // 301
  };                                                                                                                 // 302
                                                                                                                     // 303
  /** @method PowerQueue._autoStartTasks                                                                             // 304
   * @private                                                                                                        // 305
   *                                                                                                                 // 306
   * This method defines the autostart algorithm that allows add task to trigger                                     // 307
   * a start of the queue if queue is not paused.                                                                    // 308
   */                                                                                                                // 309
  PowerQueue.prototype._autoStartTasks = function() {                                                                // 310
    var self = this;                                                                                                 // 311
                                                                                                                     // 312
    // We dont start anything by ourselfs if queue is paused                                                         // 313
    if (!self._paused.value) {                                                                                       // 314
                                                                                                                     // 315
      // Queue is not running and we are set to autostart so we start the queue                                      // 316
      if (!self._running.value && self._autostart.value) {                                                           // 317
        // Trigger callback / event                                                                                  // 318
        self.onAutostart();                                                                                          // 319
        // Set queue as running                                                                                      // 320
        self._running.set(true);                                                                                     // 321
      }                                                                                                              // 322
                                                                                                                     // 323
      // Make sure that we use all available resources                                                               // 324
      if (self._running.value) {                                                                                     // 325
        // Call next to start up the queue                                                                           // 326
        self.next(null);                                                                                             // 327
      }                                                                                                              // 328
                                                                                                                     // 329
    }                                                                                                                // 330
  };                                                                                                                 // 331
                                                                                                                     // 332
  /** @method PowerQueue.prototype.add                                                                               // 333
   * @param {any} data The task to be handled                                                                        // 334
   * @param {number} [failures] Used internally to Pass on number of failures.                                       // 335
   */                                                                                                                // 336
  PowerQueue.prototype.add = function(data, failures, id) {                                                          // 337
    var self = this;                                                                                                 // 338
                                                                                                                     // 339
    // Assign new id to task                                                                                         // 340
    var assignNewId = self._jumpOnFailure || typeof id === 'undefined';                                              // 341
                                                                                                                     // 342
    // Set the task id                                                                                               // 343
    var taskId = (assignNewId) ? self._maxLength.value + 1 : id;                                                     // 344
                                                                                                                     // 345
    // self.invocations.add({ _id: currentId, data: data, failures: failures || 0 }, reversed);                      // 346
    self.invocations.insert(taskId, { _id: taskId, data: data, failures: failures || 0 });                           // 347
                                                                                                                     // 348
    // If we assigned new id then increase length                                                                    // 349
    if (assignNewId) self._maxLength.inc();                                                                          // 350
                                                                                                                     // 351
    self._autoStartTasks();                                                                                          // 352
  };                                                                                                                 // 353
                                                                                                                     // 354
  /** @method PowerQueue.prototype.updateThrottleUp                                                                  // 355
   * @private                                                                                                        // 356
   *                                                                                                                 // 357
   * Calling this method will update the throttle on the queue adding tasks.                                         // 358
   *                                                                                                                 // 359
   * > Note: Currently we only support the PowerQueue - but we could support                                         // 360
   * > a more general interface for pauseable tasks or other usecases.                                               // 361
   */                                                                                                                // 362
  PowerQueue.prototype.updateThrottleUp = function() {                                                               // 363
    var self = this;                                                                                                 // 364
                                                                                                                     // 365
    // How many additional tasks can we handle?                                                                      // 366
    var availableSlots = self._maxProcessing.value - self._isProcessing.value;                                       // 367
    // If we can handle more, we have more, we're running, and we're not paused                                      // 368
    if (!self._paused.value && self._running.value && availableSlots > 0 && self.invocations._length > 0) {          // 369
      // Increase counter of current number of tasks being processed                                                 // 370
      self._isProcessing.inc();                                                                                      // 371
      // Run task                                                                                                    // 372
      self.runTask(self.invocations.getFirstItem());                                                                 // 373
      // Repeat recursively; this is better than a for loop to avoid blocking the UI                                 // 374
      self.updateThrottleUp();                                                                                       // 375
    }                                                                                                                // 376
                                                                                                                     // 377
  };                                                                                                                 // 378
                                                                                                                     // 379
  /** @method PowerQueue.prototype.updateThrottleDown                                                                // 380
   * @private                                                                                                        // 381
   *                                                                                                                 // 382
   * Calling this method will update the throttle on the queue pause tasks.                                          // 383
   *                                                                                                                 // 384
   * > Note: Currently we only support the PowerQueue - but we could support                                         // 385
   * > a more general interface for pauseable tasks or other usecases.                                               // 386
   */                                                                                                                // 387
  PowerQueue.prototype.updateThrottleDown = function() {                                                             // 388
    var self = this;                                                                                                 // 389
    // Calculate the differece between acutuall processing tasks and target                                          // 390
    var diff = self._isProcessing.value - self._maxProcessing.value;                                                 // 391
                                                                                                                     // 392
    // If the diff is more than 0 then we have many tasks processing.                                                // 393
    if (diff > 0) {                                                                                                  // 394
      // We pause the latest added tasks                                                                             // 395
      self._processList.forEachReverse(function(data) {                                                              // 396
        if (diff > 0 && data.queue instanceof PowerQueue) {                                                          // 397
          diff--;                                                                                                    // 398
          // We dont mind calling pause on multiple times on each task                                               // 399
          // theres a simple check going on preventing any duplicate actions                                         // 400
          data.queue.pause();                                                                                        // 401
        }                                                                                                            // 402
      }, true);                                                                                                      // 403
    }                                                                                                                // 404
  };                                                                                                                 // 405
                                                                                                                     // 406
  /** @method PowerQueue.prototype.next                                                                              // 407
   * @param {string} [err] Error message if task failed                                                              // 408
   * > * Can pass in `null` to start the queue                                                                       // 409
   * > * Passing in a string to `next` will trigger a failure                                                        // 410
   * > * Passing nothing will simply let the next task run                                                           // 411
   * `next` is handed into the [taskHandler](PowerQueue.taskHandler) as a                                            // 412
   * callback to mark an error or end of current task                                                                // 413
   */                                                                                                                // 414
  PowerQueue.prototype.next = function(err) {                                                                        // 415
    var self = this;                                                                                                 // 416
    // Primary concern is to throttle up because we are either:                                                      // 417
    // 1. Starting the queue                                                                                         // 418
    // 2. Starting next task                                                                                         // 419
    //                                                                                                               // 420
    // This function does not shut down running tasks                                                                // 421
    self.updateThrottleUp();                                                                                         // 422
                                                                                                                     // 423
    // We are running, no tasks are being processed even we just updated the                                         // 424
    // throttle up and we got no errors.                                                                             // 425
    // 1. We are paused and releasing tasks                                                                          // 426
    // 2. We are done                                                                                                // 427
    if (self._running.value && self._isProcessing.value === 0 && err !== null) {                                     // 428
                                                                                                                     // 429
      // We have no tasks processing so this queue is now releasing resources                                        // 430
      // this could be that the queue is paused or stopped, in that case the                                         // 431
      // self.invocations._length would be > 0                                                                       // 432
      // If on the other hand the self.invocations._length is 0 then we have no more                                 // 433
      // tasks in the queue so the queue has ended                                                                   // 434
      self.onRelease(self.invocations._length);                                                                      // 435
                                                                                                                     // 436
      if (!self.invocations._length) { // !self._paused.value &&                                                     // 437
        // Check if queue is done working                                                                            // 438
        // Stop the queue                                                                                            // 439
        self._running.set(false);                                                                                    // 440
        // self.invocations.reset(); // This should be implicit                                                      // 441
        self.onEnded();                                                                                              // 442
      }                                                                                                              // 443
                                                                                                                     // 444
    }                                                                                                                // 445
  };                                                                                                                 // 446
                                                                                                                     // 447
  /** @callback done                                                                                                 // 448
   * @param {Meteor.Error | Error | String | null} [feedback] This allows the task to communicate with the queue     // 449
   *                                                                                                                 // 450
   * Explaination of `feedback`                                                                                      // 451
   * * `Meteor.Error` This means that the task failed in a controlled manner and is allowed to rerun                 // 452
   * * `Error` This will throw the passed error - as its an unitended error                                          // 453
   * * `null` The task is not done yet, rerun later                                                                  // 454
   * * `String` The task can perform certain commands on the queue                                                   // 455
   *    * "pause" - pause the queue                                                                                  // 456
   *    * "stop" - stop the queue                                                                                    // 457
   *    * "reset" - reset the queue                                                                                  // 458
   *    * "cancel" - cancel the queue                                                                                // 459
   *                                                                                                                 // 460
   */                                                                                                                // 461
                                                                                                                     // 462
                                                                                                                     // 463
  /** @method PowerQueue.prototype.runTaskDone                                                                       // 464
   * @private                                                                                                        // 465
   * @param {Meteor.Error | Error | String | null} [feedback] This allows the task to communicate with the queue     // 466
   * @param {object} invocation                                                                                      // 467
   *                                                                                                                 // 468
   * > Note: `feedback` is explained in [Done callback](#done)                                                       // 469
   *                                                                                                                 // 470
   */                                                                                                                // 471
  // Rig the callback function                                                                                       // 472
  PowerQueue.prototype.runTaskDone = function(feedback, invocation) {                                                // 473
    var self = this;                                                                                                 // 474
                                                                                                                     // 475
    // If the task handler throws an error then add it to the queue again                                            // 476
    // we allow this for a max of self._maxFailures                                                                  // 477
    // If the error is null then we add the task silently back into the                                              // 478
    // microQueue in reverse... This could be due to pause or throttling                                             // 479
    if (feedback instanceof Meteor.Error) {                                                                          // 480
      // We only count failures if maxFailures are above 0                                                           // 481
      if (self._maxFailures.value > 0) invocation.failures++;                                                        // 482
      self._failures.inc();                                                                                          // 483
                                                                                                                     // 484
      // If the user has set the debug flag we print out failures/errors                                             // 485
      console.error('Error: "' + self.title + '" ' + feedback.message + ', ' + feedback.stack);                      // 486
                                                                                                                     // 487
      if (invocation.failures < self._maxFailures.value) {                                                           // 488
        // Add the task again with the increased failures                                                            // 489
        self.add(invocation.data, invocation.failures, invocation._id);                                              // 490
      } else {                                                                                                       // 491
        self._errors.inc();                                                                                          // 492
        self.errorHandler(invocation.data, self.add, invocation.failures);                                           // 493
      }                                                                                                              // 494
                                                                                                                     // 495
      // If a error is thrown we assume its not intended                                                             // 496
    } else if (feedback instanceof Error) throw feedback;                                                            // 497
                                                                                                                     // 498
    if (feedback)                                                                                                    // 499
                                                                                                                     // 500
    // We use null to throttle pauseable tasks                                                                       // 501
    if (feedback === null) {                                                                                         // 502
      // We add this task into the queue, no questions asked                                                         // 503
      self.invocations.insert(invocation._id, { data: invocation.data, failures: invocation.failures, _id: invocation._id });
    }                                                                                                                // 505
                                                                                                                     // 506
    // If the user returns a string we got a command                                                                 // 507
    if (feedback === ''+feedback) {                                                                                  // 508
      var command = {                                                                                                // 509
        'pause': function() { self.pause(); },                                                                       // 510
        'stop': function() { self.stop(); },                                                                         // 511
        'reset': function() { self.reset(); },                                                                       // 512
        'cancel': function() { self.cancel(); },                                                                     // 513
      };                                                                                                             // 514
      if (typeof command[feedback] === 'function') {                                                                 // 515
        // Run the command on this queue                                                                             // 516
        command[feedback]();                                                                                         // 517
      } else {                                                                                                       // 518
        // We dont recognize this command, throw an error                                                            // 519
        throw new Error('Unknown queue command "' + feedback + '"');                                                 // 520
      }                                                                                                              // 521
    }                                                                                                                // 522
    // Decrease the number of tasks being processed                                                                  // 523
    // make sure we dont go below 0                                                                                  // 524
    if (self._isProcessing.value > 0) self._isProcessing.dec();                                                      // 525
    // Task has ended we remove the task from the process list                                                       // 526
    self._processList.remove(invocation._id);                                                                        // 527
                                                                                                                     // 528
    invocation.data = null;                                                                                          // 529
    invocation.failures = null;                                                                                      // 530
    invocation._id = null;                                                                                           // 531
    invocation = null;                                                                                               // 532
    delete invocation;                                                                                               // 533
    // Next task                                                                                                     // 534
    Meteor.setTimeout(function() {                                                                                   // 535
      self.next();                                                                                                   // 536
    }, 0);                                                                                                           // 537
                                                                                                                     // 538
  };                                                                                                                 // 539
                                                                                                                     // 540
                                                                                                                     // 541
  /** @method PowerQueue.prototype.runTask                                                                           // 542
   * @private // This is not part of the open api                                                                    // 543
   * @param {object} invocation The object stored in the micro-queue                                                 // 544
   */                                                                                                                // 545
  PowerQueue.prototype.runTask = function(invocation) {                                                              // 546
    var self = this;                                                                                                 // 547
                                                                                                                     // 548
    // We start the fitting task handler                                                                             // 549
    // Currently we only support the PowerQueue but we could have a more general                                     // 550
    // interface for tasks that allow throttling                                                                     // 551
    try {                                                                                                            // 552
      if (invocation.data instanceof PowerQueue) {                                                                   // 553
                                                                                                                     // 554
        // Insert PowerQueue into process list                                                                       // 555
        self._processList.insert(invocation._id, { id: invocation._id, queue: invocation.data });                    // 556
        // Handle task                                                                                               // 557
        self.queueTaskHandler(invocation.data, function subQueueCallbackDone(feedback) {                             // 558
          self.runTaskDone(feedback, invocation);                                                                    // 559
        }, invocation.failures);                                                                                     // 560
                                                                                                                     // 561
      } else {                                                                                                       // 562
                                                                                                                     // 563
        // Insert task into process list                                                                             // 564
        self._processList.insert(invocation._id, invocation.data);                                                   // 565
        // Handle task                                                                                               // 566
        self.taskHandler(invocation.data, function taskCallbackDone(feedback) {                                      // 567
          self.runTaskDone(feedback, invocation);                                                                    // 568
        }, invocation.failures);                                                                                     // 569
                                                                                                                     // 570
      }                                                                                                              // 571
    } catch(err) {                                                                                                   // 572
      throw new Error('Error while running taskHandler for queue, Error: ' + err.message);                           // 573
    }                                                                                                                // 574
  };                                                                                                                 // 575
                                                                                                                     // 576
  /** @method PowerQueue.prototype.queueTaskHandler                                                                  // 577
   * This method handles tasks that are sub queues                                                                   // 578
   */                                                                                                                // 579
  PowerQueue.prototype.queueTaskHandler = function(subQueue, next, failures) {                                       // 580
    var self = this;                                                                                                 // 581
    // Monitor sub queue task releases                                                                               // 582
    subQueue.onRelease = function(remaining) {                                                                       // 583
      // Ok, we were paused - this could be throttling so we respect this                                            // 584
      // So when the queue is halted we add it back into the main queue                                              // 585
      if (remaining > 0) {                                                                                           // 586
        // We get out of the queue but dont repport error and add to run later                                       // 587
        next(null);                                                                                                  // 588
      } else {                                                                                                       // 589
        // Queue has ended                                                                                           // 590
        // We simply trigger next task when the sub queue is complete                                                // 591
        next();                                                                                                      // 592
        // When running subqueues it doesnt make sense to track failures and retry                                   // 593
        // the sub queue - this is sub queue domain                                                                  // 594
      }                                                                                                              // 595
    };                                                                                                               // 596
                                                                                                                     // 597
    // Start the queue                                                                                               // 598
    subQueue.run();                                                                                                  // 599
  };                                                                                                                 // 600
                                                                                                                     // 601
  /** @callback PowerQueue.prototype.taskHandler                                                                     // 602
   * @param {any} data This can be data or functions                                                                 // 603
   * @param {function} next Function `next` call this to end task                                                    // 604
   * @param {number} failures Number of failures on this task                                                        // 605
   *                                                                                                                 // 606
   * Default task handler expects functions as data:                                                                 // 607
   * ```js                                                                                                           // 608
   *   self.taskHandler = function(data, next, failures) {                                                           // 609
   *     // This default task handler expects invocation to be a function to run                                     // 610
   *     if (typeof data !== 'function') {                                                                           // 611
   *       throw new Error('Default task handler expects a function');                                               // 612
   *     }                                                                                                           // 613
   *     try {                                                                                                       // 614
   *       // Have the function call next                                                                            // 615
   *       data(next, failures);                                                                                     // 616
   *     } catch(err) {                                                                                              // 617
   *       // Throw to fail this task                                                                                // 618
   *       next(err);                                                                                                // 619
   *     }                                                                                                           // 620
   *   };                                                                                                            // 621
   * ```                                                                                                             // 622
   */                                                                                                                // 623
                                                                                                                     // 624
  // Can be overwrittin by the user                                                                                  // 625
  PowerQueue.prototype.taskHandler = function(data, next, failures) {                                                // 626
    var self = this;                                                                                                 // 627
    // This default task handler expects invocation to be a function to run                                          // 628
    if (typeof data !== 'function') {                                                                                // 629
      throw new Error('Default task handler expects a function');                                                    // 630
    }                                                                                                                // 631
    try {                                                                                                            // 632
      // Have the function call next                                                                                 // 633
      data(next, failures);                                                                                          // 634
    } catch(err) {                                                                                                   // 635
      // Throw to fail this task                                                                                     // 636
      next(err);                                                                                                     // 637
    }                                                                                                                // 638
  };                                                                                                                 // 639
                                                                                                                     // 640
  /** @callback PowerQueue.prototype.errorHandler                                                                    // 641
   * @param {any} data This can be data or functions                                                                 // 642
   * @param {function} addTask Use this function to insert the data into the queue again                             // 643
   * @param {number} failures Number of failures on this task                                                        // 644
   *                                                                                                                 // 645
   * The default callback:                                                                                           // 646
   * ```js                                                                                                           // 647
   *   var foo = new PowerQueue();                                                                                   // 648
   *                                                                                                                 // 649
   *   // Overwrite the default action                                                                               // 650
   *   foo.errorHandler = function(data, addTask, failures) {                                                        // 651
   *     // This could be overwritten the data contains the task data and addTask                                    // 652
   *     // is a helper for adding the task to the queue                                                             // 653
   *     // try again: addTask(data);                                                                                // 654
   *     // console.log('Terminate at ' + failures + ' failures');                                                   // 655
   *   };                                                                                                            // 656
   * ```                                                                                                             // 657
   */                                                                                                                // 658
  PowerQueue.prototype.errorHandler = function(data, addTask, failures) {                                            // 659
    var self = this;                                                                                                 // 660
    // This could be overwritten the data contains the task data and addTask                                         // 661
    // is a helper for adding the task to the queue                                                                  // 662
    // try again: addTask(data);                                                                                     // 663
    self.debug && console.log('Terminate at ' + failures + ' failures');                                             // 664
  };                                                                                                                 // 665
                                                                                                                     // 666
  /** @method PowerQueue.prototype.pause Pause the queue                                                             // 667
   * @todo We should have it pause all processing tasks                                                              // 668
   */                                                                                                                // 669
  PowerQueue.prototype.pause = function() {                                                                          // 670
    var self = this;                                                                                                 // 671
    if (!self._paused.value) {                                                                                       // 672
                                                                                                                     // 673
      self._paused.set(true);                                                                                        // 674
      // Loop through the processing tasks and pause these                                                           // 675
      self._processList.forEach(function(data) {                                                                     // 676
        if (data.queue instanceof PowerQueue) {                                                                      // 677
          // Pause the sub queue                                                                                     // 678
          data.queue.pause();                                                                                        // 679
        }                                                                                                            // 680
      }, true);                                                                                                      // 681
                                                                                                                     // 682
      // Trigger callback                                                                                            // 683
      self.onPaused();                                                                                               // 684
    }                                                                                                                // 685
  };                                                                                                                 // 686
                                                                                                                     // 687
  /** @method PowerQueue.prototype.resume Start a paused queue                                                       // 688
   * @todo We should have it resume all processing tasks                                                             // 689
   *                                                                                                                 // 690
   * > This will not start a stopped queue                                                                           // 691
   */                                                                                                                // 692
  PowerQueue.prototype.resume = function() {                                                                         // 693
    var self = this;                                                                                                 // 694
    self.run();                                                                                                      // 695
  };                                                                                                                 // 696
                                                                                                                     // 697
  /** @method PowerQueue.prototype.run Starts the queue                                                              // 698
   * > Using this command will resume a paused queue and will                                                        // 699
   * > start a stopped queue.                                                                                        // 700
   */                                                                                                                // 701
  PowerQueue.prototype.run = function() {                                                                            // 702
    var self = this;                                                                                                 // 703
    //not paused and already running or queue empty or paused subqueues                                              // 704
    if (!self._paused.value && self._running.value || !self.invocations._length) {                                   // 705
      return;                                                                                                        // 706
    }                                                                                                                // 707
                                                                                                                     // 708
    self._paused.set(false);                                                                                         // 709
    self._running.set(true);                                                                                         // 710
    self.next(null);                                                                                                 // 711
  };                                                                                                                 // 712
                                                                                                                     // 713
  /** @method PowerQueue.prototype.stop Stops the queue                                                              // 714
   */                                                                                                                // 715
  PowerQueue.prototype.stop = function() {                                                                           // 716
    var self = this;                                                                                                 // 717
    self._running.set(false);                                                                                        // 718
  };                                                                                                                 // 719
                                                                                                                     // 720
  /** @method PowerQueue.prototype.cancel Cancel the queue                                                           // 721
   */                                                                                                                // 722
  PowerQueue.prototype.cancel = function() {                                                                         // 723
    var self = this;                                                                                                 // 724
    self.reset();                                                                                                    // 725
  };                                                                                                                 // 726
                                                                                                                     // 727
                                                                                                                     // 728
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 738
}).call(this);                                                       // 739
                                                                     // 740
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:power-queue'] = {
  PowerQueue: PowerQueue
};

})();

//# sourceMappingURL=cfs_power-queue.js.map
