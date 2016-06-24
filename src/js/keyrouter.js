define([], function() {
  function getMods(e) {
    return '' + // this must be in alphabetical order
      (e.altKey   ? 'a' : '') +
      (e.ctrlKey  ? 'c' : '') +
      (e.shiftKey ? 's' : '') +
      (e.metaKey  ? 'm' : '');
  }

  function prepMods(mods) {
    var chars = Array.prototype.map.call(mods.toLowerCase(), function(c) {
      return c;
    });
    chars.sort();
    return chars.join("");
  }

  /**
   * Routes keys based on keycode and modifier
   */
  function KeyRouter() {
    this.handlers = {};
  }

  /**
   * Routes a key
   * @param {Event} e the key event
   * @return {bool} true if event was routed
   */
  KeyRouter.prototype.handleKeyDown = function(e) {
    var keyId = e.keyCode + ':' + getMods(e);
    var handler = this.handlers[keyId];
    if (handler) {
      handler(e);
      return true;
    }
    return false;
  };

  /**
   * @param {number} keyCode the keycode
   * @param {string} [mods] the modifiers where
   *   's' = shift, 'c' = ctrl, 'a' = alt, 'm' = meta (apple key, windows key)
   * @param {function(Event}) handler the funciton to call when key is pressed
   */
  KeyRouter.prototype.on = function(keyCode, mods, handler) {
    if (handler === undefined) {
      handler = mods;
      mods = '';
    }
    var keyId = keyCode + ':' + prepMods(mods);
    this.handlers[keyId] = handler;
  };

  return KeyRouter;
});

