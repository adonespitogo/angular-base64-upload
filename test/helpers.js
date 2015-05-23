function compileTemplate (opts) {

  opts = opts || {};

  opts = {
    ngModel: opts.ngModel || 'model',
    events: opts.events || [],
    multiple: opts.multiple || false
  };

  template = "<input type='file' base-sixty-four-input>";
  $scope = $rootScope.$new();
  elem = angular.element(template);

  elem.attr('ng-model', opts.ngModel);

  // attach events
  for (var i = opts.events.length - 1; i >= 0; i--) {
    var e = opts.events[i];
    elem.attr(e.name, e.bindTo);
    $scope[e.bindTo] = e.handler;
  }

  if (opts.multiple) {
    elem.attr('multiple', true);
  }

  compiled = $compile(elem)($scope);
  $scope.$digest();
}