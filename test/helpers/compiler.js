// helper functions

function _compile (opts) {

  opts = opts || {};

  opts = {
    attrs: opts.attrs || [],
    events: opts.events || [],
    scope: opts.scope || $ROOTSCOPE.$new()
  };

  var template = "<input type='file' base-sixty-four-input>";
  var scope = opts.scope;
  var elem = $(template);

  // attach events
  for (var i = opts.events.length - 1; i >= 0; i--) {
    var e = opts.events[i];
    elem.attr(e.name, e.bindTo);
    scope[e.bindTo] = e.handler;
  }

  for (var ii = opts.attrs.length - 1; ii >= 0; ii--) {
    var attr = opts.attrs[ii];
    elem.attr(attr['attr'], attr['val']);
  }

  var form = $('<form name="form"></form>');
  form.append(elem);

  var compiled = $COMPILE(form)(scope);
  scope.$digest();

  return {
    '$input': elem,
    '$scope': scope,
    '$compiled': compiled
  };

}
