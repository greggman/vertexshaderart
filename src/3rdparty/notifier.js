define([], function() {

  function Notifier(options) {
    var _timeout = options.timeout || 10;

    var _container = document.createElement("div");
    _container.className = "notifier";
    options.container.appendChild(_container);

    function removeMsg(div) {
      div.parentNode.removeChild(div);
    }

    this.add = function(options) {
      var msgDiv = document.createElement("div");
      if (options.html) {
        msgDiv.innerHTML = options.html;
      } else if (options.text) {
        msgDiv.appendChild(document.createTextNode(options.text));
      } else {
        throw "neither options.text nor options.html was set";
      }

      _container.insertBefore(msgDiv, _container.lastChild);
      var timeout = (options.timeout || _timeout);
      if (timeout > 200) {
        throw "are you sure you want a timeout " + timeout + " seconds long?";
      }
      setTimeout(function() {
        removeMsg(msgDiv);
      }, timeout * 1000);

      return msgDiv;
    }
  }

  return Notifier;
});

