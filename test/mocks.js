// contains mock objects used in testing

function compileTemplate (opts) {

  opts = opts || {};

  opts = {
    ngModel: opts.ngModel || 'file',
    event: opts.event || 'none',
    handler: opts.handler || 'none',
    multiple: opts.multiple || false
  };

  template = "<input type='file' ng-model='"+opts.ngModel+"' base-sixty-four-input "+opts.event+"='"+opts.handler+"' "+(opts.multiple? 'multiple': '')+">";
  $scope = $rootScope.$new();
  elem = angular.element(template);
  compiled = $compile(elem)($scope);
  $scope.$digest();
}

function FileReaderMock() {
  var self = this;
  // var EVENTS = ['onload', 'onloadstart', 'onloadend', 'onerror', 'onabort'];

  var event = {
    target: {
      result: null
    }
  };

  self.result = null;

  self.triggerEvent = function (eventName) {
    if (typeof self[eventName] === 'function') {
      event.target.result = self.result;
      self[eventName](event);
    }
  };

  self.readAsArrayBuffer = function () {
    self.triggerEvent('onload');
  };

  self.abort = function () {
    self.triggerEvent('onabort');
  };

  return self;
}

$window = {
  _arrayBufferToBase64: function () {
    return 'base64-mock-string';
  },
  FileReader: FileReaderMock
};