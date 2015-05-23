describe('angular-base64-upload', function(){

  var template = "<input type='file' ng-model='yourModel' base-sixty-four-input on-change='onChangeHandler'>";
  var $compile;
  var $rootScope;
  var $scope;
  var $window;
  var elem;
  var compiled;

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

  var fileMock = {
    type: 'image/jpeg',
    name: 'this-is-an-image-name.jpg',
    size: 343434,
  };

  var filesMock = [];

  for (var i = 10; i >= 0; i--) {
    filesMock[i] = fileMock;
  }

  var eventMock = {
    type: 'change',
    target: {
      files: filesMock
    }
  };

  beforeEach(function(){
    module('naif.base64');

    module(function ($provide) {
      $provide.value('$window', $window);
    });

    inject(function($injector){

      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();
      elem = angular.element(template);
      compiled = $compile(elem)($scope);
      $scope.$digest();
    });

  });

  afterEach(function() {
    $scope.$destroy();
  });

  it('should should trigger on-change handler', function(){

    eventMock.target.files = [fileMock];
    $scope.onChangeHandler = function (e, fileList) {
      expect(e.target.files).toBe(fileList);
      expect(fileList).toBe(eventMock.target.files);
    };

    elem.triggerHandler(eventMock);
  });

});
