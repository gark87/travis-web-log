(function() {
  var HTMLEncode, domToHtml;

  eval(require('fs').readFileSync('vendor/jsdom-level1-core.js', 'utf-8'));

  eval(require('fs').readFileSync('vendor/jsdom-level2-core.js', 'utf-8'));

  eval(require('fs').readFileSync('vendor/jsdom-browser-htmlencode.js', 'utf-8'));

  eval(require('fs').readFileSync('vendor/jsdom-browser-domtohtml.js', 'utf-8'));

  HTMLEncode = exports.HTMLEncode;

  domToHtml = exports.domToHtml;

  core.Element.prototype.__defineGetter__('innerHTML', function() {
    var type;
    if (/^(?:script|style)$/.test(this._tagName)) {
      type = this.getAttribute('type');
      if (!type || /^text\//i.test(type) || /\/javascript$/i.test(type)) {
        domToHtml(this._childNodes, true, true);
      }
    }
    return domToHtml(this._childNodes, true);
  });

  exports.Document = core.Document;

}).call(this);
